const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');

router.post('/turnos', turnoController.criarTurno);
router.delete('/turnos/:id', turnoController.apagarTurno);
router.get('/turnos', turnoController.obterTurnos);
router.get('/turnos/disponiveis', turnoController.verificarTaxisDisponiveis);
router.get('/turnos/motorista', turnoController.obterTurnosPorMotorista);

module.exports = router;
