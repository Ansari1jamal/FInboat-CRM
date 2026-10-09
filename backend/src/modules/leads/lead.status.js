const LeadStatus = {
  NEW: "NEW",
  INTERESTED: "INTERESTED",
  DOCUMENTS_PENDING: "DOCUMENTS_PENDING",
  LOGIN: "LOGIN",
  APPROVED: "APPROVED",
  DISBURSED: "DISBURSED",
  REJECTED: "REJECTED",
};

const allowedTransitions = {
  NEW: [
    "INTERESTED",
    "REJECTED",
  ],

  INTERESTED: [
    "DOCUMENTS_PENDING",
    "REJECTED",
  ],

  DOCUMENTS_PENDING: [
    "LOGIN",
    "REJECTED",
  ],

  LOGIN: [
    "APPROVED",
    "REJECTED",
  ],

  APPROVED: [
    "DISBURSED",
    "REJECTED",
  ],

  DISBURSED: [],

  REJECTED: [],
};

const canChangeStatus = (
  currentStatus,
  newStatus
) => {
  if (currentStatus === newStatus) {
    return false;
  }

  return (
    allowedTransitions[currentStatus] || []
  ).includes(newStatus);
};

module.exports = {
  LeadStatus,
  allowedTransitions,
  canChangeStatus,
};