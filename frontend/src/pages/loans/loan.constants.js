export const LOAN_STATUS_OPTIONS = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "CLOSED",
    label: "Closed",
  },
  {
    value: "FORECLOSED",
    label: "Foreclosed",
  },
  {
    value: "WRITTEN_OFF",
    label: "Written Off",
  },
];

export const LOAN_STATUS_FLOW = {
  ACTIVE: ["CLOSED", "FORECLOSED", "WRITTEN_OFF"],

  CLOSED: [],

  FORECLOSED: [],

  WRITTEN_OFF: [],
};