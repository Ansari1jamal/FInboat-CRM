const DashboardTable = ({ title, columns = [], rows = [], loading = false }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>

      {loading ? (
        <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-500">No data found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {rows.map((row, index) => (
                <tr key={row.id || row.name || index} className="align-top">
                  {columns.map((column) => (
                    <td key={`${row.id || row.name || index}-${column.key}`} className="px-4 py-3 text-sm text-slate-700">
                      {column.render ? column.render(row) : row[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardTable;
