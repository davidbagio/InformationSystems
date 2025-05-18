const express = require('express');
const router = express.Router();
const periodoController = require('../controllers/periodoController');

router.post('/periodos', periodoController.createPeriodo);
router.get('/periodos', periodoController.getPeriodos);
router.delete('/periodos/:id', periodoController.deletePeriodo);

module.exports = router;