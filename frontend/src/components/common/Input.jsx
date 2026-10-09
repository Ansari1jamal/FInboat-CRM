const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  disabled = false,
  maxLength,
  min,
  max,
  className = "",
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

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        className={`
          w-full rounded-xl border
          bg-white px-4 py-3
          text-sm text-slate-900
          outline-none transition
          placeholder:text-slate-400
          disabled:cursor-not-allowed
          disabled:bg-slate-100
          ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
          }
          ${className}
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

export default Input;