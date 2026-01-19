import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  deleteField 
} from "firebase/firestore";
// ✅ Import from your central file
import { db } from "../utils/firebase";

// --- TYPES ---
export interface LocationData {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  mapUrl: string; // Optional: Google Maps Link
  order: number;  // Control sorting
}

const DEFAULT_LOCATIONS: Record<string, LocationData> = {
  "melbourne-central": {
    id: "melbourne-central",
    name: "Repair Pro Melbourne Central",
    address: "LG66/300 Lonsdale St, Melbourne VIC 3000",
    phone: "(03) 9650 5678",
    hours: "Mon-Sun: 10am-7pm",
    lat: -37.8105,
    lng: 144.963,
    mapUrl: "",
    order: 1 // Shows first
  },
  "springvale": {
    id: "springvale",
    name: "Repair Pro Springvale",
    address: "Kiosk C1, 46-58 Buckingham Ave, Springvale VIC 3171",
    phone: "(03) 9540 9012",
    hours: "Mon-Sat: 9am-6pm",
    lat: -37.9505,
    lng: 145.1509,
    mapUrl: "",
    order: 2
  },
  "chelsea": {
    id: "chelsea",
    name: "Repair Pro Chelsea",
    address: "10/450 Nepean Hwy, Chelsea VIC 3196",
    phone: "(03) 9772 1234",
    hours: "Mon-Fri: 9am-5:30pm",
    lat: -38.0548,
    lng: 145.1166,
    mapUrl: "",
    order: 3
  }
};

const AdminLocations = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Record<string, LocationData>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LocationData | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  // 🔒 SECURITY CHECK
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) {
      navigate("/admin-portal-9831");
    }
  }, [navigate]);

  // DB Path: artifacts/{APP_ID}/public/data/locations-data/main
  // We hardcode the ID or grab it from config. For simplicity, we use "repairprodatabase"
  const docRef = doc(db, "artifacts", "repairprodatabase", "public", "data", "locations-data", "main");

  // 1. Fetch Data
  useEffect(() => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setLocations(snap.data() as Record<string, LocationData>);
      } else {
        // Seed initial data if empty
        setDoc(docRef, DEFAULT_LOCATIONS);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Start Adding New
  const startAddNew = () => {
    const newId = `store-${Date.now()}`;
    setFormData({
      id: newId,
      name: "",
      address: "",
      phone: "",
      hours: "",
      lat: -37.8136, // Default Melb Lat
      lng: 144.9631, // Default Melb Lng
      mapUrl: "",
      order: 99
    });
    setEditingId(newId);
  };

  // 3. Start Editing
  const startEdit = (loc: LocationData) => {
    setFormData({ ...loc });
    setEditingId(loc.id);
  };

  // 4. Save Changes
  const saveLocation = async () => {
    if (!formData || !editingId) return;

    try {
      // Use updateDoc to patch specifically this key in the map
      await setDoc(docRef, {
        [editingId]: formData
      }, { merge: true });

      setStatusMsg("Location Saved!");
      setEditingId(null);
      setFormData(null);
      setTimeout(() => setStatusMsg(""), 2000);
    } catch (error) {
      console.error(error);
      setStatusMsg("Error saving.");
    }
  };

  // 5. Delete
  const deleteLocation = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;
    try {
      await updateDoc(docRef, {
        [id]: deleteField()
      });
      setStatusMsg("Store Deleted.");
    } catch (e) {
      console.error(e);
    }
  };

  // Sort locations for display list (By order number)
  const sortedList = Object.values(locations).sort((a, b) => a.order - b.order);

  return (
    <div className="w-full bg-white pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* ✅ BACK BUTTON */}
        <button
          onClick={() => navigate("/admin-panel")}
          className="mb-6 px-4 py-2 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-100 transition inline-flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Manage Store Locations</h1>
          {statusMsg && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">{statusMsg}</span>}
          <button 
            onClick={startAddNew}
            className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800"
          >
            + Add New Store
          </button>
        </div>

        {/* --- EDIT FORM (Overlay or Inline) --- */}
        {editingId && formData && (
          <div className="bg-gray-50 border border-black p-6 rounded-xl mb-10 shadow-lg">
            <h3 className="font-bold text-xl mb-4">{locations[editingId] ? "Edit Store" : "New Store"}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">Store Name</label>
                <input className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500">Display Order (1 = Top)</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500">Address</label>
                <input className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">Phone</label>
                <input className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">Hours</label>
                <input className="w-full p-2 border rounded" value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">Latitude</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.lat} onChange={e => setFormData({...formData, lat: Number(e.target.value)})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">Longitude</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.lng} onChange={e => setFormData({...formData, lng: Number(e.target.value)})} />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={saveLocation} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Save Store</button>
              <button onClick={() => setEditingId(null)} className="text-gray-500 px-4 py-2 font-bold hover:text-black">Cancel</button>
            </div>
          </div>
        )}

        {/* --- LOCATIONS LIST --- */}
        <div className="space-y-4">
          {sortedList.map((loc) => (
            <div key={loc.id} className="border p-4 rounded-xl flex justify-between items-center hover:bg-gray-50">
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded font-bold">Order: {loc.order}</span>
                  <h3 className="font-bold text-lg">{loc.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">{loc.address}</p>
                <p className="text-gray-400 text-xs mt-1">{loc.lat}, {loc.lng}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(loc)} className="text-blue-600 font-bold text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50">Edit</button>
                <button onClick={() => deleteLocation(loc.id)} className="text-red-600 font-bold text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminLocations;