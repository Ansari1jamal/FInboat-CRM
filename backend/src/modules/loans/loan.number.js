const crypto = require("crypto");

const generateLoanAccountNumber = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const random = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `LAN-${year}${month}${day}-${random}`;
};

module.exports = {
  generateLoanAccountNumber,
};