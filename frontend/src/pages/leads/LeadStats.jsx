import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Total Leads",
    value: 0,
    icon: Users,
  },
  {
    title: "New Leads",
    value: 0,
    icon: UserCheck,
  },
  {
    title: "Pending",
    value: 0,
    icon: Clock,
  },
  {
    title: "Disbursed",
    value: 0,
    icon: CheckCircle2,
  },
];

const LeadStats = ({
  data = {},
}) => {
  const values = [
    data.total ?? 0,
    data.new ?? 0,
    data.pending ?? 0,
    data.disbursed ?? 0,
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(
        (
          {
            title,
            icon: Icon,
          },
          index
        ) => (
          <div
            key={title}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {title}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon size={20} />
              </div>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {values[index]}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default LeadStats;