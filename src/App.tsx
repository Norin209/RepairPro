import { Routes, Route, Navigate } from "react-router-dom";
import HeaderNav from "./components/HeaderNav";
import Footer from "./components/Footer";

// ✅ 1. Import your new Bot
import SimpleBot from "./components/SimpleBot";

// ✅ 2. Import the Google Analytics Tracker
import AnalyticsTracker from "./components/AnalyticsTracker";

// Pages
import Home from "./pages/Home";
import RepairPage from "./pages/RepairPage";
import BuyPage from "./pages/BuyPage";
import SellPage from "./pages/SellPage";
import AboutUs from "./pages/AboutUs";
import LocationPage from "./pages/LocationPage";
import ContactUs from "./pages/ContactUs";

// ✅ NEW HIDDEN PAGES IMPORTS
import FranchisePage from "./pages/FranchisePage";
import WorkOpportunitiesPage from "./pages/WorkOpportunitiesPage";

// Admin Components
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminDevices from "./admin/AdminDevices";
import AdminRepair from "./admin/AdminRepair";
import AdminLocations from "./admin/AdminLocations"; 
import AdminFooter from "./admin/AdminFooter";
import AdminBookings from "./admin/AdminBookings";
import AdminPromos from "./admin/AdminPromos";
import AdminAboutUs from "./admin/AdminAboutUs";

// ✅ NEW ADMIN IMPORTS
import AdminBuy from "./admin/AdminBuy";
import AdminSell from "./admin/AdminSell";

import ComingSoon from "./components/ComingSoon";

// 🔒 FEATURE FLAGS (Enabled)
const BUY_ENABLED = true;
const SELL_ENABLED = true;

function App() {
  return (
    <>
      {/* ✅ 3. MOUNT THE TRACKER HERE */}
      <AnalyticsTracker />

      <HeaderNav />
      <Routes>
        {/* --- PUBLIC PAGES --- */}
        
        {/* Redirect root "/" to "/home" */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route path="/home" element={<Home />} />
        <Route path="/booking" element={<RepairPage />} />
        
        {/* Shop & Buy-Back Pages */}
        <Route path="/shop" element={BUY_ENABLED ? <BuyPage /> : <Navigate to="/coming-soon" replace />} />
        <Route path="/buy-back" element={SELL_ENABLED ? <SellPage /> : <Navigate to="/coming-soon" replace />} />
        
        <Route path="/location" element={<LocationPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* ✅ NEW HIDDEN ROUTES */}
        <Route path="/franchise-opportunities" element={<FranchisePage />} />
        <Route path="/work-opportunities" element={<WorkOpportunitiesPage />} />

        {/* Feature Flag Redirects */}
        <Route path="/coming-soon" element={<ComingSoon />} />

        {/* --- ADMIN PORTAL --- */}
        <Route path="/admin-portal-9831" element={<AdminLogin />} />
        
        {/* Main Dashboard */}
        <Route path="/admin-panel" element={<AdminDashboard />} />
        
        {/* ✅ NEW ADMIN ROUTES (For managing Shop & Sell prices) */}
        <Route path="/admin-panel/shop" element={<AdminBuy />} />
        <Route path="/admin-panel/buy-back" element={<AdminSell />} />

        {/* Business Management */}
        <Route path="/admin-panel/locations" element={<AdminLocations />} />
        <Route path="/admin-panel/devices" element={<AdminDevices />} />
        <Route path="/admin-panel/repair" element={<AdminRepair />} />
        <Route path="/admin-panel/bookings" element={<AdminBookings />} />
        
        {/* Content Management */}
        <Route path="/admin-panel/footer" element={<AdminFooter />} />
        <Route path="/admin-panel/promos" element={<AdminPromos />} />
        <Route path="/admin-panel/about" element={<AdminAboutUs />} />

        {/* Catch All - Redirect invalid URLs to Home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      
      {/* The Red Bot Bubble */}
      <SimpleBot />
      
      <Footer />
    </>
  );
}

export default App;