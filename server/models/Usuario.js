const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  perfil: {
    type: String,
    enum: ['admin', 'medico_regulador', 'colaborador', 'prestador', 'comunicacao'],
    required: true
  },
  setor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setor'
  },
  ativo: {
    type: Boolean,
    default: true
  },
  ultimoAcesso: Date
}, { timestamps: true });

// Método para criptografar senha antes de salvar
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
UsuarioSchema.methods.compararSenha = async function(senhaFornecida) {
  return await bcrypt.compare(senhaFornecida, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);