const { Prisma } = require("@prisma/client");

const Decimal = Prisma.Decimal;

const calculateEMI = ({
  principal,
  annualInterestRate,
  tenureMonths,
}) => {
  const principalAmount = new Decimal(principal);
  const annualRate = new Decimal(annualInterestRate);
  const months = Number(tenureMonths);

  if (!principalAmount.isFinite() || !principalAmount.isPositive()) {
    throw new Error("Principal amount must be greater than 0");
  }

  if (!Number.isInteger(months) || months <= 0) {
    throw new Error("Tenure must be greater than 0");
  }

  if (!annualRate.isFinite() || annualRate.isNegative()) {
    throw new Error("Interest rate cannot be negative");
  }

  if (annualRate.isZero()) {
    return principalAmount
      .dividedBy(months)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  const monthlyRate = annualRate.dividedBy(1200);
  const factor = new Decimal(1).plus(monthlyRate).pow(months);

  return principalAmount
    .times(monthlyRate)
    .times(factor)
    .dividedBy(factor.minus(1))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
};

module.exports = {
  calculateEMI,
};