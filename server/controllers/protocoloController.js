const Protocolo = require('../models/Protocolo');
const Movimentacao = require('../models/Movimentacao');
const { gerarNumeroProtocolo } = require('../utils/geradores');

// Criar novo protocolo
exports.criarProtocolo = async (req, res) => {
  try {
    const numeroProtocolo = await gerarNumeroProtocolo();
    
    const novoProtocolo = new Protocolo({
      numero: numeroProtocolo,
      paciente: req.body.paciente,
      tipoSolicitacao: req.body.tipoSolicitacao,
      prioridade: req.body.prioridade,
      setorAtual: req.body.setorAtual,
      observacoes: req.body.observacoes,
      dataPrazo: req.body.dataPrazo,
      criadoPor: req.usuario.id
    });

    const protocolo = await novoProtocolo.save();

    // Registrar primeira movimentação
    const movimentacao = new Movimentacao({
      protocolo: protocolo._id,
      setorOrigem: req.body.setorAtual,
      setorDestino: req.body.setorAtual,
      responsavel: req.usuario.id,
      observacao: 'Protocolo criado'
    });

    await movimentacao.save();

    res.status(201).json({
      sucesso: true,
      data: protocolo
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar protocolo',
      erro: error.message
    });
  }
};

// Buscar todos os protocolos com filtros
exports.buscarProtocolos = async (req, res) => {
  try {
    const {
      numero,
      nomePaciente,
      tipoSolicitacao,
      status,
      setorAtual,
      prioridade,
      dataInicio,
      dataFim
    } = req.query;

    // Construir filtro
    let filtro = {};

    if (numero) filtro.numero = numero;
    if (nomePaciente) filtro['paciente.nome'] = { $regex: nomePaciente, $options: 'i' };
    if (tipoSolicitacao) filtro.tipoSolicitacao = tipoSolicitacao;
    if (status) filtro.status = status;
    if (setorAtual) filtro.setorAtual = setorAtual;
    if (prioridade) filtro.prioridade = prioridade;

    // Filtro de data
    if (dataInicio || dataFim) {
      filtro.dataEntrada = {};
      if (dataInicio) filtro.dataEntrada.$gte = new Date(dataInicio);
      if (dataFim) filtro.dataEntrada.$lte = new Date(dataFim);
    }

    // Aplicar restrições baseadas no perfil do usuário
    if (req.usuario.perfil === 'colaborador') {
      filtro.setorAtual = req.usuario.setor;
    } else if (req.usuario.perfil === 'prestador') {
      // Lógica para prestadores
    }

    const protocolos = await Protocolo.find(filtro)
      .populate('setorAtual', 'nome')
      .populate('criadoPor', 'nome')
      .sort({ dataEntrada: -1 });

    res.status(200).json({
      sucesso: true,
      contagem: protocolos.length,
      data: protocolos
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar protocolos',
      erro: error.message
    });
  }
};

// Buscar protocolo por ID
exports.buscarProtocoloPorId = async (req, res) => {
  try {
    const protocolo = await Protocolo.findById(req.params.id)
      .populate('setorAtual', 'nome')
      .populate('criadoPor', 'nome');

    if (!protocolo) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    // Buscar histórico de movimentações
    const movimentacoes = await Movimentacao.find({ protocolo: req.params.id })
      .populate('setorOrigem', 'nome')
      .populate('setorDestino', 'nome')
      .populate('responsavel', 'nome')
      .sort({ dataHora: 1 });

    res.status(200).json({
      sucesso: true,
      data: {
        protocolo,
        movimentacoes
      }
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar protocolo',
      erro: error.message
    });
  }
};

// Atualizar protocolo
exports.atualizarProtocolo = async (req, res) => {
  try {
    const { id } = req.params;
    const atualizacoes = req.body;

    // Remover campos que não devem ser atualizados diretamente
    delete atualizacoes.numero;
    delete atualizacoes.dataEntrada;
    delete atualizacoes.criadoPor;

    const protocolo = await Protocolo.findByIdAndUpdate(
      id,
      { $set: atualizacoes },
      { new: true, runValidators: true }
    );

    if (!protocolo) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    res.status(200).json({
      sucesso: true,
      data: protocolo
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar protocolo',
      erro: error.message
    });
  }
};

// Mover protocolo para outro setor
exports.moverProtocolo = async (req, res) => {
  try {
    const { id } = req.params;
    const { setorDestino, observacao } = req.body;

    const protocolo = await Protocolo.findById(id);

    if (!protocolo) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    const setorOrigem = protocolo.setorAtual;

    // Atualizar setor atual do protocolo
    protocolo.setorAtual = setorDestino;
    await protocolo.save();

    // Registrar movimentação
    const movimentacao = new Movimentacao({
      protocolo: id,
      setorOrigem,
      setorDestino,
      responsavel: req.usuario.id,
      observacao
    });

    await movimentacao.save();

    res.status(200).json({
      sucesso: true,
      mensagem: 'Protocolo movido com sucesso',
      data: {
        protocolo,
        movimentacao
      }
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao mover protocolo',
      erro: error.message
    });
  }
};

// Anexar documento ao protocolo
exports.anexarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipo, url } = req.body;

    const protocolo = await Protocolo.findById(id);

    if (!protocolo) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    protocolo.documentos.push({
      nome,
      tipo,
      url,
      dataUpload: new Date()
    });

    await protocolo.save();

    res.status(200).json({
      sucesso: true,
      mensagem: 'Documento anexado com sucesso',
      data: protocolo
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao anexar documento',
      erro: error.message
    });
  }
};