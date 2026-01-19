import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
// ✅ Import from your central file
import { db } from "../utils/firebase"; 

type DeviceName = "iPhone" | "Android" | "Tablet / iPad" | "Computer" | "Apple Watch" | "Game Console";

interface RepairData {
  models: Record<DeviceName, string[]>;
  issues: string[];
  pricing: Record<DeviceName, Record<string, Record<string, number>>>;
}

const DEFAULT_REPAIR_DATA: RepairData = {
  models: {
    iPhone: ["iPhone 13", "iPhone 14"],
    Android: ["Samsung S21"],
    "Tablet / iPad": ["iPad Pro"],
    Computer: ["MacBook Air"],
    "Apple Watch": ["Series 7"],
    "Game Console": ["PS5"],
  },
  issues: ["Screen Replacement", "Battery Replacement"],
  pricing: { iPhone: {}, Android: {}, "Tablet / iPad": {}, Computer: {}, "Apple Watch": {}, "Game Console": {} } as any,
};

// ✅ Define the exact order you want for the devices
const DEVICE_ORDER: DeviceName[] = [
  "iPhone",
  "Android",
  "Tablet / iPad",
  "Computer",
  "Apple Watch",
  "Game Console",
];

const AdminRepair = () => {
  const navigate = useNavigate();
  
  // Data State
  const [repair, setRepair] = useState<RepairData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // UI State
  const [expandedDevices, setExpandedDevices] = useState<Record<string, boolean>>({});
  const [expandedModels, setExpandedModels] = useState<Record<string, Record<string, boolean>>>({});
  
  // Inputs
  const [newModelByDevice, setNewModelByDevice] = useState<Record<string, string>>({});
  const [newIssue, setNewIssue] = useState("");

  // Edit Model Name State
  const [editingModel, setEditingModel] = useState<{ deviceKey: string; oldModel: string; } | null>(null);
  const [editingModelValue, setEditingModelValue] = useState("");

  // 🔒 SECURITY CHECK
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) navigate("/admin-portal-9831");
  }, [navigate]);

  const APP_ID = "repairprodatabase"; 
  const repairDocRef = doc(db, "artifacts", APP_ID, "public", "data", "repair-data", "main");

  // 1. Fetch Data
  useEffect(() => {
    const unsubscribe = onSnapshot(repairDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setRepair(docSnap.data() as RepairData);
      } else {
        setDoc(repairDocRef, DEFAULT_REPAIR_DATA);
        setRepair(DEFAULT_REPAIR_DATA);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Save Data
  const saveChanges = async () => {
    if (!repair) return;
    setIsSaving(true);
    setStatusMsg("Saving...");
    try {
      await setDoc(repairDocRef, repair);
      setStatusMsg("Saved!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      console.error(e);
      setStatusMsg("Error saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Logic Helpers ---

  const updatePrice = (device: DeviceName, model: string, issue: string, value: number) => {
    setRepair(prev => {
       if(!prev) return prev;
       return {
         ...prev,
         pricing: {
           ...prev.pricing,
           [device]: {
             ...prev.pricing[device],
             [model]: {
               ...prev.pricing[device]?.[model],
               [issue]: value
             }
           }
         }
       };
    });
  };

  const addModel = (deviceKey: string) => {
    const device = deviceKey as DeviceName;
    const name = (newModelByDevice[deviceKey] || "").trim();
    if (!name || !repair) return;
    if (repair.models[device].includes(name)) return;

    setRepair(prev => {
      if(!prev) return prev;
      return {
        ...prev,
        models: { ...prev.models, [device]: [...prev.models[device], name] },
        pricing: {
            ...prev.pricing,
            [device]: { ...prev.pricing[device], [name]: {} } // Init empty pricing
        }
      };
    });
    setNewModelByDevice({ ...newModelByDevice, [deviceKey]: "" });
    // Auto-expand
    setExpandedDevices({ ...expandedDevices, [deviceKey]: true });
  };

  const deleteModel = (deviceKey: string, model: string) => {
    if(!confirm(`Delete ${model}?`)) return;
    const device = deviceKey as DeviceName;
    setRepair(prev => {
      if(!prev) return prev;
      const newModels = prev.models[device].filter(m => m !== model);
      const newPricing = { ...prev.pricing[device] };
      delete newPricing[model];
      return {
        ...prev,
        models: { ...prev.models, [device]: newModels },
        pricing: { ...prev.pricing, [device]: newPricing }
      };
    });
  };

  const addIssue = () => {
    if(!newIssue.trim() || !repair) return;
    if(repair.issues.includes(newIssue.trim())) return;
    setRepair({ ...repair, issues: [...repair.issues, newIssue.trim()] });
    setNewIssue("");
  };

  const deleteIssue = (issue: string) => {
    if(!confirm(`Delete issue "${issue}"?`)) return;
    setRepair(prev => prev ? ({ ...prev, issues: prev.issues.filter(i => i !== issue) }) : prev);
  };

  // --- Edit Model Name Logic ---
  const startEditModel = (deviceKey: string, model: string) => {
    setEditingModel({ deviceKey, oldModel: model });
    setEditingModelValue(model);
  };

  const saveModelName = () => {
    if (!editingModel || !repair) return;
    const { deviceKey, oldModel } = editingModel;
    const device = deviceKey as DeviceName;
    const newName = editingModelValue.trim();

    if (!newName || newName === oldModel) {
      setEditingModel(null); return;
    }
    
    // Update data
    const updatedModels = repair.models[device].map(m => m === oldModel ? newName : m);
    const updatedPricing = { ...repair.pricing[device] };
    updatedPricing[newName] = updatedPricing[oldModel];
    delete updatedPricing[oldModel];

    setRepair({
      ...repair,
      models: { ...repair.models, [device]: updatedModels },
      pricing: { ...repair.pricing, [device]: updatedPricing }
    });
    setEditingModel(null);
  };

  // --- Toggles ---
  const toggleDevice = (dev: string) => setExpandedDevices(p => ({...p, [dev]: !p[dev]}));
  const toggleModel = (dev: string, mod: string) => {
    setExpandedModels(p => ({
        ...p, 
        [dev]: { ...p[dev], [mod]: !p[dev]?.[mod] }
    }));
  };

  if (!repair) return <div className="pt-28 text-center">Loading...</div>;

  // ✅ SORT DEVICES: Ensure iPhone is first using the DEVICE_ORDER constant
  const deviceKeys = (Object.keys(repair.models) as DeviceName[]).sort(
    (a, b) => DEVICE_ORDER.indexOf(a) - DEVICE_ORDER.indexOf(b)
  );

  return (
    <section className="w-full bg-white pt-28 pb-20 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* ✅ BACK BUTTON */}
        <button
          onClick={() => navigate("/admin-panel")}
          className="mb-6 px-4 py-2 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-100 transition inline-flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold">Edit Repair Data</h1>
          {statusMsg && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">{statusMsg}</span>}
        </div>

        {/* 1. MANAGE ISSUES (Columns) */}
        <div className="bg-gray-50 p-6 rounded-xl border mb-8">
            <h2 className="font-bold text-lg mb-4">Manage Service Types (Issues)</h2>
            <div className="flex flex-wrap gap-2 mb-4">
                {repair.issues.map(issue => (
                    <div key={issue} className="bg-white border px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                        {issue}
                        <button onClick={() => deleteIssue(issue)} className="text-red-500 font-bold hover:text-red-700">×</button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 max-w-md">
                <input 
                    className="border p-2 rounded-lg flex-1" 
                    placeholder="New Service (e.g. Water Damage)" 
                    value={newIssue} 
                    onChange={e => setNewIssue(e.target.value)} 
                />
                <button onClick={addIssue} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">Add</button>
            </div>
        </div>

        {/* 2. DEVICES & PRICES */}
        <div className="space-y-4 mb-10">
          {deviceKeys.map((deviceKey) => (
             <div key={deviceKey} className="border border-gray-200 rounded-xl overflow-hidden">
                
                {/* Device Header */}
                <button 
                  className="w-full p-4 text-left font-bold bg-white hover:bg-gray-50 flex justify-between items-center transition"
                  onClick={() => toggleDevice(deviceKey)}
                >
                  <span className="text-lg">{deviceKey}</span>
                  <span className="text-gray-400 text-sm">{expandedDevices[deviceKey] ? "Collapse ▲" : "Expand ▼"}</span>
                </button>
                
                {expandedDevices[deviceKey] && (
                  <div className="bg-gray-50 border-t p-4 space-y-3">
                    {/* Models List */}
                    {[...repair.models[deviceKey]].reverse().map(model => {
                        const isEditing = editingModel?.deviceKey === deviceKey && editingModel?.oldModel === model;
                        const isExpanded = expandedModels[deviceKey]?.[model];

                        return (
                            <div key={model} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                <div className="p-3 flex items-center justify-between gap-4">
                                    
                                    {/* Model Name Area */}
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <input 
                                                    className="border p-1 rounded w-full" 
                                                    value={editingModelValue} 
                                                    onChange={e => setEditingModelValue(e.target.value)} 
                                                />
                                                <button onClick={saveModelName} className="bg-green-600 text-white px-3 rounded text-xs font-bold">Save</button>
                                                <button onClick={() => setEditingModel(null)} className="text-gray-500 text-xs underline">Cancel</button>
                                            </div>
                                        ) : (
                                            // Clearer "Manage Prices" Button
                                            <button 
                                                onClick={() => toggleModel(deviceKey, model)}
                                                className="flex items-center gap-2 text-left font-semibold hover:text-blue-600 transition group"
                                            >
                                                <span className={`transform transition ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                                {model}
                                                <span className="text-xs font-normal text-gray-400 group-hover:text-blue-500 ml-2 border border-gray-200 rounded px-2 py-0.5">
                                                    {isExpanded ? "Close Prices" : "Manage Prices"}
                                                </span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {!isEditing && (
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditModel(deviceKey, model)} className="text-blue-600 text-xs font-bold px-2 py-1 hover:bg-blue-50 rounded">Rename</button>
                                            <button onClick={() => deleteModel(deviceKey, model)} className="text-red-600 text-xs font-bold px-2 py-1 hover:bg-red-50 rounded">Delete</button>
                                        </div>
                                    )}
                                </div>

                                {/* PRICING PANEL (Hidden by default) */}
                                {isExpanded && !isEditing && (
                                    <div className="bg-blue-50/50 p-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-down">
                                        {repair.issues.map(issue => (
                                            <div key={issue} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                                <label className="text-xs font-bold text-gray-600 mr-2">{issue}</label>
                                                <div className="relative w-24">
                                                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                                                    <input 
                                                        type="number"
                                                        className="w-full border rounded pl-5 py-1 text-sm outline-none focus:border-blue-500"
                                                        value={repair.pricing[deviceKey]?.[model]?.[issue] || 0}
                                                        onChange={(e) => updatePrice(deviceKey, model, issue, Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="col-span-full text-center text-xs text-gray-400 mt-2">
                                            Changes save automatically when you click "Save Changes" below.
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Add Model Input */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                        <input 
                            className="flex-1 border p-2 rounded-lg" 
                            placeholder={`New ${deviceKey} Model Name`}
                            value={newModelByDevice[deviceKey] || ""}
                            onChange={e => setNewModelByDevice({...newModelByDevice, [deviceKey]: e.target.value})}
                        />
                        <button onClick={() => addModel(deviceKey)} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm">Add Model</button>
                    </div>
                  </div>
                )}
             </div>
          ))}
        </div>

        {/* ✅ SAVE BUTTON: Removed "sticky" so it sits at the bottom */}
        <button onClick={saveChanges} disabled={isSaving} className="w-full py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-lg mt-8">
           {isSaving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </section>
  );
};

export default AdminRepair;