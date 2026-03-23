import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase"; 

interface SellData {
  models: Record<string, string[]>;
  basePrices: Record<string, number>;
  modelMeta?: Record<string, { image: string; rank: string; promo: number }>; 
  modifiers: {
    storage: Record<string, number>;
    condition: Record<string, number>;
  };
  settings: {
    enableConditions: boolean;
    locations: string[]; 
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
  },
  settings: {
    enableConditions: false,
    locations: ["Melbourne CBD", "Mail-In Service"] 
  }
};

const AdminSell = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SellData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  const [newModelCategory, setNewModelCategory] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  
  // ✅ NEW: State to track which brand tab is currently selected
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) navigate("/admin-portal-9831");
  }, [navigate]);

  const docRef = doc(db, "artifacts", "repairprodatabase", "public", "data", "sell-data", "main");

  useEffect(() => {
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const dbData = snap.data() as SellData;
        setData({ 
            ...dbData, 
            modelMeta: dbData.modelMeta || {},
            settings: {
                enableConditions: dbData.settings?.enableConditions || false,
                locations: dbData.settings?.locations || ["Melbourne CBD", "Mail-In Service"]
            }
        });
        
        const categories = Object.keys(dbData.models);
        if (categories.length > 0 && !newModelCategory) {
            setNewModelCategory(categories[0]);
        }
      } else {
        setData(DEFAULT_DATA);
        setNewModelCategory("iPhone");
      }
    });
    return () => unsub();
  }, [newModelCategory]);

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

  const editLocation = (oldLoc: string) => {
      if (!data) return;
      const newLoc = prompt("Edit location name:", oldLoc);
      if (!newLoc || newLoc.trim() === "" || newLoc === oldLoc) return;
      if (data.settings.locations.includes(newLoc.trim())) return alert("Location already exists!");

      setData({
          ...data,
          settings: {
              ...data.settings,
              locations: data.settings.locations.map(loc => loc === oldLoc ? newLoc.trim() : loc)
          }
      });
  };

  const addLocation = () => {
      const loc = newLocation.trim();
      if (!data || !loc) return;
      if (data.settings.locations.includes(loc)) return alert("Location already exists!");

      setData({
          ...data,
          settings: {
              ...data.settings,
              locations: [...data.settings.locations, loc]
          }
      });
      setNewLocation("");
  };

  const deleteLocation = (locToDelete: string) => {
      if (!data) return;
      if (data.settings.locations.length <= 1) return alert("You must have at least one location!");
      if (!confirm(`Delete ${locToDelete}?`)) return;
      
      setData({
          ...data,
          settings: {
              ...data.settings,
              locations: data.settings.locations.filter(loc => loc !== locToDelete)
          }
      });
  };

  const editCategory = (oldCat: string) => {
      if (!data) return;
      const newCat = prompt("Edit brand name:", oldCat);
      if (!newCat || newCat.trim() === "" || newCat === oldCat) return;
      if (data.models[newCat.trim()]) return alert("Brand already exists!");

      const newModels = { ...data.models };
      newModels[newCat.trim()] = newModels[oldCat]; 
      delete newModels[oldCat];

      setData({
          ...data,
          models: newModels
      });
      
      // Update filter if we just renamed the active one
      if (activeFilter === oldCat) setActiveFilter(newCat.trim());
      if (newModelCategory === oldCat) setNewModelCategory(newCat.trim());
  };

  const addCategory = () => {
    const cat = newCategoryName.trim();
    if (!data || !cat) return;
    if (data.models[cat]) return alert("This brand already exists!");

    setData({
      ...data,
      models: { ...data.models, [cat]: [] } 
    });
    setNewCategoryName("");
    setNewModelCategory(cat); 
  };

  const deleteCategory = (cat: string) => {
    if (!data) return;
    if (!confirm(`Are you sure you want to delete "${cat}"? This will also remove all devices inside it.`)) return;

    const newModels = { ...data.models };
    const modelsToDelete = newModels[cat] || [];
    delete newModels[cat];

    const newPrices = { ...data.basePrices };
    const newMeta = { ...data.modelMeta };

    modelsToDelete.forEach(model => {
        delete newPrices[model];
        if (newMeta && newMeta[model]) delete newMeta[model];
    });

    setData({
      ...data,
      models: newModels,
      basePrices: newPrices,
      modelMeta: newMeta
    });

    // Reset filter if we delete the brand we are currently looking at
    if (activeFilter === cat) setActiveFilter("All");
    if (newModelCategory === cat) setNewModelCategory(Object.keys(newModels)[0] || "");
  };

  const editModelName = (category: string, oldModel: string) => {
      if (!data) return;
      const newModel = prompt("Edit model name:", oldModel);
      if (!newModel || newModel.trim() === "" || newModel === oldModel) return;
      
      const trimmedNewModel = newModel.trim();
      if (data.models[category].includes(trimmedNewModel)) return alert("Model already exists in this brand!");

      const newModelsArray = data.models[category].map(m => m === oldModel ? trimmedNewModel : m);
      
      const newPrices = { ...data.basePrices };
      newPrices[trimmedNewModel] = newPrices[oldModel]; 
      delete newPrices[oldModel];

      const newMeta = { ...data.modelMeta };
      if (newMeta && newMeta[oldModel]) {
          newMeta[trimmedNewModel] = newMeta[oldModel]; 
          delete newMeta[oldModel];
      }

      setData({
          ...data,
          models: { ...data.models, [category]: newModelsArray },
          basePrices: newPrices,
          modelMeta: newMeta
      });
  };

  const addModel = () => {
    if (!data || !newModelName || !newModelCategory) return alert("Select a brand and type a model name.");
    const currentList = data.models[newModelCategory] || [];
    if (currentList.includes(newModelName)) return;

    setData({
      ...data,
      models: { ...data.models, [newModelCategory]: [...currentList, newModelName] },
      basePrices: { ...data.basePrices, [newModelName]: 0 },
      modelMeta: { 
        ...data.modelMeta, 
        [newModelName]: { image: "", rank: "Standard", promo: 0 } 
      }
    });
    setNewModelName("");
    // Automatically switch the filter to the brand we just added a device to!
    setActiveFilter(newModelCategory);
  };

  const deleteModel = (category: string, model: string) => {
    if (!data) return;
    if (!confirm(`Delete ${model}?`)) return;

    const newModels = data.models[category].filter(m => m !== model);
    const newPrices = { ...data.basePrices };
    const newMeta = { ...data.modelMeta };
    delete newPrices[model];
    if (newMeta && newMeta[model]) delete newMeta[model];

    setData({
      ...data,
      models: { ...data.models, [category]: newModels },
      basePrices: newPrices,
      modelMeta: newMeta
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

  const toggleConditionSettings = () => {
    if (!data) return;
    setData({
        ...data,
        settings: {
            ...data.settings,
            enableConditions: !data.settings.enableConditions
        }
    });
  };

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
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Buy-Back Prices</h1>
          <div className="flex items-center gap-4">
            {statusMsg && <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">{statusMsg}</span>}
            <button 
              onClick={() => navigate("/admin-panel")} 
              className="px-4 py-2 bg-white border rounded-full hover:bg-gray-100 transition shadow-sm font-medium"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Global Settings Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="font-bold text-xl text-gray-800 border-b pb-3 mb-4">Quote Form Settings</h3>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Toggle Section */}
                <div className="flex-1 border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-800">Track Device Condition</span>
                        <button 
                            onClick={toggleConditionSettings}
                            className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center ${data.settings.enableConditions ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${data.settings.enableConditions ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">Toggle whether the "Condition" step appears on the public quote form.</p>
                </div>

                {/* Location Manager Section */}
                <div className="flex-[2]">
                    <span className="text-sm font-bold text-gray-800 block mb-2">Drop-off Locations</span>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                        {data.settings.locations.map((loc) => (
                            <div key={loc} className="flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md text-sm group">
                                <span className="font-medium text-gray-700">{loc}</span>
                                <button onClick={() => editLocation(loc)} className="ml-3 text-gray-400 hover:text-blue-500 transition-colors" title="Edit Location">✏️</button>
                                <button onClick={() => deleteLocation(loc)} className="ml-2 text-gray-400 hover:text-red-500 font-bold leading-none transition-colors" title="Delete Location">×</button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 max-w-sm">
                        <input className="border border-gray-300 p-2 rounded flex-1 outline-none focus:ring-2 focus:ring-black bg-white text-sm" placeholder="Add new location..." value={newLocation} onChange={(e) => setNewLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLocation()} />
                        <button onClick={addLocation} className="px-4 py-2 bg-gray-800 text-white rounded font-bold text-sm hover:bg-black transition">Add</button>
                    </div>
                </div>
            </div>
        </div>

        {/* MODIFIERS */}
        <div className={`grid gap-6 mb-10 ${data.settings.enableConditions ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-bold mb-4 text-lg border-b pb-2">Storage Adjustments ($)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(data.modifiers.storage).map(([size, price]) => (
                    <div key={size} className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="font-bold text-sm text-gray-700 mb-2">{size}</label>
                        <div className="flex items-center">
                            <span className="mr-1 text-gray-400 text-sm">+ $</span>
                            <input type="number" className="w-full border border-gray-200 rounded p-1.5 text-center font-bold bg-white focus:ring-2 focus:ring-black outline-none" value={price} onChange={(e) => updateModifier('storage', size, Number(e.target.value))} />
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {data.settings.enableConditions && (
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                        <h3 className="font-bold text-lg">Condition Adjustments ($)</h3>
                        <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Active</span>
                    </div>
                    {Object.entries(data.modifiers.condition).map(([cond, price]) => (
                    <div key={cond} className="flex justify-between items-center mb-3">
                        <label className="font-medium text-gray-700">{cond}</label>
                        <div className="flex items-center">
                        <span className="mr-2 text-gray-400">+ $</span>
                        <input type="number" className="w-20 border rounded p-1 text-center font-bold bg-gray-50 focus:ring-2 focus:ring-black outline-none" value={price} onChange={(e) => updateModifier('condition', cond, Number(e.target.value))} />
                        </div>
                    </div>
                    ))}
                </div>
            )}
        </div>

        {/* MODELS & BASE PRICES */}
        <div className="bg-white border rounded-xl p-8 shadow-sm mb-20">
          <h3 className="font-bold text-2xl mb-6">Device Base Prices</h3>

          {/* Manage Brands Block */}
          <div className="mb-8 p-5 border border-gray-200 rounded-xl bg-gray-50">
            <h4 className="text-sm font-bold text-gray-800 uppercase mb-3 tracking-wider">Manage Brands</h4>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(data.models).map((cat) => (
                    <div key={cat} className="flex items-center bg-white border border-gray-300 px-3 py-1.5 rounded-full shadow-sm group">
                        <span className="font-semibold text-sm text-gray-700">{cat}</span>
                        <button onClick={() => editCategory(cat)} className="ml-3 text-gray-400 hover:text-blue-500 transition-colors" title="Edit Brand Name">✏️</button>
                        <button onClick={() => deleteCategory(cat)} className="ml-2 text-gray-400 hover:text-red-500 font-bold text-lg leading-none" title={`Delete ${cat} and all its devices`}>×</button>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 max-w-sm">
                <input className="border border-gray-300 p-2.5 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-black bg-white text-sm" placeholder="New Brand (e.g. Google Pixel)" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
                <button onClick={addCategory} className="px-5 py-2.5 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition shadow-sm">Add Brand</button>
            </div>
          </div>
          
          {/* Add New Model Form */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex-1">
                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Brand</label>
                <div className="relative">
                  <select value={newModelCategory} onChange={(e) => setNewModelCategory(e.target.value)} className="w-full border p-3 rounded-lg bg-white appearance-none outline-none focus:ring-2 focus:ring-blue-500">
                      {Object.keys(data.models).length === 0 && <option value="">No Brands Available</option>}
                      {Object.keys(data.models).map(cat => ( <option key={cat} value={cat}>{cat}</option> ))}
                  </select>
                  <ChevronDown />
                </div>
            </div>
            <div className="flex-[2]">
                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Model Name</label>
                <input placeholder="e.g. iPhone 16 Pro Max" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} disabled={Object.keys(data.models).length === 0} onKeyDown={(e) => e.key === 'Enter' && addModel()} />
            </div>
            <div className="flex items-end">
                <button onClick={addModel} disabled={Object.keys(data.models).length === 0} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition w-full sm:w-auto disabled:opacity-50 disabled:hover:bg-blue-600">
                    + Add Device
                </button>
            </div>
          </div>

          {/* ✅ NEW: CATEGORY FILTER TABS */}
          {Object.keys(data.models).length > 0 && (
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                      onClick={() => setActiveFilter("All")}
                      className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeFilter === "All" ? "bg-black text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                      All Brands
                  </button>
                  {Object.keys(data.models).map(cat => (
                      <button 
                          key={cat}
                          onClick={() => setActiveFilter(cat)}
                          className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeFilter === cat ? "bg-black text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          )}

          {/* Filtered List View */}
          <div className="space-y-8">
            {Object.keys(data.models).length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-xl text-gray-400 font-medium">
                    Add a Brand above to start adding devices!
                </div>
            )}
            
            {Object.keys(data.models)
              .filter(cat => activeFilter === "All" || activeFilter === cat) // Apply the filter here
              .map((cat) => (
              <div key={cat} className="mb-6 animate-fade-in">
                
                <h4 className="font-bold text-xl border-b pb-2 mb-4 text-gray-800 flex items-center justify-between">
                    {cat}
                </h4>
                
                {data.models[cat].length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500 font-medium">
                        No devices added to {cat} yet. Use the form above to add one!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {data.models[cat]?.map((model) => (
                            <div key={model} className="flex justify-between items-center border border-gray-200 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm transition">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg text-gray-900">{model}</span>
                                    <button onClick={() => editModelName(cat, model)} className="text-gray-400 hover:text-blue-500 text-sm ml-1" title="Edit Model Name">✏️</button>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                        <span className="text-gray-400 text-sm font-bold uppercase mr-2">Base: $</span>
                                        <input type="number" className="w-24 border border-gray-300 p-2 rounded-lg font-bold text-black text-center focus:ring-2 focus:ring-black outline-none" value={data.basePrices[model] || 0} onChange={(e) => updateBasePrice(model, Number(e.target.value))} />
                                    </div>
                                    <button onClick={() => deleteModel(cat, model)} className="text-gray-400 hover:text-red-500 font-bold p-1 transition" title={`Delete ${model}`}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 right-8 z-50">
            <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-black text-white px-8 py-4 rounded-full shadow-2xl font-bold text-lg hover:scale-105 transition flex items-center gap-2 disabled:bg-gray-400 disabled:hover:scale-100"
            >
                {isSaving ? "Saving..." : "💾 Save Changes"}
            </button>
        </div>

      </div>
    </section>
  );
};

export default AdminSell;