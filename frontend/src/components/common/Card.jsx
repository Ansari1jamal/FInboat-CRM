const Card = ({
  children,
  title,
  description,
  actions,
  className = "",
}) => {
  return (
    <section
      className={`
        rounded-2xl
        bg-white
        shadow-sm
        ring-1
        ring-slate-200
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-slate-900">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>

          {actions}
        </div>
      )}

      <div className="p-5">
        {children}
      </div>
    </section>
  );
};

export default Card;