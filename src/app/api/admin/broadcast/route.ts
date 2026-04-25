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

  // Determine mealType from slotLabel
  let mealType: 'Lunch' | 'Dinner' | 'Both' | 'Breakfast' = 'Both';
  if (slotLabel.toLowerCase().includes('dinner')) mealType = 'Dinner';
  else if (slotLabel.toLowerCase().includes('lunch')) mealType = 'Lunch';
  else if (slotLabel.toLowerCase().includes('breakfast')) mealType = 'Breakfast';

  // Build query: filter by the relevant balance bucket
  const balanceField = mealType === 'Breakfast' ? 'breakfastBalance' : 
                       mealType === 'Dinner' ? 'dinnerBalance' : 'lunchBalance';
  let query: any = { isActive: true, [balanceField]: { $gte: 1 } };
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    query._id = { $in: userIds };
  }

  const users = await User.find(query);

  const dateStr = new Date(slotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  let sentCount = 0;
  for (const user of users) {
    try {
      const balance = (user as any)[balanceField] || 0;
      const isLow = balance < 2;
      const message = `*Need tiffin for ${slotLabel} (${dateStr})?* 🍱\n\nReply with: YES or NO\n\n🌅 Breakfast: *${(user as any).breakfastBalance || 0}* | ☀️ Lunch: *${(user as any).lunchBalance || 0}* | 🌙 Dinner: *${(user as any).dinnerBalance || 0}*${isLow ? '\n\n⚠️ *Low Balance!* Please recharge soon.' : ''}`;
      
      await sendWhatsAppMessage(user.phone, message);
      
      // Save pending state for YES/NO handling in webhook
      (user as any).pendingBroadcast = {
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
