import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  address: string;
  tiffinBalance: number;
  isActive: boolean;
  foodPreference: 'Veg' | 'Non-Veg';
  preferredReminderTime: string;
  pendingBroadcast?: {
    slotLabel: string;
    slotDate: Date;
    mealType: 'Lunch' | 'Dinner' | 'Both';
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  tiffinBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  foodPreference: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
  preferredReminderTime: { type: String, default: '09:00' },
  pendingBroadcast: {
    slotLabel: String,
    slotDate: Date,
    mealType: { type: String, enum: ['Lunch', 'Dinner', 'Both'] }
  },
  createdAt: { type: Date, default: Date.now },
});

// Force refresh model name to avoid dev cache issues
const User: Model<IUser> = mongoose.models.UserV2 || mongoose.model<IUser>('UserV2', UserSchema);
export default User;
