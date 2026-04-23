const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const email = 'admin@tiffin.com';
  const password = 'password123';
  const name = 'Tiffin Didi';

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({
    email,
    password: hashedPassword,
    name
  });

  console.log('Admin user created successfully');
  console.log('Email: admin@tiffin.com');
  console.log('Password: password123');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
