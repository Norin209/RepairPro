import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth"; 
import { auth } from "../utils/firebase"; 

const AdminDashboard = () => {
  const navigate = useNavigate();

  // =============================
  // 🔒 PROTECT ADMIN ROUTE
  // =============================
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    
    if (!isAuth) {
      navigate("/admin-portal-9831"); 
    }
  }, [navigate]);

  // =============================
  // 🚪 SECURE LOGOUT
  // =============================
  const logout = async () => {
    try {
      await signOut(auth); 
      localStorage.removeItem("adminAuth"); 
      navigate("/admin-portal-9831"); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <section className="w-full bg-white min-h-screen px-4 pt-28 pb-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b pb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <button
            className="px-5 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* --- WEBSITE CONTENT SECTION --- */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">Website Content</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Footer Edit Button */}
          <div
            onClick={() => navigate("/admin-panel/footer")}
            className="cursor-pointer border p-6 rounded-xl shadow-sm hover:shadow-md transition bg-blue-50 border-blue-100 block"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg mb-1 text-blue-900">Edit Footer</h3>
                <p className="text-sm text-blue-700">Phone, Email, Socials & Disclaimer.</p>
              </div>
              <span className="text-2xl">🦶</span>
            </div>
          </div>

          {/* Edit About Us Button */}
          <div
            onClick={() => navigate("/admin-panel/about")}
            className="cursor-pointer border p-6 rounded-xl shadow-sm hover:shadow-md transition bg-orange-50 border-orange-100 block"
          >
             <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg mb-1 text-orange-900">Edit "About Us"</h3>
                <p className="text-sm text-orange-700">Update Title & 4 Feature Cards.</p>
              </div>
              <span className="text-2xl">📝</span>
            </div>
          </div>

        </div>


        {/* --- BUSINESS LOGIC SECTION --- */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">Business Management</h2>
        <div className="grid gap-4">

          {/* 1. Bookings */}
          <div
            onClick={() => navigate("/admin-panel/bookings")}
            className="cursor-pointer border p-5 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center bg-gray-900 text-white"
          >
            <span className="font-medium text-lg">📅 View Bookings</span>
            <span className="text-white">→</span>
          </div>

          {/* ✅ 2. NEW: Manage Buy-Back Prices (Links to AdminSell) */}
          <div
            onClick={() => navigate("/admin-panel/buy-back")}
            className="cursor-pointer border p-5 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center bg-green-50 border-green-100 hover:bg-green-100"
          >
            <span className="font-medium text-lg text-green-900">💰 Manage Buy-Back Prices</span>
            <span className="text-green-700">→</span>
          </div>

          {/* ✅ 3. NEW: Manage Shop Inventory (Links to AdminBuy) */}
          <div
            onClick={() => navigate("/admin-panel/shop")}
            className="cursor-pointer border p-5 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center bg-purple-50 border-purple-100 hover:bg-purple-100"
          >
            <span className="font-medium text-lg text-purple-900">🛒 Manage Shop Inventory</span>
            <span className="text-purple-700">→</span>
          </div>

          {/* Store Locations */}
          <div
            onClick={() => navigate("/admin-panel/locations")}
            className="cursor-pointer border p-5 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center bg-white hover:bg-gray-50"
          >
            <span className="font-medium text-lg">📍 Edit Store Locations</span>
            <span className="text-gray-400">→</span>
          </div>

          {/* Promo Codes */}
          <div
            onClick={() => navigate("/admin-panel/promos")}
            className="cursor-pointer border p-5 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center bg-white hover:bg-gray-50"
          >
            <span className="font-medium text-lg">🏷️ Manage Promo Codes</span>
            <span className="text-gray-400">→</span>
          </div>

          {/* Devices */}
          <div
            onClick={() => navigate("/admin-panel/devices")}
            className="cursor-pointer border p-5 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center bg-white hover:bg-gray-50"
          >
            <span className="font-medium text-lg">📱 Edit Devices List</span>
            <span className="text-gray-400">→</span>
          </div>

          {/* Repair Data */}
          <div
            onClick={() => navigate("/admin-panel/repair")}
            className="cursor-pointer border p-5 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center bg-white hover:bg-gray-50"
          >
            <span className="font-medium text-lg">🔧 Edit Repair Prices</span>
            <span className="text-gray-400">→</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;