const DOCUMENT_TYPES = {
  AADHAAR: "AADHAAR",
  PAN: "PAN",
  BANK_STATEMENT: "BANK_STATEMENT",
  SALARY_SLIP: "SALARY_SLIP",
  PHOTO: "PHOTO",
  ADDRESS_PROOF: "ADDRESS_PROOF",
  INCOME_PROOF: "INCOME_PROOF",
  OTHER: "OTHER",
};

const isValidDocumentType = (type) => {
  return Object.values(DOCUMENT_TYPES).includes(type);
};

module.exports = {
  DOCUMENT_TYPES,
  isValidDocumentType,
};