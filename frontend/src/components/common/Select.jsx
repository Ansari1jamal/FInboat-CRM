const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  error = "",
  required = false,
  disabled = false,
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

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full rounded-xl border
          bg-white px-4 py-3
          text-sm text-slate-900
          outline-none transition
          disabled:cursor-not-allowed
          disabled:bg-slate-100
          ${
            error
              ? "border-red-400"
              : "border-slate-300"
          }
        `}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;