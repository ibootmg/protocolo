const mongoose = require('mongoose');

const MensagemSchema = new mongoose.Schema({
  protocolo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Protocolo',
    required: true
  },
  remetente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  setorDestinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setor'
  },
  conteudo: {
    type: String,
    required: true
  },
  lida: {
    type: Boolean,
    default: false
  },
  dataLeitura: Date
}, { timestamps: true });

module.exports = mongoose.model('Mensagem', MensagemSchema);