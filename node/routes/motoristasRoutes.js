const express = require('express');
const router = express.Router();
const motoristaController = require('../controllers/motoristaController'); 

router.get('/', motoristaController.motorista_list);

router.post('/', motoristaController.motorista_create);

router.delete('/:nif', motoristaController.deleteMotorista);

router.get('/login', motoristaController.motorista_login);

router.get('/:nif', motoristaController.getMotoristaByNIF);
module.exports = router;
