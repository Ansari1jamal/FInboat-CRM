const variants = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-300",

  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-200",

  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-200",

  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-200",

  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        gap-2 rounded-xl
        font-semibold
        transition
        focus:outline-none
        focus:ring-4
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}

      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;