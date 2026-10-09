export const APPLICATION_STATUS_OPTIONS = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "SUBMITTED",
    label: "Submitted",
  },
  {
    value: "LOGIN",
    label: "Login",
  },
  {
    value: "APPROVED",
    label: "Approved",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
  {
    value: "DISBURSED",
    label: "Disbursed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

export const APPLICATION_STATUS_FLOW = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["LOGIN", "REJECTED", "CANCELLED"],
  LOGIN: ["APPROVED", "REJECTED"],
  APPROVED: ["DISBURSED", "REJECTED"],
  REJECTED: [],
  DISBURSED: [],
  CANCELLED: [],
};
