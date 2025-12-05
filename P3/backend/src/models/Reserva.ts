import mongoose, { Schema, Document } from 'mongoose';

export interface IReserva extends Document {
  nomeCliente: string;
  contatoCliente: string;
  numeroMesa: number;
  quantidadePessoas: number;
  dataHora: Date;
  observacoes?: string;
  status: 'reservado' | 'ocupado' | 'finalizado' | 'cancelado';
}

const ReservaSchema: Schema = new Schema({
  nomeCliente: { type: String, required: true },
  contatoCliente: { type: String, required: true },
  numeroMesa: { type: Number, required: true },
  quantidadePessoas: { type: Number, required: true, min: 1 },
  dataHora: { type: Date, required: true },
  observacoes: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['reservado', 'ocupado', 'finalizado', 'cancelado'],
    default: 'reservado'
  }
}, { timestamps: true });

ReservaSchema.index({ numeroMesa: 1, dataHora: 1 }, { unique: true });

export default mongoose.model<IReserva>('Reserva', ReservaSchema);