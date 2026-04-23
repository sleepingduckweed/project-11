import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  await connectToDatabase();
  
  const filter = query 
    ? { $or: [{ name: { $regex: query, $options: 'i' } }, { phone: { $regex: query, $options: 'i' } }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  await connectToDatabase();
  
  try {
    const user = await User.create(data);
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
