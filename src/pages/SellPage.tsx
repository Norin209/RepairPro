import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase"; 

const CLOCK_IMAGE = "https://cdn-icons-png.flaticon.com/512/2928/2928750.png";

// ✅ YOUR LIVE API URL
const TELEGRAM_API_URL = "https://repairpro.com.au/repair_api/sendToTelegram.php";

interface SellData {
  models: Record<string, string[]>;
  basePrices: Record<string, number>;
  modifiers: {
    storage: Record<string, number>;
    condition: Record<string, number>;
  };
  settings?: {
    enableConditions: boolean; 
    locations: string[]; 
  };
}

const SellPage = () => {
  const [data, setData] = useState<SellData | null>(null);
  const [loading, setLoading] = useState(true);

  // Single Step Tracker (1: Brand, 2: Model, 3: Storage, 4: Condition, 5: Quote, 6: Form, 7: Success)
  const [step, setStep] = useState(1);

  // Selections
  const [deviceBrand, setDeviceBrand] = useState<string | null>(null); 
  const [model, setModel] = useState<string | null>(null);           
  const [storage, setStorage] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", location: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const ref = doc(db, "artifacts", "repairprodatabase", "public", "data", "sell-data", "main");
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
          const dbData = snap.data() as SellData;
          const settings = dbData.settings || { enableConditions: false, locations: ["Melbourne CBD"] };
          setData({ ...dbData, settings });
          
          setFormData(prev => ({ 
              ...prev, 
              location: prev.location || (settings.locations?.[0] || "Melbourne CBD") 
          }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const calculateOffer = () => {
    if (!data || !model) return 0;
    const base = data.basePrices[model] || 0;
    const storageMod = storage ? (data.modifiers.storage[storage] || 0) : 0;
    const conditionMod = condition ? (data.modifiers.condition[condition] || 0) : 0;
    return Math.max(0, base + storageMod + conditionMod);
  };

  const handleReset = () => {
      setStep(1);
      setDeviceBrand(null);
      setModel(null);
      setStorage(null);
      setCondition(null);
      window.scrollTo(0, 0);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const offer = calculateOffer();

      // ✅ SENDING NAME AND NOTES (MESSAGE) SEPARATELY
      const payload = {
          type: "BUY-BACK", 
          device: deviceBrand || "Unknown Brand",
          model: `${model} (${storage})`, 
          condition: condition || "N/A", 
          quotePrice: offer,
          location: formData.location, 
          name: formData.name,       // Send name
          email: formData.email,
          phone: formData.phone,
          message: formData.message  // Send notes exactly as they typed them
      };

      try {
          const response = await fetch(TELEGRAM_API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });

          const result = await response.json();
          if (result.ok) {
              setStep(7); 
          } else {
              alert("Something went wrong sending your request. Please try again.");
          }
      } catch (error) {
          console.error("Submission error:", error);
          alert("Network error. Please make sure you are connected to the internet.");
      } finally {
          setIsSubmitting(false);
      }
  };

  if (loading) return (
      <div className="min-h-screen pt-40 flex flex-col items-center bg-[#FAFAFA]">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Estimator...</p>
      </div>
  );

  if (!data) return <div className="pt-40 text-center text-red-500 font-bold text-xl">System Offline. Please try again later.</div>;

  const offerPrice = calculateOffer();
  const brands = Object.keys(data.models);

  const goBack = () => {
      if (step > 1 && step < 7) setStep(step - 1);
  };

  return (
    <section className="w-full bg-[#FAFAFA] min-h-screen pt-32 pb-32 px-4 font-sans selection:bg-black selection:text-white flex flex-col items-center">
      
      {step < 5 && (
        <div className="flex flex-col items-center text-center mb-10 transition-all duration-500 max-w-lg">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 p-3">
                <img src={CLOCK_IMAGE} alt="Fast Quote" className="w-full h-full object-contain opacity-80" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Trade In. Trade Up.
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
                Get an instant, guaranteed valuation for your device.
            </p>
        </div>
      )}

      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 md:p-10 min-h-[400px] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {step > 1 && step < 7 && (
            <button onClick={goBack} className="absolute top-6 left-6 text-gray-400 hover:text-black font-bold text-sm flex items-center gap-1 z-10 transition-colors">
                ← Back
            </button>
        )}

        {step === 1 && (
            <div className="flex flex-col flex-1 animate-in slide-in-from-right-4 duration-300 pt-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-8 text-center">Select Your Brand</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-fr">
                    {brands.map((brand) => (
                        <button key={brand} onClick={() => { setDeviceBrand(brand); setStep(2); }} className="py-6 px-2 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-700 hover:border-black hover:text-black font-bold text-lg transition-all">
                            {brand}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {step === 2 && deviceBrand && (
            <div className="flex flex-col flex-1 animate-in slide-in-from-right-4 duration-300 pt-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-8 text-center">Which {deviceBrand} do you have?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                    {data.models[deviceBrand]?.map((m) => (
                        <button key={m} onClick={() => { setModel(m); setStep(3); }} className="py-4 px-6 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-700 hover:border-black hover:text-black font-semibold text-left transition-all">
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {step === 3 && model && (
            <div className="flex flex-col flex-1 animate-in slide-in-from-right-4 duration-300 pt-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-8 text-center">Select Capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(data.modifiers.storage).map((s) => (
                    <button key={s} onClick={() => { setStorage(s); setStep(data.settings?.enableConditions ? 4 : 5); }} className="py-6 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-700 hover:border-black hover:text-black font-bold text-xl transition-all">
                      {s}
                    </button>
                  ))}
                </div>
            </div>
        )}

        {step === 4 && storage && data.settings?.enableConditions && (
            <div className="flex flex-col flex-1 animate-in slide-in-from-right-4 duration-300 pt-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-8 text-center">Device Condition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(data.modifiers.condition).map((c) => (
                    <button key={c} onClick={() => { setCondition(c); setStep(5); }} className="py-5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-700 hover:border-black hover:text-black font-bold text-lg transition-all">
                      {c}
                    </button>
                  ))}
                </div>
            </div>
        )}

        {step === 5 && (
            <div className="flex flex-col items-center justify-center flex-1 animate-in zoom-in-95 duration-500 py-4">
                <div className="inline-block bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    Estimated Value
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your device is worth</h2>
                <div className="text-7xl font-black text-black mb-8 tracking-tighter">
                    ${offerPrice}
                </div>

                <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-200">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Device</span>
                        <span className="font-bold text-gray-900">{model}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Capacity</span>
                        <span className="font-bold text-gray-900">{storage}</span>
                    </div>
                    {data.settings?.enableConditions && condition && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Condition</span>
                            <span className="font-bold text-gray-900">{condition}</span>
                        </div>
                    )}
                </div>

                <div className="w-full max-w-sm flex flex-col gap-3">
                    <button onClick={() => setStep(6)} className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-md">
                        Accept & Proceed
                    </button>
                    <button onClick={handleReset} className="w-full bg-white text-gray-600 py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors">
                        Recalculate
                    </button>
                </div>
            </div>
        )}

        {step === 6 && (
            <div className="flex flex-col flex-1 animate-in slide-in-from-right-4 duration-300 pt-6">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Lock in your offer</h2>
                <p className="text-gray-500 text-sm mb-6 border-b pb-4">Secure your $<b>{offerPrice}</b> quote.</p>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Name</label>
                            <input required type="text" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Phone</label>
                            <input required type="tel" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Email</label>
                        <input type="email" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Drop-off Location</label>
                        <select className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black outline-none bg-gray-50 focus:bg-white appearance-none cursor-pointer" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                            {data.settings?.locations?.map(loc => ( <option key={loc} value={loc}>{loc}</option> ))}
                            {(!data.settings?.locations || data.settings.locations.length === 0) && ( <option value="Store Location">Store Location</option> )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Additional Notes (Optional)</label>
                        <textarea className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black outline-none bg-gray-50 focus:bg-white resize-none" rows={3} placeholder="e.g., Does the screen have any deep scratches?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                    </div>

                    <button disabled={isSubmitting} type="submit" className="w-full bg-black text-white py-4 mt-2 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-md disabled:opacity-70">
                        {isSubmitting ? "Locking in Quote..." : "Submit Request"}
                    </button>
                </form>
            </div>
        )}

        {step === 7 && (
            <div className="flex flex-col items-center justify-center flex-1 py-10 animate-in zoom-in duration-500 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">Request Sent!</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                    Your quote for <b>${offerPrice}</b> is locked in. Bring your {model} into the store to complete the trade-in.
                </p>
                <button onClick={handleReset} className="bg-gray-100 text-black border border-gray-200 px-8 py-3.5 rounded-full font-bold hover:bg-gray-200 transition">
                    Start Another Quote
                </button>
            </div>
        )}

      </div>
    </section>
  );
};

export default SellPage;