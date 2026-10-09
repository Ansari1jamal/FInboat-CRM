// ========================================
// MASK PAN
// ========================================
//
// Example:
// ABCDE1234F
// ↓
// ABCD*****F
//

const maskPan = (pan) => {
  if (!pan) {
    return null;
  }

  const value =
    String(pan)
      .trim()
      .toUpperCase();

  if (value.length < 5) {
    return "*****";
  }

  const firstFour =
    value.slice(0, 4);

  const lastOne =
    value.slice(-1);

  return `${firstFour}*****${lastOne}`;
};

// ========================================
// MASK AADHAAR
// ========================================
//
// Example:
// 123456789012
// ↓
// ********9012
//

const maskAadhaar = (aadhaar) => {
  if (!aadhaar) {
    return null;
  }

  const value =
    String(aadhaar)
      .replace(/\s/g, "");

  if (value.length < 4) {
    return "********";
  }

  const lastFour =
    value.slice(-4);

  return `********${lastFour}`;
};

// ========================================
// MASK BANK ACCOUNT
// ========================================
//
// Example:
// 123456789012
// ↓
// ********9012
//

const maskBankAccount = (
  accountNumber
) => {
  if (!accountNumber) {
    return null;
  }

  const value =
    String(accountNumber)
      .replace(/\s/g, "");

  if (value.length < 4) {
    return "********";
  }

  const lastFour =
    value.slice(-4);

  return `********${lastFour}`;
};

// ========================================
// MASK PHONE
// ========================================
//
// Example:
// 9876543210
// ↓
// ******3210
//

const maskPhone = (phone) => {
  if (!phone) {
    return null;
  }

  const value =
    String(phone)
      .replace(/\s/g, "");

  if (value.length < 4) {
    return "******";
  }

  const lastFour =
    value.slice(-4);

  const maskedLength =
    Math.max(
      value.length - 4,
      0
    );

  return (
    "*".repeat(maskedLength) +
    lastFour
  );
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  maskPan,
  maskAadhaar,
  maskBankAccount,
  maskPhone,
};