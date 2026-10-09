import {
  getResultIcon,
  getResultTypeLabel,
} from "./search.utils";

export default function SearchResultCard({
  result,
  onClick,
}) {
  const {
    type,
    title,
    subtitle,
    meta,
    status,
  } = result;

  return (
    <button
      type="button"
      onClick={() => onClick(result)}
      className="w-full border-b p-4 text-left transition hover:bg-gray-50"
    >
      <div className="flex gap-3">
        {/* ICON */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
          {getResultIcon(type)}
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {getResultTypeLabel(type)}
              </p>

              <h3 className="mt-1 truncate text-sm font-semibold text-gray-900">
                {title}
              </h3>
            </div>

            {status && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {status}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">
              {subtitle}
            </p>
          )}

          {meta && (
            <p className="mt-1 text-xs text-gray-400">
              {meta}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}