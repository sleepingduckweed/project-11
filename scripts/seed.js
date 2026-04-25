const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/captain';

// Minimal schemas for seeding
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  tiffinBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  foodPreference: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
  plan: { type: String, default: 'Regular' },
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserV2', required: true },
  bookingDate: { type: Date, required: true },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Both'], required: true },
  status: { type: String, enum: ['Pending', 'Dispatched', 'Cancelled'], default: 'Pending' },
  tiffinsDeducted: { type: Number, default: 1 },
});

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserV2', required: true },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  tiffinCount: { type: Number, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
    const User = mongoose.models.UserV2 || mongoose.model('UserV2', UserSchema);
    const Order = mongoose.models.OrderV2 || mongoose.model('OrderV2', OrderSchema);
    const Transaction = mongoose.models.TransactionV2 || mongoose.model('TransactionV2', TransactionSchema);

    // 1. Clear existing data (optional, but good for consistent validation)
    await Promise.all([
      Admin.deleteMany({}),
      User.deleteMany({}),
      Order.deleteMany({}),
      Transaction.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // 2. Create Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Aditya'
    });
    console.log('Admin created: admin@test.com / admin123');

    // 3. Create Users
    const users = [];
    const plans = ['Monthly 20', 'Trial', 'Daily', 'Regular'];
    for (let i = 1; i <= 50; i++) {
      users.push({
        name: `Customer ${i}`,
        phone: `91834063${(2956 + i).toString()}`,
        address: `${i}rd Street, Kitchen Colony`,
        tiffinBalance: Math.floor(Math.random() * 20) + 5,
        isActive: true,
        foodPreference: i % 3 === 0 ? 'Non-Veg' : 'Veg',
        plan: plans[i % plans.length]
      });
    }
    const createdUsers = await User.insertMany(users);
    console.log('Created 50 test users');

    // 4. Create Orders for the next 7 days
    const orders = [];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Both'];
    
    for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        date.setHours(0,0,0,0);

        // For each day, book for 20-30 random users
        const shuffeledUsers = [...createdUsers].sort(() => 0.5 - Math.random());
        const usersToBook = shuffeledUsers.slice(0, 25);

        usersToBook.forEach(user => {
            const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
            orders.push({
                userId: user._id,
                bookingDate: date,
                mealType: mealType,
                status: day === 0 ? (Math.random() > 0.5 ? 'Dispatched' : 'Pending') : 'Pending',
                tiffinsDeducted: mealType === 'Both' ? 2 : 1
            });
        });
    }
    await Order.insertMany(orders);
    console.log(`Created ${orders.length} orders across 7 days`);

    // 5. Create some Transactions
    const transactions = [];
    createdUsers.slice(0, 10).forEach(user => {
        transactions.push({
            userId: user._id,
            type: 'Credit',
            tiffinCount: 20,
            reason: 'Seeder Recharge',
            createdAt: new Date()
        });
    });
    await Transaction.insertMany(transactions);
    console.log('Added initial transactions for first 10 users');

    console.log('Seeding complete! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
