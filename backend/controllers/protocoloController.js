const Protocolo = require('../models/Protocolo');
const Movimentacao = require('../models/Movimentacao');
const Notificacao = require('../models/Notificacao');
const { gerarNumeroProtocolo } = require('../utils/helpers');

exports.criarProtocolo = async (req, res) => {
    try {
        const { 
            nome_paciente, 
            tipo_solicitacao, 
            prioridade, 
            descricao, 
            setor_atual 
        } = req.body;

        // Gerar número único de protocolo
        const numero_protocolo = gerarNumeroProtocolo();

        const novoProtocolo = await Protocolo.create({
            numero_protocolo,
            nome_paciente,
            tipo_solicitacao,
            prioridade,
            descricao,
            setor_atual,
            criado_por: req.usuario.id
        });

        // Registrar a primeira movimentação
        await Movimentacao.create({
            protocolo_id: novoProtocolo.id,
            setor_origem: 'Entrada',
            setor_destino: setor_atual,
            usuario_id: req.usuario.id,
            observacao: 'Protocolo criado'
        });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Protocolo criado com sucesso',
            protocolo: novoProtocolo
        });
    } catch (error) {
        console.error('Erro ao criar protocolo:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar protocolo',
            erro: error.message
        });
    }
};

exports.listarProtocolos = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const protocolos = await Protocolo.findAll({
            limit,
            offset,
            order: [['data_entrada', 'DESC']]
        });
        
        const total = await Protocolo.count();
        
        res.status(200).json({
            sucesso: true,
            protocolos,
            paginacao: {
                total,
                pagina_atual: parseInt(page),
                total_paginas: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao listar protocolos:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar protocolos',
            erro: error.message
        });
    }
};

exports.buscarProtocolos = async (req, res) => {
    try {
        const { 
            numero_protocolo, 
            nome_paciente, 
            tipo_solicitacao, 
            status, 
            setor_atual,
            prioridade,
            data_inicio,
            data_fim
        } = req.query;
        
        // Construir condições de busca
        const where = {};
        
        if (numero_protocolo) where.numero_protocolo = numero_protocolo;
        if (nome_paciente) where.nome_paciente = { [Op.iLike]: `%${nome_paciente}%` };
        if (tipo_solicitacao) where.tipo_solicitacao = tipo_solicitacao;
        if (status) where.status = status;
        if (setor_atual) where.setor_atual = setor_atual;
        if (prioridade) where.prioridade = prioridade;
        
        // Filtro por data
        if (data_inicio && data_fim) {
            where.data_entrada = {
                [Op.between]: [new Date(data_inicio), new Date(data_fim)]
            };
        } else if (data_inicio) {
            where.data_entrada = { [Op.gte]: new Date(data_inicio) };
        } else if (data_fim) {
            where.data_entrada = { [Op.lte]: new Date(data_fim) };
        }
        
        const protocolos = await Protocolo.findAll({ where });
        
        res.status(200).json({
            sucesso: true,
            resultados: protocolos.length,
            protocolos
        });
    } catch (error) {
        console.error('Erro ao buscar protocolos:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar protocolos',
            erro: error.message
        });
    }
};

exports.movimentarProtocolo = async (req, res) => {
    try {
        const { id } = req.params;
        const { setor_destino, observacao } = req.body;
        
        const protocolo = await Protocolo.findByPk(id);
        
        if (!protocolo) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Protocolo não encontrado'
            });
        }
        
        const setor_origem = protocolo.setor_atual;
        
        // Atualizar setor atual do protocolo
        await protocolo.update({
            setor_atual: setor_destino,
            ultima_atualizacao: new Date()
        });
        
        // Registrar movimentação
        await Movimentacao.create({
            protocolo_id: id,
            setor_origem,
            setor_destino,
            usuario_id: req.usuario.id,
            observacao
        });
        
        // Criar notificação para usuários do setor de destino
        await Notificacao.criarNotificacaoSetor(
            setor_destino,
            id,
            `Protocolo ${protocolo.numero_protocolo} movimentado para seu setor`,
            'informacao'
        );
        
        res.status(200).json({
            sucesso: true,
            mensagem: 'Protocolo movimentado com sucesso',
            protocolo
        });
    } catch (error) {
        console.error('Erro ao movimentar protocolo:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao movimentar protocolo',
            erro: error.message
        });
    }
};

// Implementação dos demais métodos...