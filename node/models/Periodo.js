const mongoose = require('mongoose');

const periodoSchema = new mongoose.Schema({
  inicio: {
    type: Date,
    required: true,
  },
  fim: {
    type: Date,
    required: false,
  },
});

const Periodo = mongoose.model('Periodo', periodoSchema);

module.exports = Periodo;