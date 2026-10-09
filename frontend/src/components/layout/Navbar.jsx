import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = ({ onMenuClick, mobileOpen = false }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        aria-controls="primary-navigation"
        aria-expanded={mobileOpen}
        className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm font-medium text-slate-500">FinBoat CRM</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/search")}
          className="hidden w-64 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100 md:flex"
          aria-label="Open global search"
        >
          <span aria-hidden="true">🔍</span>
          <span>Search CRM...</span>
        </button>

        <NotificationBell />

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
          <p className="text-xs text-slate-500">{user?.role || ""}</p>
        </div>

        <button
          type="button"
          onClick={logoutUser}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
