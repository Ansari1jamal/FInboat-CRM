import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children || <Outlet />;
}
