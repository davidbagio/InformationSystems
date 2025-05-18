const Periodo = require('../models/Periodo');

exports.createPeriodo = async (req, res) => {
  const { inicio, fim } = req.body;

  if (new Date(fim) <= new Date(inicio)) {
    return res.status(400).json({ message: 'A data de fim deve ser posterior à data de início.' });
  }

  try {
    const periodo = new Periodo({ inicio, fim });
    const novoPeriodo = await periodo.save();
    res.status(201).json(novoPeriodo);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar período.', error: err.message });
  }
};

exports.getPeriodos = async (req, res) => {
  try {
    const periodos = await Periodo.find();
    res.json(periodos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter períodos.', error: err.message });
  }
};

exports.deletePeriodo = async (req, res) => {
  try {
    const { id } = req.params;
    const periodoRemovido = await Periodo.findByIdAndDelete(id);

    if (!periodoRemovido) {
      return res.status(404).json({ message: 'Período não encontrado.' });
    }

    res.json({ message: 'Período removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover período.', error: err.message });
  }
};