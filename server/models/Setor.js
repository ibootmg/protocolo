const mongoose = require('mongoose');

const SetorSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  descricao: String,
  responsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Setor', SetorSchema);