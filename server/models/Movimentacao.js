const mongoose = require('mongoose');

const MovimentacaoSchema = new mongoose.Schema({
  protocolo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Protocolo',
    required: true
  },
  setorOrigem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setor',
    required: true
  },
  setorDestino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setor',
    required: true
  },
  dataHora: {
    type: Date,
    default: Date.now
  },
  responsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  observacao: String
}, { timestamps: true });

module.exports = mongoose.model('Movimentacao', MovimentacaoSchema);