import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { MealType, TransactionType } from '@/types/enums';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  await connectToDatabase();

  try {
    if (data.tiffinCount !== undefined) {
      const user = await User.findById(id);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      const tiffins = Number(data.tiffinCount);
      const mealType = (data.mealType as MealType) || MealType.Lunch;
      
      const field = `${mealType.toLowerCase()}Balance` as 'breakfastBalance' | 'lunchBalance' | 'dinnerBalance';
      user[field] = (user[field] || 0) + tiffins;
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: tiffins >= 0 ? TransactionType.Credit : TransactionType.Debit,
        tiffinCount: Math.abs(tiffins),
        mealType: mealType,
        reason: `${tiffins >= 0 ? 'Recharge' : 'Adjustment'}: ${Math.abs(tiffins)} ${mealType} Tiffins`
      });

      // Optional: Notify user of recharge
      if (tiffins > 0 && user.phone) {
          await sendWhatsAppMessage(user.phone, `💰 *Balance Updated*\n\nAdded *${tiffins}* tiffin(s) to your *${mealType}* bucket.\n\nNew ${mealType} Balance: ${user[field]}`);
      }

      return NextResponse.json(user);
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
