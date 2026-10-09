import { useEffect, useState } from "react";

import { getDashboardApi } from "../../services/dashboard.api";
import DashboardCard from "./DashboardCard";
import DashboardTable from "./DashboardTable";
import { DASHBOARD_CARDS } from "./dashboard.constants";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardApi();
      const payload = response?.data || response || {};

      setDashboard(payload);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setError(err?.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  const summary = dashboard?.leads || {};
  const followUps = dashboard?.followUps || {};
  const calls = dashboard?.calls || {};
  const target = dashboard?.target || {};
  const performanceRows = dashboard?.performance?.performance || dashboard?.performance || [];

  const stats = DASHBOARD_CARDS.map((card) => ({
    ...card,
    value: card.getValue({ summary, followUps, calls }),
  }));

  const telecallerRows = Array.isArray(performanceRows)
    ? performanceRows.map((item, index) => {
        const telecaller = item.telecaller || {};

        return {
          id: telecaller.id || index,
          name: telecaller.name || "Unknown",
          totalLeads: item.totalLeads ?? 0,
          callsMade: item.callsMade ?? 0,
          connectedCalls: item.connectedCalls ?? 0,
          loginCount: item.loginCount ?? 0,
          approvedCount: item.approvedCount ?? 0,
          disbursedCount: item.disbursedCount ?? 0,
        };
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">FinBoat CRM overview</p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <DashboardCard
            key={card.key}
            title={card.label}
            value={card.value}
          />
        ))}
      </div>

      {target?.available && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Target Achievement</p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {target.achievedLeads ?? 0} / {target.targetLeads ?? 0} leads
              </h3>
            </div>

            <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {target.achievementPercentage ?? 0}%
            </div>
          </div>
        </div>
      )}

      <DashboardTable
        title="Telecaller Performance"
        rows={telecallerRows}
        columns={[
          { key: "name", label: "Telecaller" },
          { key: "totalLeads", label: "Leads" },
          { key: "callsMade", label: "Calls" },
          { key: "connectedCalls", label: "Connected" },
          { key: "loginCount", label: "Login" },
          { key: "approvedCount", label: "Approved" },
          { key: "disbursedCount", label: "Disbursed" },
        ]}
      />
    </div>
  );
};

export default Dashboard;