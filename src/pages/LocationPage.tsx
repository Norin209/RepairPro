import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Imported useNavigate
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import ShopMapLeaflet from "../components/ShopMap";

// --- FIREBASE INIT ---
const firebaseConfig = {
  apiKey: "AIzaSyBphZ89XRmnJTt2b58n42cR50OuRV7NLms",
  authDomain: "repairprodatabase.firebaseapp.com",
  projectId: "repairprodatabase",
  storageBucket: "repairprodatabase.firebasestorage.app",
  messagingSenderId: "139649930430",
  appId: "1:139649930430:web:e41aeb3a7c37ffac61baef",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- INTERFACES ---
interface Location {
  id: string;
  name: string;
  address: string;
  mapUrl: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  order?: number;
}

// --- SUB-COMPONENT: DETAIL PANEL ---
interface LocationDetailPanelProps {
  location: Location;
  onConfirm: (location: Location) => void; 
}

const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({ 
  location, 
  onConfirm 
}) => (
  // Floating Panel on the Right (Desktop Only)
  <div className="absolute top-4 right-4 max-w-[300px] bg-white p-6 rounded-xl shadow-2xl z-50 text-left border border-gray-300 animate-fade-in">
    <h3 className="text-xl font-bold mb-1">{location.name}</h3>
    <p className="text-sm text-gray-600 mb-4">{location.address}</p>

    <div className="space-y-1 text-sm mb-4">
      <p><strong>Phone:</strong> {location.phone}</p>
      <p><strong>Hours:</strong> {location.hours}</p>
    </div>

    <button
      onClick={() => onConfirm(location)}
      className="w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition shadow-lg"
    >
      Start Repair Quote Here →
    </button>
  </div>
);

// --- MAIN PAGE ---
const LocationPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocationTemp, setSelectedLocationTemp] = useState<Location | null>(null);
  const [activeMapCenter, setActiveMapCenter] = useState<[number, number] | null>(null);
  
  const navigate = useNavigate(); // ✅ Initialize useNavigate

  // 1. Fetch Locations
  useEffect(() => {
    const docRef = doc(db, "artifacts", "repairprodatabase", "public", "data", "locations-data", "main");

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const dataMap = snap.data();
        const loadedList = Object.values(dataMap) as Location[];
        
        // Sort by Admin Order
        loadedList.sort((a, b) => (a.order || 99) - (b.order || 99));

        setLocations(loadedList);
        
        // Initial Center
        if (loadedList.length > 0 && !activeMapCenter) {
          setActiveMapCenter([loadedList[0].lat, loadedList[0].lng]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. SMART MAP CENTERING (Mobile vs Desktop)
  const handleLocationPreview = (location: Location) => {
    setSelectedLocationTemp(location);
    
    // Check if we are on Desktop (sm breakpoint is usually 640px)
    const isDesktop = window.innerWidth >= 640;

    if (isDesktop) {
      // DESKTOP: Shift map right so pin is on the left (away from panel)
      const OFFSET_AMOUNT = 0.1; 
      setActiveMapCenter([location.lat, location.lng + OFFSET_AMOUNT]);
    } else {
      // MOBILE: Center perfectly (panel is below map)
      setActiveMapCenter([location.lat, location.lng]);
    }
  };

  // ✅ Updated to use React Router and point to the correct "/booking" route
  const handleStartQuote = useCallback((location: Location) => {
    navigate(`/booking?locationId=${location.id}`);
  }, [navigate]);

  if (loading) return <div className="pt-40 text-center font-bold">Loading Store Locations...</div>;

  return (
    <section className="w-full bg-white pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        
        <h1 className="text-4xl font-bold text-black mb-4">
          Find Your Nearest Repair Pro Store
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Click on a store below to view details and get an instant repair quote.
        </p>

        {/* --- MAP / LIST CONTAINER --- */}
        <div className="max-w-4xl mx-auto text-center">

          {/* === MOBILE LAYOUT (sm:hidden) === */}
          <div className="flex flex-col sm:hidden gap-4">
            
            {/* Map on Top */}
            <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-300 shadow-lg relative z-0">
              <ShopMapLeaflet
                locations={locations}
                onLocationSelect={handleLocationPreview}
                activeCenter={activeMapCenter || [-37.8136, 144.9631]}
              />
            </div>

            {/* Store List Below */}
            <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-lg">
              <h2 className="text-xl font-bold mb-3 text-black">Select Location</h2>
              <div className="space-y-2">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleLocationPreview(loc)}
                    className={`w-full p-4 text-left border rounded-xl transition
                      ${
                        selectedLocationTemp?.id === loc.id
                          ? "border-black bg-gray-100 shadow-md ring-1 ring-black"
                          : "border-gray-200 hover:border-gray-400"
                      }
                    `}
                  >
                    <p className="font-semibold">{loc.name}</p>
                    <p className="text-sm text-gray-600">{loc.address}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mobile Detail Panel (Below Everything) */}
            {selectedLocationTemp && (
              <div className="sm:hidden mt-4 animate-fade-in-up">
                <div className="w-full bg-white p-6 rounded-xl shadow-lg text-left border border-black relative">
                    <button 
                      onClick={() => setSelectedLocationTemp(null)}
                      className="absolute top-2 right-4 text-2xl text-gray-400"
                    >
                      &times;
                    </button>
                    <h3 className="text-xl font-bold mb-1">{selectedLocationTemp.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{selectedLocationTemp.address}</p>
                    <div className="space-y-1 text-sm mb-4">
                        <p><strong>Phone:</strong> {selectedLocationTemp.phone}</p>
                        <p><strong>Hours:</strong> {selectedLocationTemp.hours}</p>
                    </div>
                    <button
                        onClick={() => handleStartQuote(selectedLocationTemp)}
                        className="w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition"
                    >
                        Start Repair Quote Here →
                    </button>
                </div>
              </div>
            )}
          </div>

          {/* === DESKTOP LAYOUT (hidden sm:flex) === */}
          <div className="hidden sm:flex sm:flex-row relative w-full border border-gray-300 rounded-xl overflow-hidden shadow-2xl mt-5 h-[500px]">

            {/* Sidebar List */}
            <div className="w-80 h-full flex-shrink-0 bg-white p-6 shadow-lg text-left overflow-y-auto border-r border-gray-300 custom-scrollbar">
              <h2 className="text-xl font-bold mb-4">Store List</h2>
              <div className="space-y-3">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleLocationPreview(loc)}
                    className={`w-full p-4 border rounded-xl transition text-left group
                      ${
                        selectedLocationTemp?.id === loc.id
                          ? "border-black bg-gray-100 shadow-md ring-1 ring-black"
                          : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                       <p className="font-semibold group-hover:text-black">{loc.name}</p>
                       {selectedLocationTemp?.id === loc.id && <span className="text-black font-bold">→</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{loc.address}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Map Area */}
            <div className="flex-grow relative h-full"> 
              <ShopMapLeaflet
                locations={locations}
                onLocationSelect={handleLocationPreview}
                activeCenter={activeMapCenter || [-37.8136, 144.9631]}
              />
              {selectedLocationTemp && (
                <LocationDetailPanel
                  location={selectedLocationTemp}
                  onConfirm={handleStartQuote}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationPage;