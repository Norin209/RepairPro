import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase"; 

// Interface & Default Data
interface SellData {
  models: Record<string, string[]>;
  basePrices: Record<string, number>;
  modifiers: {
    storage: Record<string, number>;
    condition: Record<string, number>;
  };
}

const DEFAULT_DATA: SellData = {
  models: {
    iPhone: ["iPhone 13", "iPhone 14", "iPhone 15"],
    Samsung: ["Galaxy S22", "Galaxy S23"],
    iPad: ["iPad Pro 11", "iPad Air 5"]
  },
  basePrices: {
    "iPhone 13": 300, "iPhone 14": 450, "iPhone 15": 600,
    "Galaxy S22": 280, "Galaxy S23": 420,
    "iPad Pro 11": 350, "iPad Air 5": 250
  },
  modifiers: {
    storage: { "64GB": 0, "128GB": 20, "256GB": 50, "512GB": 80 },
    condition: { "Excellent": 80, "Good": 40, "Fair": 10, "Broken": -50 }
  }
};

const AdminSell = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SellData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  // Input State
  const [newModelCategory, setNewModelCategory] = useState("iPhone");
  const [newModelName, setNewModelName] = useState("");

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) navigate("/admin-portal-9831");
  }, [navigate]);

  const docRef = doc(db, "artifacts", "repairprodatabase", "public", "data", "sell-data", "main");

  useEffect(() => {
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) setData(snap.data() as SellData);
      else setData(DEFAULT_DATA);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    setStatusMsg("Saving...");
    try {
      await setDoc(docRef, data);
      setStatusMsg("✅ Saved!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (error) {
      console.error(error);
      setStatusMsg("❌ Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const addModel = () => {
    if (!data || !newModelName) return;
    const currentList = data.models[newModelCategory] || [];
    if (currentList.includes(newModelName)) return;

    setData({
      ...data,
      models: { ...data.models, [newModelCategory]: [...currentList, newModelName] },
      basePrices: { ...data.basePrices, [newModelName]: 0 } 
    });
    setNewModelName("");
  };

  const deleteModel = (category: string, model: string) => {
    if (!data) return;
    if (!confirm(`Delete ${model}?`)) return;

    const newModels = data.models[category].filter(m => m !== model);
    const newPrices = { ...data.basePrices };
    delete newPrices[model];

    setData({
      ...data,
      models: { ...data.models, [category]: newModels },
      basePrices: newPrices
    });
  };

  const updateModifier = (type: 'storage' | 'condition', key: string, val: number) => {
    if (!data) return;
    setData({
      ...data,
      modifiers: {
        ...data.modifiers,
        [type]: { ...data.modifiers[type], [key]: val }
      }
    });
  };

  const updateBasePrice = (model: string, price: number) => {
    if (!data) return;
    setData({
      ...data,
      basePrices: { ...data.basePrices, [model]: price }
    });
  };

  // ✅ Custom Arrow Helper
  const ChevronDown = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  );

  if (!data) return <div className="pt-32 text-center">Loading Admin Data...</div>;

  return (
    <section className="w-full bg-gray-50 min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Buy-Back Prices</h1>
          <div className="flex items-center gap-4">
            {statusMsg && <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">{statusMsg}</span>}
            <button 
              onClick={() => navigate("/admin-panel")} 
              className="px-4 py-2 bg-white border rounded-full hover:bg-gray-100 transition shadow-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* 1. MODIFIERS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4 text-lg border-b pb-2">Storage Adjustments ($)</h3>
            {Object.entries(data.modifiers.storage).map(([size, price]) => (
              <div key={size} className="flex justify-between items-center mb-3">
                <label className="font-medium text-gray-700">{size}</label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-400">+ $</span>
                  <input 
                    type="number" 
                    className="w-20 border rounded p-1 text-center font-bold bg-gray-50"
                    value={price}
                    onChange={(e) => updateModifier('storage', size, Number(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4 text-lg border-b pb-2">Condition Adjustments ($)</h3>
            {Object.entries(data.modifiers.condition).map(([cond, price]) => (
              <div key={cond} className="flex justify-between items-center mb-3">
                <label className="font-medium text-gray-700">{cond}</label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-400">+ $</span>
                  <input 
                    type="number" 
                    className="w-20 border rounded p-1 text-center font-bold bg-gray-50"
                    value={price}
                    onChange={(e) => updateModifier('condition', cond, Number(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. MODELS & BASE PRICES */}
        <div className="bg-white border rounded-xl p-8 shadow-sm mb-20">
          <h3 className="font-bold text-2xl mb-6">Device Base Prices</h3>
          
          {/* Add New Model Form */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex-1">
                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Brand</label>
                
                {/* ✅ FIXED: Flat Dropdown */}
                <div className="relative">
                  <select 
                      value={newModelCategory} 
                      onChange={(e) => setNewModelCategory(e.target.value)}
                      className="w-full border p-3 rounded-lg bg-white appearance-none outline-none focus:ring-2 focus:ring-black"
                  >
                      {Object.keys(data.models).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                      ))}
                  </select>
                  <ChevronDown />
                </div>

            </div>
            <div className="flex-[2]">
                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Model Name</label>
                <input 
                    placeholder="e.g. iPhone 16 Pro Max" 
                    className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                />
            </div>
            <div className="flex items-end">
                <button 
                    onClick={addModel} 
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition w-full sm:w-auto"
                >
                    + Add
                </button>
            </div>
          </div>

          {/* Model List */}
          <div className="space-y-8">
            {Object.keys(data.models).map((cat) => (
              <div key={cat}>
                <h4 className="font-bold text-xl border-b pb-2 mb-4 text-gray-800">{cat}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.models[cat]?.map((model) => (
                    <div key={model} className="flex justify-between items-center border border-gray-200 p-4 rounded-xl bg-gray-50 hover:bg-white transition">
                      <span className="font-semibold">{model}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <span className="text-gray-500 text-sm mr-2">Base: $</span>
                            <input 
                                type="number" 
                                className="w-24 border border-gray-300 p-1 rounded font-bold text-black"
                                value={data.basePrices[model] || 0}
                                onChange={(e) => updateBasePrice(model, Number(e.target.value))}
                            />
                        </div>
                        <button 
                            onClick={() => deleteModel(cat, model)}
                            className="text-red-400 hover:text-red-600 font-bold px-2"
                        >
                            ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 right-8 z-50">
            <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-black text-white px-8 py-4 rounded-full shadow-2xl font-bold text-lg hover:scale-105 transition flex items-center gap-2"
            >
                {isSaving ? "Saving..." : "💾 Save Changes"}
            </button>
        </div>

      </div>
    </section>
  );
};

export default AdminSell;