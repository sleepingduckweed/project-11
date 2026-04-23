import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const today = new Date();
  today.setHours(0,0,0,0);

  const orders = await Order.find({ bookingDate: today }).populate('userId');
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { mealType } = await req.json();
  await connectToDatabase();
  const today = new Date();
  today.setHours(0,0,0,0);

  const orders = await Order.find({ 
    bookingDate: today, 
    mealType: mealType === 'Both' ? { $in: ['Lunch', 'Dinner', 'Both'] } : mealType,
    status: 'Booked'
  }).populate('userId');

  for (const order of orders) {
    order.status = 'Dispatched';
    await order.save();

    const user = order.userId as any;
    await sendWhatsAppMessage(user.phone, `Your ${mealType} has been dispatched 🍱`);
  }

  return NextResponse.json({ processed: orders.length });
}
