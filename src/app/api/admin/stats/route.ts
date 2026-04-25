import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Order from '@/models/Order';
import { MealType, OrderStatus, TransactionType } from '@/types/enums';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [users, orders, transactions] = await Promise.all([
      User.find({}),
      Order.find({ bookingDate: { $gte: today, $lt: tomorrow } }),
      Transaction.find({ type: TransactionType.Credit }).sort({ createdAt: -1 })
    ]);

    // Calculate total system tiffins across all buckets
    const totalTiffins = users.reduce((acc, u) => acc + (u.breakfastBalance || 0) + (u.lunchBalance || 0) + (u.dinnerBalance || 0), 0);
    const activeUsers = users.filter(u => u.isActive).length;

    // Aggregate today's loads
    const breakfastLoad = orders.filter(o => o.mealType === MealType.Breakfast && o.status !== OrderStatus.Cancelled).length;
    const lunchLoad = orders.filter(o => (o.mealType === MealType.Lunch || o.mealType === MealType.Both) && o.status !== OrderStatus.Cancelled).length;
    const dinnerLoad = orders.filter(o => (o.mealType === MealType.Dinner || o.mealType === MealType.Both) && o.status !== OrderStatus.Cancelled).length;

    const stats = {
      totalUsers: users.length,
      activeUsers,
      totalTiffins,
      today: {
        breakfast: breakfastLoad,
        lunch: lunchLoad,
        dinner: dinnerLoad,
      },
      recentTransactions: transactions.slice(0, 6)
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
