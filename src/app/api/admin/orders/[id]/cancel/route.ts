import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { MealType, OrderStatus, TransactionType } from '@/types/enums';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { notifyUser } = await req.json();
  const { id: orderId } = await params;

  try {
    await connectToDatabase();
    
    const order = await Order.findById(orderId).populate('userId');
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status === OrderStatus.Cancelled) return NextResponse.json({ error: 'Order already cancelled' }, { status: 400 });

    const user = order.userId as any;
    const tiffinsToRefund = order.tiffinsDeducted || 1;

    // 1. Update Order Status
    order.status = OrderStatus.Cancelled;
    await order.save();

    // 2. Refund User
    if (user) {
      if (order.mealType === MealType.Both) {
        user.lunchBalance = (user.lunchBalance || 0) + 1;
        user.dinnerBalance = (user.dinnerBalance || 0) + 1;
      } else {
        const field = `${order.mealType.toLowerCase()}Balance` as keyof typeof user;
        (user as any)[field] = ((user as any)[field] || 0) + tiffinsToRefund;
      }
      await user.save();

      // 3. Create Transaction Record
      await Transaction.create({
        userId: user._id,
        type: TransactionType.Credit,
        tiffinCount: tiffinsToRefund,
        reason: `Cancellation Refund: ${order.mealType} (${new Date(order.bookingDate).toLocaleDateString()})`,
        createdAt: new Date()
      });

      // 4. Notify User
      if (notifyUser && user.phone) {
        const dateStr = new Date(order.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const newBalanceStr = order.mealType === MealType.Both 
            ? `Lunch: ${user.lunchBalance}, Dinner: ${user.dinnerBalance}` 
            : `${order.mealType}: ${(user as any)[`${order.mealType.toLowerCase()}Balance`]}`;

        await sendWhatsAppMessage(
            user.phone, 
            `🚫 *Order Cancelled*\n\nYour ${order.mealType} booking for ${dateStr} has been cancelled by the kitchen.\n\n✅ *${tiffinsToRefund} tiffin(s)* have been refunded to your balance.\n\nNew Balance: ${newBalanceStr} tiffins`
        );
      }
    }

    return NextResponse.json({ success: true, newBalance: { breakfast: user?.breakfastBalance, lunch: user?.lunchBalance, dinner: user?.dinnerBalance } });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
