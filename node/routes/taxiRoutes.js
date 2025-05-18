const express = require('express');
const router = express.Router();
const taxiController = require('../controllers/taxiController');

router.get('/', taxiController.getTaxis);
router.post('/', taxiController.createTaxi);
router.delete('/:matricula', taxiController.deleteTaxi);

module.exports = router;
