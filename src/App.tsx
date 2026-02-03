import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";

// Legal Pages
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import SocialPlaceholder from "./pages/SocialPlaceholder";

// Traveler Registration
import TravelerRegister from "./pages/TravelerRegister";

// Order Pages
import NewOrder from "./pages/order/NewOrder";
import OrderDetail from "./pages/order/OrderDetail";
import OrderTracking from "./pages/order/OrderTracking";

// Dashboard
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import TravelerDashboard from "./pages/dashboard/TravelerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Traveler Pages
import NewTrip from "./pages/traveler/NewTrip";
import TravelerWallet from "./pages/traveler/Wallet";

// Admin Pages
import AdminUsers from "./pages/admin/Users";
import AdminTransactions from "./pages/admin/Transactions";
import AdminRoutes from "./pages/admin/Routes";
import AdminDisputes from "./pages/admin/Disputes";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/cara-kerja" element={<HowItWorks />} />
          <Route path="/perjalanan" element={<Trips />} />
          <Route path="/perjalanan/:id" element={<TripDetail />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/kontak" element={<Contact />} />
          <Route path="/daftar-traveler" element={<TravelerRegister />} />
          
          {/* Legal Pages */}
          <Route path="/syarat-ketentuan" element={<Terms />} />
          <Route path="/privasi" element={<Privacy />} />
          <Route path="/social/:platform" element={<SocialPlaceholder />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Order Routes */}
          <Route path="/order/new" element={<NewOrder />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/order/:id/tracking" element={<OrderTracking />} />
          <Route path="/tracking/:id" element={<OrderTracking />} />
          
          {/* Customer Dashboard */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/orders" element={<CustomerDashboard />} />
          
          {/* Traveler Dashboard */}
          <Route path="/traveler" element={<TravelerDashboard />} />
          <Route path="/traveler/trip/new" element={<NewTrip />} />
          <Route path="/traveler/trip/:id" element={<TravelerDashboard />} />
          <Route path="/traveler/trips" element={<TravelerDashboard />} />
          <Route path="/traveler/orders" element={<TravelerDashboard />} />
          <Route path="/traveler/wallet" element={<TravelerWallet />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/verifications" element={<AdminUsers />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/routes" element={<AdminRoutes />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
