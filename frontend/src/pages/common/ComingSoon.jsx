const ComingSoon = ({ title }) => {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">This module is being built.</p>
    </div>
  );
};

export default ComingSoon;
