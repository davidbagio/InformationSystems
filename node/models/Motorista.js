const mongoose = require('mongoose');

const motoristaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  anoNascimento: {
    type: Number,
    required: true,
  },
  nif: {
    type: String,
    required: true,
    unique: true,
  },
  genero: {
    type: String,
    enum: ['Masculino', 'Feminino'],
    required: true,
  },
  codigoPostal: {
    type: String,
    required: true,
  },
  localidade: {
    type: String,
    required: true,
  },
  rua: {
    type: String,
    required: true,
  },
  numeroPorta: {
    type: Number,
    required: true,
  },
  cartaConducao: {
    type: String,
    required: true,
  },
});

const Motorista = mongoose.model('Motorista', motoristaSchema);

module.exports = Motorista;
