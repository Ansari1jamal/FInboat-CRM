const DashboardCard = ({ title, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">{value ?? 0}</h2>
    </div>
  );
};

export default DashboardCard;
