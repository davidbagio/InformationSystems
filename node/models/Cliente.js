const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  pass: {
    type: String,
    required: true,
  },
  idade: {
    type: Number,
    required: true,
  },
  nif: {
    type: Number,
    required: true,
  },
  morada: {
    type: String,
    required: true,
  },
});

const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;
