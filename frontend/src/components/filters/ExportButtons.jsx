const ExportButtons = ({
  onExcel,
  onCsv,
  loading = false,
}) => (
  <div className="flex flex-wrap gap-2">
    {onExcel && (
      <button
        type="button"
        onClick={onExcel}
        disabled={loading}
        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Exporting..." : "Export Excel"}
      </button>
    )}

    {onCsv && (
      <button
        type="button"
        onClick={onCsv}
        disabled={loading}
        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Exporting..." : "Export CSV"}
      </button>
    )}
  </div>
);

export default ExportButtons;
