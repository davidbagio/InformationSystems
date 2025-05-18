const Turno = require('../models/Turno');
const Taxi = require('../models/Taxi');
const Motorista = require('../models/Motorista');
const Periodo = require('../models/Periodo');

exports.criarTurno = async (req, res) => {
  const { motorista, taxi, inicio, fim } = req.body;

  if (!motorista || !taxi || !inicio || !fim) {
    return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
  }

  if (new Date(fim) <= new Date(inicio)) {
    return res.status(400).json({ message: 'A data de fim deve ser posterior à data de início.' });
  }

  try {
    // Validar motorista
    const motoristaObj = await Motorista.findOne({ nif: motorista });
    if (!motoristaObj) {
      return res.status(404).json({ message: 'Motorista não encontrado.' });
    }

    // Validar táxi
    const taxiObj = await Taxi.findById(taxi);
    if (!taxiObj) {
      return res.status(404).json({ message: 'Táxi não encontrado.' });
    }

    // Criar o período
    const novoPeriodo = new Periodo({
      inicio,
      fim,
    });
    await novoPeriodo.save();

    // Criar o turno
    const turno = new Turno({
      motorista: motoristaObj._id,
      taxi: taxiObj._id,
      periodo: novoPeriodo._id,
    });

    const novoTurno = await turno.save();
    res.status(201).json(novoTurno);
  } catch (err) {
    console.error('Erro ao criar turno:', err);
    res.status(500).json({ message: 'Erro ao criar turno.', error: err.message });
  }
};

exports.apagarTurno = async (req, res) => {
  const { id } = req.params;

  try {
    const turno = await Turno.findByIdAndDelete(id);
    if (!turno) {
      return res.status(404).json({ message: 'Turno não encontrado.' });
    }

    await Periodo.findByIdAndDelete(turno.periodo);
    res.status(200).json({ message: 'Turno apagado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao apagar turno.' });
  }
};

exports.obterTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find()
      .populate('motorista')
      .populate('taxi')
      .populate('periodo');
    res.status(200).json(turnos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao obter turnos.' });
  }
};

exports.verificarTaxisDisponiveis = async (req, res) => {
  const { inicio } = req.query;

  if (!inicio) {
    return res.status(400).json({ message: 'Data de início é obrigatória.' });
  }

  try {
    const dataInicio = new Date(inicio);

    const turnos = await Turno.find()
      .populate('periodo')
      .populate('taxi');

    const taxisOcupados = turnos
      .filter(turno => {
        const p = turno.periodo;
        return (
          new Date(p.inicio) <= dataInicio &&
          (!p.fim || new Date(p.fim) > dataInicio)
        );
      })
      .map(turno => turno.taxi._id.toString());

    const todosTaxis = await Taxi.find();
    const taxisDisponiveis = todosTaxis.filter(taxi => !taxisOcupados.includes(taxi._id.toString()));

    res.status(200).json({
      disponiveis: taxisDisponiveis,
      ocupados: todosTaxis.filter(taxi => taxisOcupados.includes(taxi._id.toString()))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao verificar disponibilidade de táxis.' });
  }
};

exports.obterTurnosPorMotorista = async (req, res) => {
  const { motoristaNif } = req.query;

  try {
    // Find the motorista by NIF
    const motorista = await Motorista.findOne({ nif: motoristaNif });
    if (!motorista) {
      return res.status(404).json({ message: 'Motorista não encontrado.' });
    }

    // Find turnos associated with the motorista
    const turnos = await Turno.find({ motorista: motorista._id })
      .populate('taxi')
      .populate('periodo');

    res.status(200).json(turnos);
  } catch (err) {
    console.error('Erro ao obter turnos por motorista:', err);
    res.status(500).json({ message: 'Erro ao obter turnos.', error: err.message });
  }
};
