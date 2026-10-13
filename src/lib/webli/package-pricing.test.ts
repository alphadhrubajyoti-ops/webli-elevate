import { describe, expect, test } from "bun:test";
import { calculateFinalPrice } from "./package-pricing";

describe("package pricing", () => {
  test("applies the entered discount percentage to the original price", () => {
    expect(calculateFinalPrice(50_000, 20)).toBe(40_000);
  });

  test("keeps the current price when there is no discount", () => {
    expect(calculateFinalPrice(15_000, 0)).toBe(15_000);
  });

  test("rejects discounts outside the 0–100 percent range", () => {
    expect(calculateFinalPrice(10_000, 101)).toBeNull();
    expect(calculateFinalPrice(10_000, -1)).toBeNull();
  });
});