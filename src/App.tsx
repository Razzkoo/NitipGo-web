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
import RegisterTraveler from "./pages/auth/RegisterTraveler";
import GoogleCallback from "./pages/auth/GoogleCallback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";
import CustomerHelp from "./pages/CustomerHelp";
import { AppSettingsProvider } from "./components/layout/AppSettingsContent";
import { OrderProvider  } from "./context/OrderContext";
import ChatTraveler from "./pages/Chat-Traveler";
import AdsSuccess from "./pages/admin/AdvertisementSuccess";

// Legal Pages
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import SocialPlaceholder from "./pages/SocialPlaceholder";
import CustomerTrip from "./pages/dashboard/CustomerTrip";
import CustomerTripDetail from "./pages/dashboard/CustomerTripDetail";
// Traveler Registration
import TravelerRegister from "./pages/TravelerRegister";

// Order Pages
import Order from "@/pages/order/Order";
import OrderList from "@/pages/order/OrderList";
import NewOrder from "./pages/order/NewOrder";
import OrderDetail from "./pages/order/OrderDetail";
import OrderTracking from "./pages/order/OrderTracking";
import OrderPayment from "./pages/order/OrderPayment";
import OrderCancelled from "./pages/order/OrderCancelled";
import OrderRejected from "./pages/order/OrderRejected"

// Dashboard
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import TravelerDashboard from "./pages/dashboard/TravelerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Traveler Pages
import NewTrip from "./pages/traveler/NewTrip";
import TravelerOrders from "./pages/traveler/OrderDetail";
import TravelerWallet from "./pages/traveler/Wallet";
import TripList from "./pages/traveler/TripList";
import TripDetails from "./pages/traveler/TripDetail";
import WalletWithdraw from "./pages/traveler/WalletWithdraw";
import WalletHistory from "./pages/traveler/WalletHistory";
import PaymentBoost from "./pages/traveler/PaymentBoost";
import TravelerReports from "./pages/traveler/Report";

// Admin Pages
import AdminUsers from "./pages/admin/Users";
import AdminTransactions from "./pages/admin/Transactions";
import AdminRoutes from "./pages/admin/Routes";
import AdminDisputes from "./pages/admin/Disputes";
import AdminSettings from "./pages/admin/Settings";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminRating from "./pages/admin/Rating";
import AdminBooster from "./pages/admin/Booster";
import AdminAds from "./pages/admin/Advertisement";
import AdminTravelers from "./pages/admin/Travelers";
import AdminHelp from "./pages/admin/AdminHelp";

// Profile Pages
import CustomerProfile from "./pages/profile/CustomerProfile";
import TravelerProfile from "./pages/profile/TravelerProfile";
import AdminProfile from "./pages/profile/AdminProfile";

// Notification Pages
import CustomerNotifications from "./pages/notifications/CustomerNotifications";
import TravelerNotifications from "./pages/notifications/TravelerNotifications";
import AdminNotifications from "./pages/notifications/AdminNotifications";

// Settings Pages
import CustomerSettings from "./pages/settings/CustomerSettings";
import TravelerSettings from "./pages/settings/TravelerSettings";

// History Page
import CustomerHistory from "./pages/dashboard/CustomerHistory";

// Live Chat
import LiveChat from "./pages/LiveChat";
import { Import } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OrderProvider>
      <AppSettingsProvider>
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
          <Route path="/iklan/sukses" element={<AdsSuccess />} />

          {/* Legal Pages */}
          <Route path="/syarat-ketentuan" element={<Terms />} />
          <Route path="/privasi" element={<Privacy />} />
          <Route path="/social/:platform" element={<SocialPlaceholder />} />
          <Route path="/customer/trip" element={<CustomerTrip />} />
          <Route path="/customer/trip/:id" element={<CustomerTripDetail />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/traveler" element={<RegisterTraveler />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          
          {/* Order Routes */}
          <Route path="/orders" element={<Order />} />
          <Route path="/order/new" element={<NewOrder />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/order/:id/tracking" element={<OrderTracking />} />
          <Route path="/tracking/:id" element={<OrderTracking />} />
          <Route path="/traveler/orders" element={<OrderList />} />
          <Route path="/traveler/order/:id" element={<TravelerOrders />} />
          <Route path="/order/:orderId/cancelled" element={<OrderCancelled />} />
          <Route path="/order/:orderId/rejected" element={<OrderRejected />} />
          <Route path="/order/:id/payment" element={<OrderPayment />} />
          <Route path="/chat-traveler/:orderId" element={<ChatTraveler />} />
          
          {/* Customer Dashboard */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/history" element={<CustomerHistory />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/notifications" element={<CustomerNotifications />} />
          <Route path="/settings" element={<CustomerSettings />} />
          <Route path="/help" element={<CustomerHelp />} />
          
          {/* Traveler Dashboard */}
          <Route path="/traveler" element={<TravelerDashboard />} />
          <Route path="/traveler/trip/new" element={<NewTrip />} />
          <Route path="/traveler/trip" element={<TripList />} />
          <Route path="/traveler/trip/:id" element={<TripDetails />} />
          <Route path="/traveler/wallet" element={<TravelerWallet />} />
          <Route path="/traveler/profile" element={<TravelerProfile />} />
          <Route path="/traveler/notifications" element={<TravelerNotifications />} />
          <Route path="/traveler/settings" element={<TravelerSettings />} />
          <Route path="/traveler/tariksaldo" element={<WalletWithdraw />} />
          <Route path="/traveler/riwayatsaldo" element={<WalletHistory />} />
          <Route path="/traveler/boost/payment" element={<PaymentBoost />} />
          <Route path="/traveler/report" element={<TravelerReports />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/travelers" element={<AdminTravelers />} />
          <Route path="/admin/verifications" element={<AdminUsers />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/routes" element={<AdminRoutes />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/wallet" element={<AdminWallet />} />
          <Route path="/admin/rating" element={<AdminRating />} />
          <Route path="/admin/boosters" element={<AdminBooster />} />
          <Route path="/admin/ads" element={<AdminAds />} />
          <Route path="/admin/help" element={<AdminHelp />} />
          
          {/* Live Chat */}
          <Route path="/live-chat" element={<LiveChat />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AppSettingsProvider>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
