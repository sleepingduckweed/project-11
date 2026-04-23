import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slotLabel, slotDate, userIds } = await req.json();
  await connectToDatabase();
  
  let query: any = { isActive: true, tiffinBalance: { $gte: 1 } };
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    query._id = { $in: userIds };
  }

  const users = await User.find(query);

  const dateStr = new Date(slotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  
  // Determine mealType from slotLabel
  let mealType: 'Lunch' | 'Dinner' | 'Both' = 'Both';
  if (slotLabel.toLowerCase().includes('dinner')) mealType = 'Dinner';
  else if (slotLabel.toLowerCase().includes('lunch')) mealType = 'Lunch';

  let sentCount = 0;
  for (const user of users) {
    try {
      const message = `*Need tiffin for ${slotLabel} (${dateStr})?* 🍱\n\nReply with: YES or NO\n\nYour current balance: ${user.tiffinBalance} tiffin(s)${user.tiffinBalance < 2 ? '\n\n⚠️ *Low Balance!* Please recharge with UPI ID: kiyamax@upi' : ''}`;
      
      await sendWhatsAppMessage(user.phone, message);
      
      // Save pending state for YES/NO handling in webhook
      user.pendingBroadcast = {
        slotLabel,
        slotDate: new Date(slotDate),
        mealType
      };
      await user.save();
      
      sentCount++;
    } catch (err) {
      console.error(`Failed to send to ${user.phone}:`, err);
    }
  }

  return NextResponse.json({ sentCount });
}
