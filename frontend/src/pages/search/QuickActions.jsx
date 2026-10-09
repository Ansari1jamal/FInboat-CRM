import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Create Lead",
      icon: "➕",
      path: "/leads/create",
    },
    {
      label: "Applications",
      icon: "📄",
      path: "/applications",
    },
    {
      label: "Loans",
      icon: "💰",
      path: "/loans",
    },
    {
      label: "Collections",
      icon: "💳",
      path: "/collections",
    },
    {
      label: "Reports",
      icon: "📊",
      path: "/reports",
    },
    {
      label: "Notifications",
      icon: "🔔",
      path: "/notifications",
    },
  ];

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.path}
            type="button"
            onClick={() => navigate(action.path)}
            className="rounded-xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="text-xl">
              {action.icon}
            </div>

            <p className="mt-2 text-sm font-medium text-gray-900">
              {action.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}