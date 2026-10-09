export const COLLECTION_STATUS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "PROMISED", label: "Promised" },
  { value: "PAID", label: "Paid" },
  { value: "MISSED", label: "Missed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const COLLECTION_STATUS_VARIANTS = {
  PENDING: "warning",
  CONTACTED: "default",
  PROMISED: "warning",
  PAID: "success",
  MISSED: "danger",
  CANCELLED: "default",
};

export const COLLECTION_TYPES = [
  { value: "EMI_DUE", label: "EMI Due" },
  { value: "EMI_OVERDUE", label: "EMI Overdue" },
  { value: "PAYMENT_PROMISE", label: "Payment Promise" },
  { value: "COLLECTION_CALL", label: "Collection Call" },
];
