const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  error = "",
  required = false,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full resize-y rounded-xl border
          bg-white px-4 py-3
          text-sm outline-none
          transition
          ${
            error
              ? "border-red-400"
              : "border-slate-300"
          }
        `}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;