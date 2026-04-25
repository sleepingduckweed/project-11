import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Transaction from '@/models/Transaction';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { MealType, OrderStatus, TransactionType } from '@/types/enums';

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
    const from = message.from;
    const text = message.text?.body?.trim().toUpperCase();

    console.info(`Incoming WhatsApp from ${from}: "${text}"`);

    if (!text) return NextResponse.json({ status: 'ok' });

    await connectToDatabase();
    
    let user = await User.findOne({ 
      $or: [
        { phone: from }, 
        { phone: `+${from}` },
        { phone: from.replace(/^\+/, '') }
      ] 
    });

    if (!user) {
      console.warn(`Unregistered user messaged: ${from}`);
      await sendWhatsAppMessage(from, "Hi! It seems you're not registered with Kiyamaa's Kitchen. Please contact the admin to register your number.");
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
      await handleFallback(user);
    }
  }

  return NextResponse.json({ status: 'ok' });
}

// Helper: get balance for a specific meal type
function getBalanceForMeal(user: any, mealType: string): number {
  if (mealType === MealType.Breakfast) return user.breakfastBalance || 0;
  if (mealType === MealType.Dinner) return user.dinnerBalance || 0;
  return user.lunchBalance || 0; // Default to lunch
}

// Helper: format all balances for display
function formatBalanceSummary(user: any): string {
  const b = user.breakfastBalance || 0;
  const l = user.lunchBalance || 0;
  const d = user.dinnerBalance || 0;
  return `🌅 Breakfast: *${b}* | ☀️ Lunch: *${l}* | 🌙 Dinner: *${d}*`;
}

