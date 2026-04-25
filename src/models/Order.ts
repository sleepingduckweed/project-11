import mongoose, { Schema, Document, Model } from 'mongoose';
import { MealType, OrderStatus } from '@/types/enums';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  bookingDate: Date;
  mealType: MealType;
  tiffinsDeducted: number;
  status: OrderStatus;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserV2', required: true },
  bookingDate: { type: Date, required: true },
  mealType: { type: String, enum: Object.values(MealType), required: true },
  tiffinsDeducted: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.Booked },
  createdAt: { type: Date, default: Date.now },
});

// Force refresh model name to avoid dev cache issues
const Order: Model<IOrder> = mongoose.models.OrderV2 || mongoose.model<IOrder>('OrderV2', OrderSchema);
export default Order;
