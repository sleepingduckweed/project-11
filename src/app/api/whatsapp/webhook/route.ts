import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Transaction from '@/models/Transaction';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

const MEAL_PRICE = 90;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const message = body.entry[0].changes[0].value.messages[0];
    const from = message.from; // Phone number
    const text = message.text?.body?.trim().toUpperCase();

    if (!text) return NextResponse.json({ status: 'ok' });

    await connectToDatabase();
    let user = await User.findOne({ phone: from });

    if (!user) {
      // For V1, maybe we auto-create or ask them to contact the provider
      // return NextResponse.json({ status: 'ok' });
      // Let's assume the provider adds them first.
      await sendWhatsAppMessage(from, "Hi! It seems you're not registered. Please contact Kiyamaa's Kitchen to register.");
      return NextResponse.json({ status: 'ok' });
    }

    if (text === '1' || text === '2' || text === '3' || text === '0') {
      await handleBooking(user, text);
    } else if (['YES', 'Y', 'YEAH', 'OK', 'OUI', 'S'].includes(text)) {
      await handleYesResponse(user);
    } else if (['NO', 'N', 'NAY', 'SKIP', 'NON'].includes(text)) {
      await handleNoResponse(user);
    } else if (text === 'BAL' || text === 'BALANCE' || text === 'WALLET') {
      await handleBalance(user);
    } else if (text === 'HISTORY') {
      await handleHistory(user);
    } else if (text === 'SKIP TODAY' || text === 'SKIP') {
      await handleSkip(user);
    } else if (text === 'HELP') {
      await handleHelp(user);
    } else {
      await sendWhatsAppMessage(from, "I didn't quite get that. Reply with YES/NO to book, or HELP for more commands.");
    }
  }

  return NextResponse.json({ status: 'ok' });
}

async function handleYesResponse(user: any) {
  if (!user.pendingBroadcast) {
    await sendWhatsAppMessage(user.phone, "You don't have any pending booking prompts. To check your balance, reply with BAL.");
    return;
  }

  const { slotLabel, slotDate, mealType } = user.pendingBroadcast;
  const tiffins = (mealType === 'Both') ? 2 : 1;

  if (user.tiffinBalance < tiffins) {
    await sendWhatsAppMessage(user.phone, `Insufficient balance (${user.tiffinBalance} tiffins). Please recharge via UPI ID: kiyamax@upi and send a screenshot to confirm.`);
    return;
  }

  // Check if booking already exists for this date and meal
  const checkDate = new Date(slotDate);
  checkDate.setHours(0,0,0,0);
  
  const existingOrder = await Order.findOne({ 
    userId: user._id, 
    bookingDate: checkDate,
    mealType: { $in: [mealType, 'Both'] } 
  });

  if (existingOrder) {
    await sendWhatsAppMessage(user.phone, `You already have a ${existingOrder.mealType} booking for ${new Date(slotDate).toLocaleDateString()}.`);
    user.pendingBroadcast = undefined;
    await user.save();
    return;
  }

  // Deduct balance
  user.tiffinBalance -= tiffins;
  user.pendingBroadcast = undefined; // Clear after success
  await user.save();

  // Create Order
  await Order.create({
    userId: user._id,
    bookingDate: checkDate,
    mealType,
    tiffinsDeducted: tiffins,
    status: 'Booked'
  });

  // Create Transaction
  await Transaction.create({
    userId: user._id,
    type: 'Debit',
    tiffinCount: tiffins,
    reason: `Prompt: ${slotLabel}`
  });

  await sendWhatsAppMessage(user.phone, `✅ *Confirmed!* ${mealType} booked for ${new Date(slotDate).toLocaleDateString()}.\nBalance: ${user.tiffinBalance} tiffins.\n\nThank you! 🍱`);
}

async function handleNoResponse(user: any) {
  if (user.pendingBroadcast) {
    const { slotLabel } = user.pendingBroadcast;
    user.pendingBroadcast = undefined;
    await user.save();
    await sendWhatsAppMessage(user.phone, `Got it! No booking for ${slotLabel}. Have a great day! 👋`);
  } else {
    await sendWhatsAppMessage(user.phone, "No problem! Let me know if you need anything else.");
  }
}

async function handleBooking(user: any, choice: string) {
  let tiffins = 0;
  let mealType: 'Lunch' | 'Dinner' | 'Both' | 'None' = 'None';
  
  if (choice === '1') { tiffins = 1; mealType = 'Lunch'; }
  else if (choice === '2') { tiffins = 1; mealType = 'Dinner'; }
  else if (choice === '3') { tiffins = 2; mealType = 'Both'; }
  else if (choice === '0') { tiffins = 0; mealType = 'None'; }

  if (tiffins === 0) {
    await sendWhatsAppMessage(user.phone, "No booking made for today. Have a great day!");
    return;
  }

  if (user.tiffinBalance < tiffins) {
    await sendWhatsAppMessage(user.phone, `Insufficient balance. Your current balance is ${user.tiffinBalance} tiffins. Please recharge to book meals.`);
    return;
  }

  // Check if booking already exists for today
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const existingOrder = await Order.findOne({ userId: user._id, bookingDate: today });
  if (existingOrder) {
    await sendWhatsAppMessage(user.phone, "You have already made a booking for today.");
    return;
  }

  // Deduct balance
  user.tiffinBalance -= tiffins;
  await user.save();

  // Create Order
  await Order.create({
    userId: user._id,
    bookingDate: today,
    mealType,
    tiffinsDeducted: tiffins,
    status: 'Booked'
  });

  // Create Transaction
  await Transaction.create({
    userId: user._id,
    type: 'Debit',
    tiffinCount: tiffins,
    reason: mealType
  });

  await sendWhatsAppMessage(user.phone, `Confirmed: ${mealType} booked for today.\n${tiffins} tiffin(s) deducted.\nRemaining balance: ${user.tiffinBalance} tiffins`);

  // Low balance reminder
  if (user.tiffinBalance < 2) {
     await sendWhatsAppMessage(user.phone, "Your balance is low. Please recharge soon to continue uninterrupted tiffin service.");
  }
}

async function handleBalance(user: any) {
  await sendWhatsAppMessage(user.phone, `Current balance: ${user.tiffinBalance} tiffins`);
}

async function handleHistory(user: any) {
  const lastOrders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
  if (lastOrders.length === 0) {
    await sendWhatsAppMessage(user.phone, "No booking history found.");
    return;
  }

  let historyMsg = "Last bookings:\n\n";
  lastOrders.forEach(order => {
    const dateStr = new Date(order.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    historyMsg += `${dateStr} - ${order.mealType} (${order.tiffinsDeducted})\n`;
  });

  await sendWhatsAppMessage(user.phone, historyMsg);
}

async function handleSkip(user: any) {
    // In V1, skip might just mean don't book if prompted, or cancel today's booking if allowed.
    // For now, let's just confirm skipping.
    await sendWhatsAppMessage(user.phone, "Got it! Skipping bookings for today.");
}

async function handleHelp(user: any) {
  const helpMsg = "Commands available:\n\nBAL - Check balance\nHISTORY - Last 5 bookings\nSKIP - Skip today\nHELP - Show this menu\n\nTo book, wait for the daily prompt!";
  await sendWhatsAppMessage(user.phone, helpMsg);
}
