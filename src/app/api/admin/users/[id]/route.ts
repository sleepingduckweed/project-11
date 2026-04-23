import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  await connectToDatabase();

  try {
    if (data.tiffinCount) {
      const user = await User.findById(id);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      const tiffins = data.tiffinCount;
      user.tiffinBalance += tiffins;
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: 'Credit',
        tiffinCount: tiffins,
        reason: `Recharge: ${tiffins} Tiffins`
      });

      return NextResponse.json(user);
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
