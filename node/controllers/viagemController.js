const Viagem = require('../models/Viagem');
const Cliente = require('../models/Cliente');
const Motorista = require('../models/Motorista');
const Taxi = require('../models/Taxi'); 
const Periodo = require('../models/Periodo'); 
const mongoose = require('mongoose');
const fetch = require('node-fetch'); // Certifique-se de instalar o pacote: npm install node-fetch

async function getCoordinatesFromPostalCode(postalCode) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${postalCode}&addressdetails=1`;
  const response = await fetch(url);
  const data = await response.json();

  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } else {
    throw new Error('Não foi possível obter as coordenadas para o código postal fornecido.');
  }
}

exports.criarViagem = async (req, res) => {
  const {
    origem,
    destino,
    numeroPessoas,
    nomeCliente,
    cliente: nifCliente,
    nivelConforto,
    data,
    originalClientLat,
    originalClientLng,
    finalClientLat,
    finalClientLng,
  } = req.body;

  try {
    if (!data) {
      return res.status(400).json({ message: 'A data da viagem é obrigatória.' });
    }

    const cliente = await Cliente.findOne({ nif: nifCliente });
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const novoPeriodo = new Periodo({
      inicio: new Date(data),
    });
    await novoPeriodo.save();

    const viagem = new Viagem({
      origem,
      destino,
      numeroPessoas,
      nomeCliente,
      status: false,
      cliente: cliente,
      nivelConforto,
      periodo: novoPeriodo,
      originalClientLat,
      originalClientLng,
      finalClientLat,
      finalClientLng,
    });

    const novaViagem = await viagem.save();
    res.status(201).json(novaViagem);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.aceitarViagem = async (req, res) => {
  const { motoristaNif, taxiMatricula, motoristaLat, motoristaLng } = req.body;

  try {
    const viagem = await Viagem.findById(req.params.id);
    if (!viagem) {
      return res.status(404).json({ message: 'Viagem não encontrada' });
    }

    const motorista = await Motorista.findOne({ nif: motoristaNif });
    if (!motorista) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }

    const taxi = await Taxi.findOne({ matricula: taxiMatricula });
    if (!taxi) {
      return res.status(404).json({ message: 'Táxi não encontrado' });
    }

    // Atualizar status, motorista, táxi e coordenadas do motorista
    viagem.status = true;
    viagem.motorista = motorista._id;
    viagem.taxi = taxi._id;
    viagem.motoristaLat = motoristaLat;
    viagem.motoristaLng = motoristaLng;

    const viagemAtualizada = await viagem.save();

    const viagemPopulada = await Viagem.findById(viagemAtualizada._id)
      .populate('motorista', 'nome')
      .populate('cliente', 'nome')
      .populate('taxi', 'matricula marca modelo');

    res.json({ message: 'Viagem aceite com sucesso', viagem: viagemPopulada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao aceitar a viagem', error });
  }
};

exports.rejeitarViagem = async (req, res) => {
  const { motorista } = req.body; // Recebe o ID do motorista no corpo da requisição

  try {
    const viagem = await Viagem.findById(req.params.id);
    if (!viagem) {
      return res.status(404).json({ message: 'Viagem não encontrada' });
    }

    // Verifica se o motorista já está no array de motoristas rejeitados
    if (viagem.motoristasRejeitados.includes(motorista)) {
      return res.status(400).json({ message: 'Este motorista já rejeitou a viagem.' });
    }

    // Adiciona o motorista ao array de motoristas rejeitados
    viagem.motoristasRejeitados.push(motorista);

    // Atualiza os campos motorista e taxi para null
    viagem.motorista = null;
    viagem.taxi = null;
    viagem.status = false;

    const viagemAtualizada = await viagem.save();

    const viagemPopulada = await Viagem.findById(viagemAtualizada._id)
      .populate('motoristasRejeitados', 'nome')
      .populate('motorista', 'nome')
      .populate('cliente', 'nome')
      .populate('taxi', 'matricula marca modelo');

    res.json({ message: 'Motorista rejeitado com sucesso', viagem: viagemPopulada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao rejeitar a viagem', error });
  }
};

exports.listarViagens = async (req, res) => {
  try {
    const viagens = await Viagem.find({status: false}) 
      .populate('cliente', 'nome')
      .populate('motorista', 'nome nif'); 

    res.json(viagens);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar as viagens', error });
  }
};

exports.getViagens = async (req, res) => {
  try {
    const viagens = await Viagem.find()
      .populate('cliente', 'nome') // Populate the cliente field
      .populate('motorista', 'nome nif')
      .populate('taxi', 'matricula marca modelo'); // Populate the motorista field

    res.json(viagens);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar viagens', error });
  }
};

exports.deleteViagem = async (req, res) => {
  try {
    const viagem = await Viagem.findByIdAndDelete(req.params.id);

    if (!viagem) {
      return res.status(404).json({ message: 'Viagem não encontrada' });
    }

    res.json({ message: 'Viagem apagada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar a viagem', error });
  }
};

exports.confirmarViagem = async (req, res) => {
  try {
    const viagem = await Viagem.findById(req.params.id);

    if (!viagem) {
      return res.status(404).json({ message: 'Viagem não encontrada' });
    }

    // Check if the trip has already been assigned
    if (viagem.atribuida) {
      return res.status(400).json({ message: 'A viagem já foi confirmada pelo cliente.' });
    }

    // Set the `atribuida` attribute to true
    viagem.atribuida = true;

    const viagemAtualizada = await viagem.save();

    res.json({ message: 'Viagem confirmada com sucesso', viagem: viagemAtualizada });
  } catch (error) {
    console.error('Erro ao confirmar a viagem:', error);
    res.status(500).json({ message: 'Erro ao confirmar a viagem', error });
  }
};



