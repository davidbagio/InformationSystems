const mongoose = require('mongoose');
const Motorista = require('./Motorista'); 
const Taxi = require('./Taxi'); 
const Periodo = require('./Periodo'); 

const turnoSchema = new mongoose.Schema({
  motorista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motorista',
    required: false,
  },
  taxi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taxi', 
    required: false,
  },
  periodo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodo', 
    required: true,
  },
});

const Turno = mongoose.model('Turno', turnoSchema);

module.exports = Turno;
