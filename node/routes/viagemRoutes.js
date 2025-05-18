const express = require('express');
const router = express.Router();
const viagemController = require('../controllers/viagemController');

router.post('/viagens', viagemController.criarViagem);
router.get('/viagens', viagemController.listarViagens);
router.put('/viagens/:id', viagemController.aceitarViagem);
router.put('/viagens/:id/rejeitar', viagemController.rejeitarViagem);
router.put('/viagens/:id/confirmar', viagemController.confirmarViagem);
router.get('/viagens/all', viagemController.getViagens); 
router.delete('/viagens/:id', viagemController.deleteViagem);

module.exports = router;
