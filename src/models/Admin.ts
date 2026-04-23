import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

const AdminSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
export default Admin;
