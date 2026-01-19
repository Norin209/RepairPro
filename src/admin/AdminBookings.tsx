import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc, 
  doc,
} from "firebase/firestore";

interface BookingItem {
  id: string;
  bookingId: string;
  device: string;
  model: string;
  issue: string;
  email: string;
  phone: string;
  date: string; // Stored as YYYY-MM-DD
  time: string; 
  store: string;
  storeAddress: string;
  storeId: string;
  quotePrice: number | null;
  status: string; 
  createdAt?: any; 
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AdminBookings = () => {
  const navigate = useNavigate(); 
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "past">("all");

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) {
      navigate("/admin-portal-9831");
    }
  }, [navigate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "bookings"));
      const items: BookingItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      items.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setBookings(items);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await deleteDoc(doc(db, "bookings", id));
    loadBookings(); 
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      const bookingRef = doc(db, "bookings", id);
      await updateDoc(bookingRef, { status: newStatus });
      setBookings((prev) => 
        prev.map((b) => b.id === id ? { ...b, status: newStatus } : b)
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const filteredBookings = useMemo(() => {
    const today = getTodayString();
    return bookings.filter((b) => {
      if (filter === "all") return true;
      if (filter === "today") return b.date === today;
      if (filter === "upcoming") return b.date > today;
      if (filter === "past") return b.date < today;
      return true;
    });
  }, [bookings, filter]);

  const formatSubmissionTime = (timestamp: any) => {
    if (!timestamp) return "Unknown Time";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-AU", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true
    });
  };

  // ✅ NEW: Helper to change 2025-12-16 -> 16/12/2025
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split("-"); // [2025, 12, 16]
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString; // Fallback if format is weird
  };

  return (
    <section className="w-full bg-white min-h-screen px-4 pt-28 pb-10">
      <div className="max-w-4xl mx-auto">
        
        <button
          onClick={() => navigate("/admin-panel")}
          className="mb-6 px-4 py-2 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-100 transition inline-flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Bookings</h1>
          
          <div className="flex bg-gray-100 p-1 rounded-lg self-start">
            {(["all", "today", "upcoming", "past"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition capitalize ${
                  filter === f ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
            <p className="text-gray-500 text-lg">No {filter} bookings found.</p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="mt-2 text-black underline font-semibold">
                View All
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className={`border p-6 rounded-xl shadow-sm transition hover:shadow-md ${
                  b.status === "Completed" ? "bg-gray-50 opacity-80" : "bg-white"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 border-b pb-4 gap-4">
                  
                  {/* Header Info */}
                  <div>
                    <h2 className="font-bold text-lg text-black flex flex-wrap items-center gap-2">
                      {b.store} 
                      <span className="text-gray-300">/</span> 
                      <span className="text-gray-600 text-base font-normal">
                        Submitted: {formatSubmissionTime(b.createdAt)}
                      </span>
                    </h2>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(b.id, b.status)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold border transition flex items-center gap-2 ${
                        b.status === "Completed"
                          ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                      }`}
                    >
                      {b.status === "Completed" ? (
                        <>
                          <i className="bi bi-check-circle-fill"></i> Completed
                        </>
                      ) : (
                        <>
                          <i className="bi bi-circle"></i> Mark Complete
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteBooking(b.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1.5 border border-red-100 rounded-full hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Device Info</p>
                    
                    <p className="text-lg font-bold text-black">{b.device} — {b.model}</p>
                    
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {b.issue}
                    </p>

                    <p className="text-gray-700 font-bold mt-2 text-sm">
                      Quote: <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">${b.quotePrice ?? "N/A"}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Appointment Scheduled For</p>
                    
                    {/* ✅ UPDATED: Using formatDate() here */}
                    <p className="text-black font-medium text-lg">
                      {formatDate(b.date)} at {b.time}
                    </p>
                    
                    {b.date === getTodayString() && (
                      <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                        HAPPENING TODAY
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Customer Contact</p>
                  <p className="text-gray-800 font-medium">{b.email}</p>
                  <p className="text-gray-800">{b.phone}</p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminBookings;