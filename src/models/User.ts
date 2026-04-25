import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  address: string;
  breakfastBalance: number;
  lunchBalance: number;
  dinnerBalance: number;
  isActive: boolean;
  foodPreference: 'Veg' | 'Non-Veg';
  plan: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  breakfastBalance: { type: Number, default: 0 },
  lunchBalance: { type: Number, default: 0 },
  dinnerBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  foodPreference: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
  plan: { type: String, default: 'Regular' },
  createdAt: { type: Date, default: Date.now },
});

// Force refresh model name to avoid dev cache issues
const User: Model<IUser> = mongoose.models.UserV2 || mongoose.model<IUser>('UserV2', UserSchema);
export default User;
