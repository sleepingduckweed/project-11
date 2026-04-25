import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status, notifyUser } = await req.json();

  try {
    await connectToDatabase();
    const order = await Order.findById(id).populate('userId');
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Notify if status changed to Dispatched
    if (status === 'Dispatched' && oldStatus !== 'Dispatched' && notifyUser && (order.userId as any)?.phone) {
        const user = order.userId as any;
        const dateStr = new Date(order.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        await sendWhatsAppMessage(
            user.phone,
            `🛵 *Order Out for Delivery!*\n\nYour ${order.mealType} for ${dateStr} has been dispatched. Enjoy your meal! 🍱\n\n🌅 Breakfast: ${user.breakfastBalance || 0} | ☀️ Lunch: ${user.lunchBalance || 0} | 🌙 Dinner: ${user.dinnerBalance || 0}`
        );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
