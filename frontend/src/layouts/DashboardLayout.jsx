import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-72">
        <Navbar
          mobileOpen={mobileOpen}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
