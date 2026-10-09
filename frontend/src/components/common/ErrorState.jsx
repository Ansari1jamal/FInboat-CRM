const ErrorState = ({
  title = "Something went wrong",
  message = "We couldn't load this data.",
  onRetry,
}) => {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <h3 className="font-semibold text-red-800">
        {title}
      </h3>

      <p className="mt-1 text-sm text-red-600">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;