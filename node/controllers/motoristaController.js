const Motorista = require('../models/Motorista');
const mongoose = require('mongoose');

exports.motorista_list = async (req, res) => {
  try {
    const motoristas = await Motorista.find();
    res.json(motoristas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMotoristaByNIF = async (req, res) => {
  const { nif } = req.params;
  console.log('NIF recebido:', nif); // Log do NIF recebido

  try {
    const motorista = await Motorista.findOne({ nif: String(nif) });
    if (!motorista) {
      console.log('Motorista não encontrado');
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }
    console.log('Motorista encontrado:', motorista);
    res.json(motorista);
  } catch (error) {
    console.error('Erro ao buscar motorista:', error);
    res.status(500).json({ message: 'Erro ao buscar motorista', error });
  }
};

exports.motorista_create = async (req, res) => {
  const motorista = new Motorista({
    nome: req.body.nome,
    anoNascimento: req.body.anoNascimento,
    nif: req.body.nif,
    genero: req.body.genero,
    codigoPostal: req.body.codigoPostal,
    localidade: req.body.localidade,
    rua: req.body.rua,
    numeroPorta: req.body.numeroPorta,
    cartaConducao: req.body.cartaConducao,
  });

  try {
    const novoMotorista = await motorista.save();
    res.status(201).json(novoMotorista);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMotorista = async (req, res) => {
  try {
    const { nif } = req.params;
    const motoristaRemovido = await Motorista.findOneAndDelete({ nif });

    if (!motoristaRemovido) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }

    res.json({ message: 'Motorista removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover o motorista', erro: err.message });
  }
};

exports.motorista_login = async (req, res) => {
  try {
    const { nif, carta } = req.query;

    if (!nif || !carta) {
      return res.status(400).json({ message: 'NIF e carta de condução são obrigatórios.' });
    }

    const motorista = await Motorista.findOne({ nif: nif, cartaConducao: carta });

    if (!motorista) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    res.status(200).json({ message: 'Login bem-sucedido', motorista });
  } catch (err) {
    res.status(500).json({ message: 'Erro no login', erro: err.message });
  }
};


