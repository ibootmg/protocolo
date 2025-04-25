const express = require('express');
const router = express.Router();
const protocoloController = require('../controllers/protocoloController');
const authMiddleware = require('../middlewares/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para protocolos
router.post('/', protocoloController.criarProtocolo);
router.get('/', protocoloController.listarProtocolos);
router.get('/busca', protocoloController.buscarProtocolos);
router.get('/:id', protocoloController.obterProtocoloPorId);
router.put('/:id', protocoloController.atualizarProtocolo);
router.delete('/:id', protocoloController.excluirProtocolo);
router.post('/:id/movimentar', protocoloController.movimentarProtocolo);
router.get('/:id/historico', protocoloController.obterHistoricoProtocolo);
router.post('/:id/documentos', protocoloController.adicionarDocumento);
router.get('/:id/documentos', protocoloController.listarDocumentos);

module.exports = router;