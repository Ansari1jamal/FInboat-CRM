import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="flex min-h-[70vh] items-center justify-center px-4">
    <div className="text-center">
      <p className="text-7xl font-bold text-slate-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Go to Dashboard
      </Link>
    </div>
  </main>
);

export default NotFound;
