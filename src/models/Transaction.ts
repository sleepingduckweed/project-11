import mongoose, { Schema, Document, Model } from 'mongoose';
import { TransactionType, MealType } from '@/types/enums';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  mealType?: MealType;
  tiffinCount: number;
  reason: string;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserV2', required: true },
  type: { type: String, enum: Object.values(TransactionType), required: true },
  mealType: { type: String, enum: Object.values(MealType), required: false },
  tiffinCount: { type: Number, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Use a unique name if schema changed significantly to avoid cache issues in dev
const Transaction: Model<ITransaction> = mongoose.models.TransactionV2 || mongoose.model<ITransaction>('TransactionV2', TransactionSchema);
export default Transaction;
