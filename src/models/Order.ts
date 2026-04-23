import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  bookingDate: Date;
  mealType: 'Lunch' | 'Dinner' | 'Both' | 'None';
  tiffinsDeducted: number;
  status: 'Booked' | 'Dispatched' | 'Delivered' | 'Cancelled';
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookingDate: { type: Date, required: true },
  mealType: { type: String, enum: ['Lunch', 'Dinner', 'Both', 'None'], required: true },
  tiffinsDeducted: { type: Number, default: 0 },
  status: { type: String, enum: ['Booked', 'Dispatched', 'Delivered', 'Cancelled'], default: 'Booked' },
  createdAt: { type: Date, default: Date.now },
});

// Force refresh model name to avoid dev cache issues
const Order: Model<IOrder> = mongoose.models.OrderV2 || mongoose.model<IOrder>('OrderV2', OrderSchema);
export default Order;
