import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { doc, setDoc, onSnapshot } from "firebase/firestore";
// ✅ Import from central file
import { db } from "../utils/firebase"; 

export interface PromoCode {
  code: string;
  label: string; 
  value: number; 
  type: "percent" | "fixed";
}

const AdminPromos = () => {
  const navigate = useNavigate();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState<number | "">("");
  const [newType, setNewType] = useState<"percent" | "fixed">("percent");
  const [loading, setLoading] = useState(true);

  // 🔒 SECURITY CHECK
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) navigate("/admin-portal-9831");
  }, [navigate]);

  const docRef = doc(db, "artifacts", "repairprodatabase", "public", "data", "promos-data", "main");

  useEffect(() => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setPromos(Object.values(snap.data() as Record<string, PromoCode>));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!newCode || !newLabel || !newValue) return alert("Fill all fields");
    const cleanCode = newCode.toUpperCase().trim();
    const newPromo: PromoCode = { code: cleanCode, label: newLabel, value: Number(newValue), type: newType };
    
    // Create map
    const updated = [...promos, newPromo].reduce((acc, p) => ({...acc, [p.code]: p}), {});
    await setDoc(docRef, updated);
    setNewCode(""); setNewLabel(""); setNewValue("");
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Delete?")) return;
    const updated = promos.filter(p => p.code !== code).reduce((acc, p) => ({...acc, [p.code]: p}), {});
    await setDoc(docRef, updated);
  };

  if (loading) return <div className="pt-28 text-center">Loading...</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen px-4 pb-20 pt-28">
      <div className="max-w-2xl mx-auto">
        
        {/* ✅ BACK BUTTON */}
        <button
          onClick={() => navigate("/admin-panel")}
          className="mb-8 inline-flex items-center gap-2 px-6 py-2 border border-black rounded-full text-sm font-medium hover:bg-white transition bg-transparent"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8 text-gray-900">Manage Promo Codes</h1>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg mb-10">
          <h2 className="font-bold text-xl mb-4">Add New Discount</h2>
          <div className="grid gap-4"> 
            <input className="p-3 border rounded-lg uppercase" placeholder="Code (e.g. SAVE10)" value={newCode} onChange={e => setNewCode(e.target.value)} />
            <input className="p-3 border rounded-lg" placeholder="Description" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
            <div className="flex gap-2">
              <input className="p-3 border rounded-lg flex-1" type="number" placeholder="Value" value={newValue} onChange={e => setNewValue(Number(e.target.value))} />
              <select className="p-3 border rounded-lg" value={newType} onChange={e => setNewType(e.target.value as any)}>
                <option value="percent">%</option><option value="fixed">$</option>
              </select>
            </div>
          </div>
          <button onClick={handleAdd} className="w-full mt-4 py-3 bg-black text-white font-bold rounded-lg">Create Discount</button>
        </div>

        <div className="space-y-3">
          {promos.map((p) => (
            <div key={p.code} className="flex justify-between items-center p-4 border rounded-xl bg-white shadow-sm">
              <div>
                <span className="font-bold text-lg">{p.code}</span>
                <span className="ml-2 bg-gray-100 text-xs px-2 py-1 rounded">-{p.type === 'percent' ? p.value + '%' : '$' + p.value}</span>
                <p className="text-sm text-gray-500">{p.label}</p>
              </div>
              <button onClick={() => handleDelete(p.code)} className="text-red-500 font-bold">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPromos;