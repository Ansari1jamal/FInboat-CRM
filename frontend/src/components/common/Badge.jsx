const statusStyles = {
  NEW:
    "bg-blue-50 text-blue-700 ring-blue-200",

  INTERESTED:
    "bg-indigo-50 text-indigo-700 ring-indigo-200",

  DOCUMENTS_PENDING:
    "bg-amber-50 text-amber-700 ring-amber-200",

  LOGIN:
    "bg-purple-50 text-purple-700 ring-purple-200",

  APPROVED:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",

  DISBURSED:
    "bg-green-50 text-green-700 ring-green-200",

  REJECTED:
    "bg-red-50 text-red-700 ring-red-200",

  PENDING:
    "bg-amber-50 text-amber-700 ring-amber-200",

  PARTIAL:
    "bg-amber-50 text-amber-700 ring-amber-200",

  PARTIAL_PAID:
    "bg-amber-50 text-amber-700 ring-amber-200",

  PROMISED:
    "bg-amber-50 text-amber-700 ring-amber-200",

  OVERDUE:
    "bg-red-50 text-red-700 ring-red-200",

  DONE:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",

  PAID:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",

  MISSED:
    "bg-red-50 text-red-700 ring-red-200",

  NO_RESPONSE:
    "bg-red-50 text-red-700 ring-red-200",

  DISPUTED:
    "bg-red-50 text-red-700 ring-red-200",

  CONTACTED:
    "bg-blue-50 text-blue-700 ring-blue-200",

  WAIVED:
    "bg-slate-100 text-slate-700 ring-slate-200",

  CANCELLED:
    "bg-slate-100 text-slate-700 ring-slate-200",

  VERIFIED:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const formatStatus = (status = "") => {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

const Badge = ({
  status,
  children,
}) => {
  const text =
    children || formatStatus(status);

  const style =
    statusStyles[status] ||
    "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full px-2.5 py-1
        text-xs font-semibold
        ring-1 ring-inset
        ${style}
      `}
    >
      {text}
    </span>
  );
};

export default Badge;