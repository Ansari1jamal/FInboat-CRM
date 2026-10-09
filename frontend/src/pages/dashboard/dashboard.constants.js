export const DASHBOARD_CARDS = [
  {
    key: "totalLeads",
    label: "Total Leads",
    getValue: ({ summary }) => summary?.total ?? 0,
  },
  {
    key: "callsToday",
    label: "Calls Today",
    getValue: ({ calls }) => calls?.today ?? 0,
  },
  {
    key: "followUpsDue",
    label: "Follow-ups Due",
    getValue: ({ followUps }) => followUps?.dueTodayCount ?? 0,
  },
  {
    key: "login",
    label: "Login",
    getValue: ({ summary }) => summary?.login ?? 0,
  },
  {
    key: "approved",
    label: "Approval",
    getValue: ({ summary }) => summary?.approved ?? 0,
  },
  {
    key: "disbursed",
    label: "Disbursed",
    getValue: ({ summary }) => summary?.disbursed ?? 0,
  },
  {
    key: "rejected",
    label: "Rejected",
    getValue: ({ summary }) => summary?.rejected ?? 0,
  },
];
