const Cliente = require('../models/Cliente');

exports.cliente_create = async (req, res) => {
    const cliente = new Cliente({
      nome: req.body.nome,
      email: req.body.email,
      nif: req.body.nif,
      pass: req.body.pass,
      idade: req.body.idade,
      morada: req.body.morada,
    });
  
    try {
      const clienteExistente = await Cliente.findOne({ nif: req.body.nif });
      if (clienteExistente) {
        return res.status(400).json({ mensagem: 'Cliente já registado' });
      }
  
      const novoCliente = await cliente.save();
      res.status(201).json(novoCliente);
    } catch (err) {
      res.status(400).json({ mensagem: err.message });
    }
  };

  exports.loginCliente = async (req, res) => {
    try {
      const { nif, email, pass } = req.query; 
  
      const cliente = await Cliente.findOne({ nif });
  
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado com esse NIF' });
      }
  
      if (cliente.email !== email) {
        return res.status(400).json({ message: 'Email não corresponde ao cliente' });
      }
  
      if (cliente.pass !== pass) {
        return res.status(400).json({ message: 'Senha incorreta' });
      }
  
      res.json({ message: 'Login bem-sucedido', cliente });
  
    } catch (err) {
      res.status(500).json({ message: 'Erro ao realizar login', erro: err.message });
    }
  };
  
  
