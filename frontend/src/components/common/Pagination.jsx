import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() =>
            onPageChange(page - 1)
          }
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="min-w-10 text-center text-sm font-medium">
          {page}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() =>
            onPageChange(page + 1)
          }
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;