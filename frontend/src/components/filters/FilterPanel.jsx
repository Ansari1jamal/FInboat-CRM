const FilterPanel = ({
  onApply,
  onReset,
  children,
}) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>

    <div className="mt-5 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onApply}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Apply Filters
      </button>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        Reset
      </button>
    </div>
  </div>
);

export default FilterPanel;
