import { describe, expect, it } from "vitest";
import { calculateCartTotals, clampQuantity } from "./storefront";

describe("storefront cart rules", () => {
  it("adds the standard shipping fee below the free-shipping threshold", () => {
    expect(calculateCartTotals([{ price: 42, quantity: 1 }])).toEqual({
      subtotal: 42,
      shipping: 8,
      total: 50,
    });
  });

  it("waives shipping at the threshold and for an empty cart", () => {
    expect(calculateCartTotals([{ price: 25, quantity: 3 }])).toEqual({
      subtotal: 75,
      shipping: 0,
      total: 75,
    });
    expect(calculateCartTotals([])).toEqual({ subtotal: 0, shipping: 0, total: 0 });
  });

  it("clamps quantities to safe integer stock bounds", () => {
    expect(clampQuantity(3.8, 4)).toBe(3);
    expect(clampQuantity(9, 4)).toBe(4);
    expect(clampQuantity(-2, 4)).toBe(0);
    expect(clampQuantity(2, -1)).toBe(0);
  });
});
