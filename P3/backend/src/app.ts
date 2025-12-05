import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import mesaRoutes from './routes/mesas';
import reservaRoutes from './routes/reservas';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
connectDB();
app.use('/api/mesas', mesaRoutes);
app.use('/api/reservas', reservaRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Sistema de Reservas de Mesas API',
    version: '1.0.0'
  });
});

app.post('/api/inicializar', async (req, res) => {
  try {
    const Mesa = require('./models/Mesa').default;
    const mesasExemplo = [
      { numero: 1, capacidade: 4, localizacao: 'Salão Principal' },
      { numero: 2, capacidade: 2, localizacao: 'Varanda' },
      { numero: 3, capacidade: 6, localizacao: 'Salão Principal' },
      { numero: 4, capacidade: 4, localizacao: 'Área Interna' },
      { numero: 5, capacidade: 2, localizacao: 'Varanda' },
      { numero: 6, capacidade: 8, localizacao: 'Salão Principal' },
      { numero: 7, capacidade: 4, localizacao: 'Área Interna' },
      { numero: 8, capacidade: 2, localizacao: 'Varanda' }
    ];
    
    for (const mesaData of mesasExemplo) {
      await Mesa.findOneAndUpdate(
        { numero: mesaData.numero },
        mesaData,
        { upsert: true, new: true }
      );
    }
    
    res.json({ message: 'Dados iniciais criados com sucesso' });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});