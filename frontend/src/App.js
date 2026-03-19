import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Toaster } from "./components/ui/sonner";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CollectionsPage from "./pages/CollectionsPage";
import TransactionsPage from "./pages/TransactionsPage";
import PayoutsPage from "./pages/PayoutsPage";
import PaymentLinksPage from "./pages/PaymentLinksPage";
import BeneficiariesPage from "./pages/BeneficiariesPage";
import OffersPage from "./pages/OffersPage";
import MembershipsPage from "./pages/MembershipsPage";
import UsersPage from "./pages/UsersPage";
import RevenuePage from "./pages/RevenuePage";
import PGChargesPage from "./pages/PGChargesPage";
import GSTPage from "./pages/GSTPage";
import RiskPage from "./pages/RiskPage";
import SupportPage from "./pages/SupportPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/payouts" element={<PayoutsPage />} />
            <Route path="/payment-links" element={<PaymentLinksPage />} />
            <Route path="/beneficiaries" element={<BeneficiariesPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/memberships" element={<MembershipsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/revenue" element={<RevenuePage />} />
            <Route path="/pg-charges" element={<PGChargesPage />} />
            <Route path="/gst" element={<GSTPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/support" element={<SupportPage />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
