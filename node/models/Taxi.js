const mongoose = require('mongoose');

const taxiSchema = new mongoose.Schema({
  matricula: { type: String, required: true, match: /^\d{2}-[A-Z]{2}-\d{2}$/ },
  anoCompra: { type: Number, required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  nivelConforto: { type: String, enum: ['Básico', 'Luxuoso'], required: true },
  dataRegisto: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Taxi', taxiSchema);
