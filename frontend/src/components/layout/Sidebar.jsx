import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  ClipboardCheck,
  Bell,
  BarChart3,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "Applications", path: "/applications", icon: FileText },
  { label: "Loans", path: "/loans", icon: Wallet },
  { label: "Collections", path: "/collections", icon: ClipboardCheck },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Global Search", path: "/search", icon: Search },
  { label: "Notifications", path: "/notifications", icon: Bell },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user } = useAuth();
  const visibleMenuItems =
    user?.role === "ADMIN"
      ? [...menuItems, { label: "Add User", path: "/register", icon: Users }]
      : menuItems;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-default bg-black/40 lg:hidden"
        />
      )}

      <aside
        id="primary-navigation"
        aria-label="Primary navigation"
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-bold text-slate-950">F</div>
            <span className="text-lg font-bold">FinBoat</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            ×
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {visibleMenuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
                ${isActive ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
