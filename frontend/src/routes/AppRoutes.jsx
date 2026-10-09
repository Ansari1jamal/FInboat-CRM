import { Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Leads from "../pages/leads/Leads";
import CreateLead from "../pages/leads/CreateLead";
import BulkLeadUpload from "../pages/leads/BulkLeadUpload";
import LeadDetails from "../pages/leads/LeadDetails";
import LeadTimelinePage from "../pages/leads/LeadTimelinePage";
import EditLead from "../pages/leads/EditLead";
import Calls from "../pages/calls/Calls";
import LogCall from "../pages/calls/LogCall";
import LandingPage from "../pages/LandingPage";
import Forbidden from "../pages/errors/Forbidden";
import NotFound from "../pages/errors/NotFound";
import FollowUps from "../pages/followups/FollowUps";

import CreateFollowUp from "../pages/followups/CreateFollowUp";
import Documents from "../pages/documents/Documents";
import UploadDocument from "../pages/documents/UploadDocument";
import Applications from "../pages/applications/Applications";
import CreateApplication from "../pages/applications/CreateApplication";
import ApplicationDetails from "../pages/applications/ApplicationDetails";
import Loans from "../pages/loans/Loans";
import LoanDetails from "../pages/loans/LoanDetails";
import EmiSchedule from "../pages/loans/EmiSchedule";
import Repayments from "../pages/loans/Repayments";
import Collections from "../pages/collections/Collections";
import CollectionDetails from "../pages/collections/CollectionDetails";
import Notifications from "../pages/notifications/Notifications";
import FinancialReports from "../pages/reports/FinancialReports";
import GlobalSearch from "../pages/search/GlobalSearch";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/create" element={<CreateLead />} />
          <Route path="/leads/bulk-upload" element={<BulkLeadUpload />} />
          <Route path="/leads/:leadId/timeline" element={<LeadTimelinePage />} />
          <Route path="/leads/:leadId" element={<LeadDetails />} />
          <Route path="/leads/:leadId/edit" element={<EditLead />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/calls/log" element={<LogCall />} />
          <Route path="/followups" element={<FollowUps />} />
          <Route path="/followups/create" element={<CreateFollowUp />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/upload" element={<UploadDocument />} />

          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/create" element={<CreateApplication />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />

          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/:id" element={<LoanDetails />} />
          <Route path="/loans/:id/emi" element={<EmiSchedule />} />
          <Route path="/loans/:id/repayments" element={<Repayments />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetails />} />
          <Route path="/reports" element={<FinancialReports />} />
          <Route path="/reports/financial" element={<FinancialReports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<GlobalSearch />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
