// ✅ Utility Type Definitions
export interface Portion {
  portion: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  _id?: string; // <-- made optional to match IItem from Mongoose
  name: string;
  portions: Portion[];
}

export interface Order {
  items: OrderItem[];
}

/**
 * 🔹 Calculates total order amount
 * @param order - Full order document or plain object
 * @returns Total price number
 */
export const calculate_Order_Total = (order: Order | null): number => {
  if (!order || !order.items) return 0;

  return order.items.reduce((total, item) => {
    const itemTotal = item.portions.reduce((sum, portion) => {
      const price = portion.price || 0;
      const quantity = portion.quantity || 0;
      return sum + price * quantity;
    }, 0);

    return total + itemTotal;
  }, 0);
};
