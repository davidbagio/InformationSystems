const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController'); 

router.get('/login', clientController.loginCliente);

router.post('/', clientController.cliente_create);

module.exports = router;
