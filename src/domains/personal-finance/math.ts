// Pure finance functions used by the personal-finance domain to compute
// and check lesson answers. No state, no I/O, no hardcoded numbers — the
// same input always produces the same output. Rates are percentages
// (6 means 6% per year) and all values are in the same currency unit.
// Results are rounded to whole rupiah.

const MONTHS_PER_YEAR = 12

function monthlyRate(annualRate: number): number {
  return annualRate / 100 / MONTHS_PER_YEAR
}

/**
 * Total savings after `years` with monthly deposits and compound interest.
 */
export function futureValue(
  initial: number,
  monthlyDeposit: number,
  annualRate: number,
  years: number,
): number {
  const i = monthlyRate(annualRate)
  const n = years * MONTHS_PER_YEAR
  if (i === 0) {
    return Math.round(initial + monthlyDeposit * n)
  }
  const growth = Math.pow(1 + i, n)
  const value = initial * growth + monthlyDeposit * ((growth - 1) / i)
  return Math.round(value)
}

/**
 * Monthly installment to repay a loan over `months`.
 */
export function monthlyPayment(
  principal: number,
  annualRate: number,
  months: number,
): number {
  const i = monthlyRate(annualRate)
  if (i === 0) {
    return Math.round(principal / months)
  }
  const growth = Math.pow(1 + i, months)
  const payment = principal * ((i * growth) / (growth - 1))
  return Math.round(payment)
}

/**
 * Number of months needed to reach `target` with monthly deposits and
 * compound interest, rounded up to the next whole month.
 */
export function monthsToTarget(
  target: number,
  monthlyDeposit: number,
  annualRate: number,
): number {
  const i = monthlyRate(annualRate)
  if (i === 0) {
    return Math.ceil(target / monthlyDeposit)
  }
  const months = Math.log((target * i) / monthlyDeposit + 1) / Math.log(1 + i)
  return Math.ceil(months)
}
