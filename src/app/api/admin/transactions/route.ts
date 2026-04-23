import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  await connectToDatabase();
  const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(transactions);
}
