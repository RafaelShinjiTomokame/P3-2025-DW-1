import express, { Request, Response } from 'express';
import Reserva from '../models/Reserva';
import Mesa from '../models/Mesa';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { numeroMesa, quantidadePessoas, dataHora } = req.body;
    const agora = new Date();
    const horaReserva = new Date(dataHora);
    const diferencaHoras = (horaReserva.getTime() - agora.getTime()) / (1000 * 60 * 60);
    
    if (diferencaHoras < 1) {
      return res.status(400).json({ 
        error: 'Reservas devem ser feitas com antecedência mínima de 1 hora' 
      });
    }
    
    const mesa = await Mesa.findOne({ numero: numeroMesa });
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa não encontrada' });
    }
    
    if (quantidadePessoas > mesa.capacidade) {
      return res.status(400).json({ 
        error: `A mesa ${numeroMesa} comporta no máximo ${mesa.capacidade} pessoas` 
      });
    }
    
    const reservaExistente = await Reserva.findOne({
      numeroMesa,
      dataHora: {
        $gte: new Date(horaReserva.getTime() - 90 * 60 * 1000),
        $lte: new Date(horaReserva.getTime() + 90 * 60 * 1000)
      },
      status: { $in: ['reservado', 'ocupado'] }
    });
    
    if (reservaExistente) {
      return res.status(400).json({ 
        error: 'Já existe uma reserva para esta mesa neste horário' 
      });
    }
    
    const reserva = new Reserva(req.body);
    await reserva.save();
    
    console.log(`📝 Reserva criada: ${reserva._id} para mesa ${numeroMesa}`);
    res.status(201).json({ message: 'Reserva criada com sucesso', reserva });
    
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Conflito de reserva para esta mesa e horário' });
    }
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { cliente, mesa, data, status } = req.query;
    const filtro: any = {};
    
    if (cliente) filtro.nomeCliente = { $regex: cliente, $options: 'i' };
    if (mesa) filtro.numeroMesa = Number(mesa);
    if (data) {
      const dataBusca = new Date(data as string);
      const inicioDia = new Date(dataBusca.setHours(0, 0, 0, 0));
      const fimDia = new Date(dataBusca.setHours(23, 59, 59, 999));
      filtro.dataHora = { $gte: inicioDia, $lte: fimDia };
    }
    if (status) filtro.status = status;
    
    const reservas = await Reserva.find(filtro).sort({ dataHora: 1 });
    res.json(reservas);
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    console.log(`✏️ Reserva atualizada: ${reserva._id}`);
    res.json({ message: 'Reserva atualizada com sucesso', reserva });
    
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelado' },
      { new: true }
    );
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    console.log(`Reserva cancelada: ${reserva._id}`);
    res.json({ message: 'Reserva cancelada com sucesso', reserva });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/atualizar-status', async (req: Request, res: Response) => {
  try {
    const agora = new Date();
    const horaMais30 = new Date(agora.getTime() + 30 * 60 * 1000);
    const horaMenos30 = new Date(agora.getTime() - 30 * 60 * 1000);
    
    await Reserva.updateMany(
      {
        dataHora: { $lte: horaMais30, $gte: horaMenos30 },
        status: 'reservado'
      },
      { status: 'ocupado' }
    );
    
    await Reserva.updateMany(
      {
        dataHora: { $lt: horaMenos30 },
        status: { $in: ['reservado', 'ocupado'] }
      },
      { status: 'finalizado' }
    );
    
    res.json({ message: 'Status das reservas atualizados' });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;