// Tests for finance math function.
import { describe, expect, it } from "vitest";
import { futureValue, monthlyPayment, monthsToTarget } from "#/domains/personal-finance/math.ts";

describe("futureValue", () => {
  it("returns initial principal plus deposits when rate is 0", () => {
    expect(futureValue(1_000_000, 500_000, 0, 2)).toBe(13_000_000);
  });

  it("matches the PRD screen 3 example (500k, 6%, 10 years ~82 juta)", () => {
    const result = futureValue(0, 500_000, 6, 10);
    expect(result).toBeGreaterThanOrEqual(80_000_000);
    expect(result).toBeLessThanOrEqual(84_000_000);
    expect(result).toBe(81_939_673);
  });

  it("grows deposits into the future with compound interest", () => {
    expect(futureValue(0, 1_000_000, 6, 10)).toBeGreaterThan(120_000_000);
  });

  it("grows the initial principal too", () => {
    const withInitial = futureValue(10_000_000, 0, 6, 10);
    expect(withInitial).toBeGreaterThan(10_000_000);
  });
});

describe("monthlyPayment", () => {
  it("divides principal evenly when rate is 0", () => {
    expect(monthlyPayment(12_000_000, 0, 12)).toBe(1_000_000);
  });

  it("payment exceeds the zero-interest baseline", () => {
    const payment = monthlyPayment(12_000_000, 12, 12);
    expect(payment).toBeGreaterThan(1_000_000);
  });

  it("produces a consistent principal schedule", () => {
    const payment = monthlyPayment(100_000_000, 24, 60);
    expect(payment).toBeGreaterThan(1_600_000);
    expect(payment).toBeLessThan(3_000_000);
  });

  it("handles a 30% credit card rate example from the PRD lesson", () => {
    const payment = monthlyPayment(100_000_000, 30, 12);
    expect(payment).toBeGreaterThan(9_000_000);
    expect(payment).toBeLessThan(10_000_000);
  });
});

describe("monthsToTarget", () => {
  it("divides target by deposit when rate is 0", () => {
    expect(monthsToTarget(10_000_000, 1_000_000, 0)).toBe(10);
  });

  it("reaches target early thanks to interest", () => {
    const months = monthsToTarget(10_000_000, 1_000_000, 6);
    expect(months).toBe(10);
  });

  it("rounds up to the next whole month", () => {
    const months = monthsToTarget(1_000_000, 300_000, 0);
    expect(months).toBe(4);
  });
});
