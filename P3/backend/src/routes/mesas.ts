import express, { Request, Response } from 'express';
import Mesa from '../models/Mesa';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const mesa = new Mesa(req.body);
    await mesa.save();
    res.status(201).json({ message: 'Mesa criada com sucesso', mesa });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const mesas = await Mesa.find();
    res.json(mesas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:numero', async (req: Request, res: Response) => {
  try {
    const mesa = await Mesa.findOne({ numero: req.params.numero });
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa não encontrada' });
    }
    res.json(mesa);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:numero', async (req: Request, res: Response) => {
  try {
    const mesa = await Mesa.findOneAndUpdate(
      { numero: req.params.numero },
      req.body,
      { new: true }
    );
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa não encontrada' });
    }
    res.json({ message: 'Mesa atualizada com sucesso', mesa });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:numero', async (req: Request, res: Response) => {
  try {
    const mesa = await Mesa.findOneAndDelete({ numero: req.params.numero });
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa não encontrada' });
    }
    res.json({ message: 'Mesa deletada com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;