const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Registrar novo usuário (apenas admin pode fazer isso)
exports.registrar = async (req, res) => {
  try {
    // Verificar se o usuário atual é admin
    if (req.usuario && req.usuario.perfil !== 'admin') {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Apenas administradores podem registrar novos usuários.'
      });
    }

    const { nome, email, senha, perfil, setor } = req.body;

    // Verificar se o usuário já existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Usuário já existe'
      });
    }

    // Criar novo usuário
    usuario = new Usuario({
      nome,
      email,
      senha,
      perfil,
      setor
    });

    await usuario.save();

    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário registrado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao registrar usuário',
      erro: error.message
    });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se o usuário existe
    const usuario = await Usuario.findOne({ email }).populate('setor', 'nome');
    if (!usuario) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
      });
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário desativado. Contate o administrador.'
      });
    }

    // Verificar senha
    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
      });
    }

    // Atualizar último acesso
    usuario.ultimoAcesso = new Date();
    await usuario.save();

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        setor: usuario.setor
      },
      config.jwtSecret,
      { expiresIn: '12h' }
    );

    res.status(200).json({
      sucesso: true,
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        setor: usuario.setor ? {
          id: usuario.setor._id,
          nome: usuario.setor.nome
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao fazer login',
      erro: error.message
    });
  }
};

// Obter usuário atual
exports.getUsuarioAtual = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id)
      .select('-senha')
      .populate('setor', 'nome');

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      sucesso: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter usuário',
      erro: error.message
    });
  }
};