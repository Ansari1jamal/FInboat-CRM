const { Prisma } = require("@prisma/client");
const { calculateEMI } = require("../src/modules/repayments/emi.calculator");

describe("calculateEMI", () => {
  test("uses Decimal arithmetic and rounds zero-interest schedules to cents", () => {
    const emi = calculateEMI({
      principal: "10000.00",
      annualInterestRate: "0",
      tenureMonths: 3,
    });

    expect(emi).toBeInstanceOf(Prisma.Decimal);
    expect(emi.toFixed(2)).toBe("3333.33");
  });

  test("calculates a standard reducing-balance EMI to cents", () => {
    const emi = calculateEMI({
      principal: "100000.00",
      annualInterestRate: "12",
      tenureMonths: 12,
    });

    expect(emi.toFixed(2)).toBe("8884.88");
  });

  test("rejects non-finite financial inputs", () => {
    expect(() =>
      calculateEMI({
        principal: "Infinity",
        annualInterestRate: "12",
        tenureMonths: 12,
      })
    ).toThrow("Principal amount must be greater than 0");
  });
});