async function handleFallback(user: any) {
  let message = `🍱 *Kiymaa's Kitchen*\n\nYour Balances:\n${formatBalanceSummary(user)}\n\n`;

  const today = new Date();
  today.setHours(0,0,0,0);
  const bookings = await Order.find({ 
    userId: user._id, 
    bookingDate: { $gte: today },
    status: OrderStatus.Booked 
  }).sort({ bookingDate: 1 });

  if (bookings.length > 0) {
    message += `*Current Bookings:*\n`;
    bookings.forEach((b: any) => {
      const dateStr = new Date(b.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      message += `• ${dateStr} - ${b.mealType}\n`;
    });
    message += `\n`;
  } else {
    message += `No active bookings found.\n\n`;
  }

  if (user.pendingBroadcast) {
    message += `⚠️ *Action Required:*\nNeed tiffin for ${user.pendingBroadcast.slotLabel}?\nReply with *YES* or *NO*\n\n`;
  }

  message += `*Commands:*\nBAL - Check Balance\nHISTORY - Last 5 orders\nSKIP - Skip today\nHELP - Show all options`;

  await sendWhatsAppMessage(user.phone, message);
}

async function handleYesResponse(user: any) {
  if (!user.pendingBroadcast) {
    await sendWhatsAppMessage(user.phone, "You don't have any pending booking prompts. To check your balance, reply with BAL.");
    return;
  }

  const { slotLabel, slotDate, mealType } = user.pendingBroadcast;

  // Determine balance bucket and deduction
  const bucketMap: Record<string, { field: string; label: string }> = {
    [MealType.Breakfast]: { field: 'breakfastBalance', label: 'Breakfast' },
    [MealType.Lunch]: { field: 'lunchBalance', label: 'Lunch' },
    [MealType.Dinner]: { field: 'dinnerBalance', label: 'Dinner' },
    ['Both']: { field: 'lunchBalance', label: 'Lunch & Dinner' }, // checks both
  };

  const isBoth = mealType === 'Both';
  const lunchBalance = user.lunchBalance || 0;
  const dinnerBalance = user.dinnerBalance || 0;
  const targetBalance = isBoth ? Math.min(lunchBalance, dinnerBalance) : getBalanceForMeal(user, mealType);
  const tiffins = isBoth ? 2 : 1;

  if (isBoth && (lunchBalance < 1 || dinnerBalance < 1)) {
    await sendWhatsAppMessage(user.phone, `Insufficient balance for ${mealType}.\n${formatBalanceSummary(user)}\nPlease recharge to continue.`);
    return;
  } else if (!isBoth && targetBalance < 1) {
    await sendWhatsAppMessage(user.phone, `Insufficient ${mealType} balance.\n${formatBalanceSummary(user)}\nPlease recharge to continue.`);
    return;
  }

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

  // Deduct from correct buckets
  if (isBoth) {
    user.lunchBalance = lunchBalance - 1;
    user.dinnerBalance = dinnerBalance - 1;
  } else if (mealType === MealType.Breakfast) {
    user.breakfastBalance = (user.breakfastBalance || 0) - 1;
  } else if (mealType === MealType.Lunch) {
    user.lunchBalance = lunchBalance - 1;
  } else if (mealType === MealType.Dinner) {
    user.dinnerBalance = dinnerBalance - 1;
  }
  user.pendingBroadcast = undefined;
  await user.save();

  await Order.create({
    userId: user._id,
    bookingDate: checkDate,
    mealType,
    tiffinsDeducted: tiffins,
    status: OrderStatus.Booked
  });

  await Transaction.create({
    userId: user._id,
    type: TransactionType.Debit,
    tiffinCount: tiffins,
    mealType,
    reason: `Prompt: ${slotLabel}`
  });

  await sendWhatsAppMessage(user.phone, `✅ *Confirmed!* ${mealType} booked for ${new Date(slotDate).toLocaleDateString()}.\n\nUpdated balances:\n${formatBalanceSummary(user)}\n\nThank you! 🍱`);
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
  let mealType: string = 'None';
  
  if (choice === '1') { tiffins = 1; mealType = MealType.Lunch; }
  else if (choice === '2') { tiffins = 1; mealType = MealType.Dinner; }
  else if (choice === '3') { tiffins = 2; mealType = 'Both'; }
  else if (choice === '0') { tiffins = 0; mealType = 'None'; }

  if (tiffins === 0) {
    await sendWhatsAppMessage(user.phone, "No booking made for today. Have a great day!");
    return;
  }

  const isBoth = mealType === 'Both';
  const lunchBalance = user.lunchBalance || 0;
  const dinnerBalance = user.dinnerBalance || 0;

  if (isBoth && (lunchBalance < 1 || dinnerBalance < 1)) {
    await sendWhatsAppMessage(user.phone, `Insufficient balance for ${mealType}.\n${formatBalanceSummary(user)}\nPlease recharge to book meals.`);
    return;
  } else if (!isBoth && getBalanceForMeal(user, mealType) < 1) {
    await sendWhatsAppMessage(user.phone, `Insufficient ${mealType} balance.\n${formatBalanceSummary(user)}\nPlease recharge to book meals.`);
    return;
  }

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const existingOrder = await Order.findOne({ userId: user._id, bookingDate: today });
  if (existingOrder) {
    await sendWhatsAppMessage(user.phone, "You have already made a booking for today.");
    return;
  }

  // Deduct from correct buckets
  if (isBoth) {
    user.lunchBalance = lunchBalance - 1;
    user.dinnerBalance = dinnerBalance - 1;
  } else if (mealType === MealType.Breakfast) {
    user.breakfastBalance = (user.breakfastBalance || 0) - 1;
  } else if (mealType === MealType.Lunch) {
    user.lunchBalance = lunchBalance - 1;
  } else if (mealType === MealType.Dinner) {
    user.dinnerBalance = dinnerBalance - 1;
  }
  await user.save();

  await Order.create({
    userId: user._id,
    bookingDate: today,
    mealType,
    tiffinsDeducted: tiffins,
    status: OrderStatus.Booked
  });

  await Transaction.create({
    userId: user._id,
    type: TransactionType.Debit,
    tiffinCount: tiffins,
    mealType,
    reason: mealType
  });

  const updatedBalances = formatBalanceSummary(user);
  await sendWhatsAppMessage(user.phone, `Confirmed: ${mealType} booked for today.\n${tiffins} tiffin(s) deducted.\n\nRemaining:\n${updatedBalances}`);

  // Low balance reminder
  if ((user.lunchBalance || 0) < 2 || (user.dinnerBalance || 0) < 2) {
     await sendWhatsAppMessage(user.phone, "⚠️ Your balance is running low. Please recharge soon to continue uninterrupted tiffin service.");
  }
}

async function handleBalance(user: any) {
  await sendWhatsAppMessage(user.phone, `🍱 *Your Tiffin Balances:*\n\n${formatBalanceSummary(user)}`);
}

async function handleHistory(user: any) {
  const lastOrders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
  if (lastOrders.length === 0) {
    await sendWhatsAppMessage(user.phone, "No booking history found.");
    return;
  }

  let historyMsg = "Last bookings:\n\n";
  lastOrders.forEach((order: any) => {
    const dateStr = new Date(order.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    historyMsg += `${dateStr} - ${order.mealType} (${order.tiffinsDeducted})\n`;
  });

  await sendWhatsAppMessage(user.phone, historyMsg);
}

async function handleSkip(user: any) {
    await sendWhatsAppMessage(user.phone, "Got it! Skipping bookings for today.");
}

async function handleHelp(user: any) {
  const helpMsg = "Commands available:\n\nBAL - Check balance\nHISTORY - Last 5 bookings\nSKIP - Skip today\nHELP - Show this menu\n\nTo book, wait for the daily prompt!";
  await sendWhatsAppMessage(user.phone, helpMsg);
}
