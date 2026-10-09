import Spinner from "./Spinner";

const LoadingState = ({
  message = "Loading...",
}) => {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner />

        <p className="text-sm text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingState;