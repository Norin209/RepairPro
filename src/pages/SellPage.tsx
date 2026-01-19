import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase"; 

// ✅ 1. Add your Clock Image URL here (You can replace this with any URL you like)
const CLOCK_IMAGE = "https://cdn-icons-png.flaticon.com/512/2928/2928750.png";

interface SellData {
  models: Record<string, string[]>;
  basePrices: Record<string, number>;
  modifiers: {
    storage: Record<string, number>;
    condition: Record<string, number>;
  };
}

const SellPage = () => {
  const [data, setData] = useState<SellData | null>(null);
  const [loading, setLoading] = useState(true);

  // User Selection State
  const [step, setStep] = useState(1);
  const [deviceType, setDeviceType] = useState(""); 
  const [model, setModel] = useState("");           
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState("");

  // Fetch Data
  useEffect(() => {
    const ref = doc(db, "artifacts", "repairprodatabase", "public", "data", "sell-data", "main");
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) setData(snap.data() as SellData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // AUTO-SCROLL TO TOP
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const calculateOffer = () => {
    if (!data || !model) return 0;
    const base = data.basePrices[model] || 0;
    const storageMod = data.modifiers.storage[storage] || 0;
    const conditionMod = data.modifiers.condition[condition] || 0;
    return Math.max(0, base + storageMod + conditionMod);
  };

  const offerPrice = calculateOffer();

  if (loading) return <div className="pt-40 text-center font-bold">Loading...</div>;
  if (!data) return <div className="pt-40 text-center text-red-500">System Offline.</div>;

  // Custom Chevron for Dropdowns
  const ChevronIcon = () => (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  );

  return (
    <section className="w-full bg-white pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {step === 1 && (
          <>
            {/* ✅ 2. Clock Image Header */}
            <div className="flex flex-col items-center mb-6 animate-fade-in-down">
              <img 
                src={CLOCK_IMAGE} 
                alt="Fast Quote" 
                className="w-24 h-24 object-contain mb-4 drop-shadow-md"
              />
              <h1 className="text-4xl font-bold text-center">Sell Your Device</h1>
              <p className="text-gray-500 mt-2">Get an instant offer in seconds.</p>
            </div>

            {/* 1. Device Type */}
            <div className="mb-8">
              <label className="block mb-2 font-bold text-gray-800">Device Type</label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-xl p-4 pr-10 bg-white focus:ring-2 focus:ring-black outline-none appearance-none cursor-pointer text-lg shadow-sm"
                  value={deviceType}
                  onChange={(e) => { setDeviceType(e.target.value); setModel(""); }}
                >
                  <option value="">Select Device...</option>
                  {Object.keys(data.models).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            {/* 2. Model */}
            {deviceType && (
              <div className="mb-8 animate-fade-in-up">
                <label className="block mb-2 font-bold text-gray-800">Model</label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-xl p-4 pr-10 bg-white focus:ring-2 focus:ring-black outline-none appearance-none cursor-pointer text-lg shadow-sm"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">Select Model...</option>
                    {data.models[deviceType]?.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronIcon />
                </div>
              </div>
            )}

            {/* 3. Storage */}
            {model && (
              <div className="mb-8 animate-fade-in-up">
                <label className="block mb-2 font-bold text-gray-800">Storage</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.keys(data.modifiers.storage).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStorage(s)}
                      className={`py-3 rounded-xl border transition-all font-medium ${
                        storage === s 
                          ? "bg-black text-white border-black shadow-md transform scale-105" 
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Condition */}
            {storage && (
              <div className="mb-10 animate-fade-in-up">
                <label className="block mb-2 font-bold text-gray-800">Condition</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.keys(data.modifiers.condition).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCondition(c)}
                      className={`py-3 rounded-xl border transition-all font-medium ${
                        condition === c
                          ? "bg-black text-white border-black shadow-md transform scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            {condition && (
              <button
                onClick={() => setStep(2)}
                className="w-full bg-red-600 text-white py-4 rounded-full font-bold text-lg hover:bg-red-700 transition shadow-lg animate-fade-in-up"
              >
                Get Instant Offer
              </button>
            )}
          </>
        )}

        {/* STEP 2: The Offer */}
        {step === 2 && (
          <div className="text-center pt-10 animate-fade-in">
             {/* Optional: Add the clock here too if you want, or keep it clean */}
            <h2 className="text-4xl font-bold mb-2">Your Estimated Offer</h2>
            <p className="text-gray-500 text-lg mb-8">
              {model} • {storage} • {condition}
            </p>

            <div className="text-7xl font-black text-green-600 mb-12 tracking-tight">
              ${offerPrice}
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              <button 
                onClick={() => alert("Proceed to contact form or booking")}
                className="w-full bg-red-600 text-white py-4 rounded-full font-bold hover:bg-red-700 transition shadow-lg"
              >
                Accept Offer
              </button>
              <button 
                onClick={() => setStep(1)}
                className="w-full bg-white text-black border border-gray-300 py-4 rounded-full font-bold hover:bg-gray-50 transition"
              >
                Check Another Device
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default SellPage;