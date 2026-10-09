const DOCUMENT_STATUS = {
  PENDING: "PENDING",
  RECEIVED: "RECEIVED",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

const isValidDocumentStatus = (status) => {
  return Object.values(DOCUMENT_STATUS).includes(status);
};

module.exports = {
  DOCUMENT_STATUS,
  isValidDocumentStatus,
};