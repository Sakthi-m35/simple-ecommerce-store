export type CartPriceLine = {
  price: number;
  quantity: number;
};

export type CartTotals = {
  subtotal: number;
  shipping: number;
  total: number;
};

export function calculateCartTotals(
  lines: CartPriceLine[],
  freeShippingThreshold = 75,
  shippingFee = 8,
): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : shippingFee;
  return { subtotal, shipping, total: subtotal + shipping };
}

export function clampQuantity(quantity: number, stock: number): number {
  return Math.max(0, Math.min(Math.floor(quantity), Math.max(0, stock)));
}
