const EmptyState = ({
  title = "No data found",
  description = "There is nothing to display here.",
  action,
}) => {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        —
      </div>

      <h3 className="text-base font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;