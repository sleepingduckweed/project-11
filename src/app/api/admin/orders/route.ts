import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { MealType, OrderStatus, TransactionType } from '@/types/enums';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const today = new Date();
    today.setHours(0,0,0,0);

    // Fetch all orders from today onwards to show upcoming ones too
    const orders = await Order.find({ 
      bookingDate: { $gte: today } 
    }).populate('userId').sort({ bookingDate: 1 });
    
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await connectToDatabase();

    // 1. Handle Bulk Dispatch (Original Logic)
    if (body.mealType && !body.manualBooking) {
      const { mealType, notifyUser } = body;
      const today = new Date();
      today.setHours(0,0,0,0);

      const orders = await Order.find({ 
        bookingDate: today, 
        mealType: mealType === 'Both' ? { $in: ['Lunch', 'Dinner', 'Both'] } : mealType,
        status: 'Booked'
      }).populate('userId');

      let processedCount = 0;
      for (const order of orders) {
        const user = order.userId as any;
        if (notifyUser && user?.phone) {
          const dateStr = new Date(order.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          await sendWhatsAppMessage(user.phone, `🛵 *Order Dispatched!*\n\nYour ${mealType} for ${dateStr} has been dispatched. Enjoy your meal! 🍱`);
        }
        order.status = OrderStatus.Dispatched;
        await order.save();
        processedCount++;
      }
      return NextResponse.json({ processed: processedCount });
    }

    // 2. Handle Manual Booking (New Logic)
    if (body.manualBooking) {
      const { userId, bookingDate, mealType, notifyUser } = body.manualBooking;

      if (!userId || !bookingDate || !mealType) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const tiffinsToDeduct = (mealType === MealType.Both) ? 2 : 1;
      
      let balanceField: 'breakfastBalance' | 'lunchBalance' | 'dinnerBalance' = 'lunchBalance';
      if (mealType === MealType.Breakfast) balanceField = 'breakfastBalance';
      if (mealType === MealType.Dinner) balanceField = 'dinnerBalance';

      if (mealType === MealType.Both) {
        if (user.lunchBalance < 1 || user.dinnerBalance < 1) {
            return NextResponse.json({ error: 'Insufficient Lunch or Dinner balance' }, { status: 400 });
        }
      } else if (user[balanceField] < tiffinsToDeduct) {
        return NextResponse.json({ error: `Insufficient ${mealType} balance` }, { status: 400 });
      }

      // Check if already booked for this slot
      const existing = await Order.findOne({
        userId,
        bookingDate: new Date(bookingDate),
        mealType: mealType === 'Both' ? { $in: ['Lunch', 'Dinner', 'Both'] } : mealType,
        status: { $ne: 'Cancelled' }
      });
      if (existing) return NextResponse.json({ error: 'Order already exists for this slot' }, { status: 400 });

      // Create Order
      const newOrder = await Order.create({
        userId,
        bookingDate: new Date(bookingDate),
        mealType,
        tiffinsDeducted: tiffinsToDeduct,
        status: 'Booked'
      });

      // Deduct Balance
      if (mealType === MealType.Both) {
        user.lunchBalance -= 1;
        user.dinnerBalance -= 1;
      } else {
        user[balanceField] -= tiffinsToDeduct;
      }
      await user.save();

      // Create Transaction
      await Transaction.create({
        userId,
        type: 'Debit',
        tiffinCount: tiffinsToDeduct,
        reason: `Manual Admin Booking for ${mealType} on ${new Date(bookingDate).toLocaleDateString()}`
      });

      // Notify User
      if (notifyUser && user.phone) {
        const dateStr = new Date(bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const newBalanceStr = mealType === MealType.Both 
            ? `Lunch: ${user.lunchBalance}, Dinner: ${user.dinnerBalance}` 
            : `${mealType}: ${user[balanceField]}`;
        await sendWhatsAppMessage(user.phone, `Admin has booked your ${mealType} for ${dateStr} 🍱\nYour remaining balance: ${newBalanceStr} tiffins.`);
      }

      return NextResponse.json({ success: true, order: newOrder });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
