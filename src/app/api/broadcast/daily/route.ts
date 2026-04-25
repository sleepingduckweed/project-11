import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: Request) {
  // Add a security check (API Key or Authorization header)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const users = await User.find({ isActive: true });

  const message = `*Need tiffin today?* 🍱\n\nReply with:\n1 = Lunch\n2 = Dinner\n3 = Both\n0 = No\n\n_Lunch ₹90 | Dinner ₹90_`;

  let sentCount = 0;
  for (const user of users) {
    const totalBalance = ((user as any).lunchBalance || 0) + ((user as any).dinnerBalance || 0) + ((user as any).breakfastBalance || 0);
    if (totalBalance >= 1) {
      await sendWhatsAppMessage(user.phone, message);
      sentCount++;
    } else {
      await sendWhatsAppMessage(user.phone, "⚠️ Reminder: Your tiffin balance is 0. Please recharge to book your next meal!");
    }
  }

  return NextResponse.json({ sentTo: sentCount });
}
