import { MealType } from '@/types/enums';

export const TIFFIN_CONFIG = {
  [MealType.Breakfast]: {
    cost: 1, // Tiffin unit
    price: 80, // ₹
    deliveryWindow: '8:30 AM - 9:30 AM',
    deadline: '8:00 AM'
  },
  [MealType.Lunch]: {
    cost: 1,
    price: 130,
    deliveryWindow: '12:30 PM - 2:00 PM',
    deadline: '10:00 AM'
  },
  [MealType.Dinner]: {
    cost: 1,
    price: 130,
    deliveryWindow: '7:30 PM - 9:00 PM',
    deadline: '5:00 PM'
  },
  [MealType.Both]: {
    cost: 2,
    price: 260,
    deliveryWindow: 'Lunch & Dinner Windows',
    deadline: '10:00 AM (for Lunch)'
  }
};
