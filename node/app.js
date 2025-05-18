const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const populateDB = require('./populate');

const app = express();

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    await mongoose.connect('mongodb://localhost:27017/gestao_taxis', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Conectado ao MongoDB');

    //await populateDB(); 

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor na porta ${PORT}`);
    });

  } catch (err) {
    console.error('Erro ao conectar ao MongoDB', err);
  }
}

const motoristasRouter = require('./routes/motoristasRoutes');
app.use('/motoristas', motoristasRouter);

const taxisRouter = require('./routes/taxiRoutes');
app.use('/taxis', taxisRouter);

const clienteRoutes = require('./routes/clienteRoutes');
app.use('/clientes', clienteRoutes);

const viagemRoutes = require('./routes/viagemRoutes');
app.use('/', viagemRoutes);

const periodoRoutes = require('./routes/periodoRoutes');
app.use('/api', periodoRoutes);

const turnoRoutes = require('./routes/turnoRoutes');
app.use('/api', turnoRoutes);

startServer();
