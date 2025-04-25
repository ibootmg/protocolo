const mongoose = require('mongoose');

const ProtocoloSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  paciente: {
    nome: { type: String, required: true },
    cpf: { type: String, required: true },
    dataNascimento: { type: Date, required: true },
    telefone: { type: String }
  },
  tipoSolicitacao: {
    type: String,
    enum: ['consulta', 'exame', 'procedimento', 'internacao', 'outro'],
    required: true
  },
  prioridade: {
    type: String,
    enum: ['alta', 'media', 'baixa'],
    default: 'media'
  },
  status: {
    type: String,
    enum: ['em_analise', 'aprovado', 'pendente', 'concluido', 'cancelado'],
    default: 'em_analise'
  },
  dataEntrada: {
    type: Date,
    default: Date.now
  },
  setorAtual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setor',
    required: true
  },
  documentos: [{
    nome: String,
    tipo: String,
    url: String,
    dataUpload: {
      type: Date,
      default: Date.now
    }
  }],
  observacoes: String,
  dataPrazo: Date,
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, { timestamps: true });

module.exports = mongoose.model('Protocolo', ProtocoloSchema);