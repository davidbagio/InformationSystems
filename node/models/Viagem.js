const mongoose = require('mongoose');
const Motorista = require('./Motorista'); 
const Cliente = require('./Cliente'); 
const Taxi = require('./Taxi'); 
const Periodo = require('./Periodo'); 

const viagemSchema = new mongoose.Schema({
  origem: {
    type: String,
    required: true,
  },
  destino: {
    type: String,
    required: true,
  },
  numeroPessoas: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  motorista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motorista',
    required: false,
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente', 
    required: true,
  },
  taxi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taxi', 
    required: false,
  },
  atribuida: {
    type: Boolean,
    default: false,
  },
  nivelConforto: {
    type: String,
    enum: ['Básico', 'Luxuoso'],
    required: true,
  },
  periodo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodo', 
    required: true,
  },
  // Coordenadas do cliente
  originalClientLat: {
    type: Number,
    required: true,
  },
  originalClientLng: {
    type: Number,
    required: true,
  },
  finalClientLat: {
    type: Number,
    required: true,
  },
  finalClientLng: {
    type: Number,
    required: true,
  },
  // Coordenadas do motorista
  motoristaLat: {
    type: Number,
    default: null,
  },
  motoristaLng: {
    type: Number,
    default: null,
  },
  motoristasRejeitados: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Motorista',
      required: false,
    }
  ],
});

const Viagem = mongoose.model('Viagem', viagemSchema);

module.exports = Viagem;