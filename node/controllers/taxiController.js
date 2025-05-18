const Taxi = require('../models/Taxi');

exports.getTaxis = async (req, res) => {
  try {
    const taxis = await Taxi.find().sort({ dataRegisto: -1 });
    res.json(taxis);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter os táxis' });
  }
};

exports.createTaxi = async (req, res) => {
  try {
    const novoTaxi = new Taxi(req.body);
    const taxiGuardado = await novoTaxi.save();
    res.status(201).json(taxiGuardado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar o táxi', erro: err.message });
  }
};

exports.deleteTaxi = async (req, res) => {
  try {
    const { matricula } = req.params;
    const taxiRemovido = await Taxi.findOneAndDelete({ matricula });

    if (!taxiRemovido) {
      return res.status(404).json({ message: 'Táxi não encontrado' });
    }

    res.json({ message: 'Táxi removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover o táxi', erro: err.message });
  }
};
