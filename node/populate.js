const Motorista = require('./models/Motorista');
const Taxi = require('./models/Taxi');

const motoristas = [
  {
    nome: "João Silva",
    anoNascimento: 1985,
    nif: "123456789",
    genero: "Masculino",
    codigoPostal: "1000-100",
    localidade: "Lisboa",
    rua: "Rua das Flores",
    numeroPorta: 12,
    cartaConducao: "B254231"
  },
  {
    nome: "Maria Santos",
    anoNascimento: 1990,
    nif: "987654321",
    genero: "Feminino",
    codigoPostal: "4000-200",
    localidade: "Porto",
    rua: "Avenida Central",
    numeroPorta: 45,
    cartaConducao: "B12345"
  }
];

const taxis = [
  {
    matricula: "12-AB-34",
    anoCompra: 2019,
    marca: "Toyota",
    modelo: "Prius",
    nivelConforto: "Básico",
    dataRegisto: new Date()
  },
  {
    matricula: "56-CD-78",
    anoCompra: 2020,
    marca: "BMW",
    modelo: "Série 3",
    nivelConforto: "Luxuoso",
    dataRegisto: new Date()
  },
  {
    matricula: "90-EF-12",
    anoCompra: 2021,
    marca: "Mercedes",
    modelo: "Classe E",
    nivelConforto: "Luxuoso",
    dataRegisto: new Date()
  }
];

async function populateDB() {
  try {
    await Motorista.deleteMany({});
    await Motorista.insertMany(motoristas);
    console.log('Motoristas inseridos.');

    await Taxi.deleteMany({});
    await Taxi.insertMany(taxis);
    console.log('Táxis inseridos.');

    console.log('Base de dados re-populada com motoristas e táxis!');
  } catch (err) {
    console.error('Erro ao popular a base de dados:', err);
  }
}

module.exports = populateDB;
