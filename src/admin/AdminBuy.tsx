import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase"; 

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  condition: string; // Keeping this in the interface so old DB entries don't break
  image: string; 
  rank: string;      
  promoPrice: number; 
  isActive: boolean; 
}

interface BuyData {
  categories: string[];
  products: Product[];
}

const DEFAULT_BUY_DATA: BuyData = {
  categories: ["iPhone", "Samsung", "iPad", "MacBook"],
  products: [
    {
      id: 1, 
      name: "iPhone 13 Pro", 
      category: "iPhone", 
      price: 899, 
      promoPrice: 0, 
      condition: "N/A", // Default to N/A
      emoji: "📱",
      rank: "Standard",
      image: "https://placehold.co/200x200/png?text=iPhone+13",
      isActive: true
    }
  ]
};

const AdminBuy = () => {
  const navigate = useNavigate();
  const [buy, setBuy] = useState<BuyData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: "",
    emoji: "📱",
    condition: "N/A", // Hidden from UI, defaults to N/A
    image: "",
    rank: "Standard",
    promoPrice: 0,
    isActive: true 
  });

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) navigate("/admin-portal-9831");
  }, [navigate]);

  const buyDocRef = doc(db, 'artifacts', 'repairprodatabase', 'public', 'data', 'buy-data', 'main');

  useEffect(() => {
    const unsubscribe = onSnapshot(buyDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as BuyData;
        const upgradedProducts = data.products.map(p => ({
            ...p,
            rank: p.rank || "Standard",
            promoPrice: p.promoPrice || 0,
            image: p.image || "https://placehold.co/200x200?text=No+Image",
            isActive: p.isActive !== undefined ? p.isActive : true,
            condition: p.condition || "N/A" // Ensure it exists but is ignored UI-side
        }));
        setBuy({ ...data, products: upgradedProducts });
      } else {
        setBuy(DEFAULT_BUY_DATA);
      }
    }, (error) => {
      console.error("Error fetching buy data:", error);
      setStatusMsg("Error loading data.");
    });
    return () => unsubscribe();
  }, []);

  const saveChanges = useCallback(async () => {
    if (!buy) return;
    setIsSaving(true);
    setStatusMsg("Saving...");

    try {
      await setDoc(buyDocRef, buy); 
      setStatusMsg("✅ Saved successfully!");
      setEditingId(null); 
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) { 
      console.error("Error saving:", e); 
      setStatusMsg("❌ Save failed.");
    } finally {
      setIsSaving(false);
    }
  }, [buy]);

  const deleteProduct = (id: number) => {
    if(!confirm("Are you sure you want to delete this item completely? Use the 'Active' toggle to simply hide it!")) return;
    setBuy(prev => prev ? ({ ...prev, products: prev.products.filter((p) => p.id !== id) }) : prev);
  };

  const updateProduct = (id: number, key: keyof Product, value: string | number | boolean) => {
    setBuy(prev => prev ? ({ ...prev, products: prev.products.map((prod) => prod.id === id ? { ...prod, [key]: value } : prod) }) : prev);
  };

  const toggleActive = (id: number, currentStatus: boolean) => {
      updateProduct(id, 'isActive', !currentStatus);
  };

  const addCategory = () => {
    if (!newCategory.trim() || !buy) return;
    if (buy.categories.includes(newCategory.trim())) return;
    setBuy(prev => prev ? ({ ...prev, categories: [...prev.categories, newCategory.trim()] }) : prev);
    setNewCategory("");
  };

  const deleteCategory = (index: number) => {
    setBuy(prev => prev ? ({ ...prev, categories: prev.categories.filter((_, idx) => idx !== index) }) : prev);
  };

  const addProduct = () => {
    const { name, price, category } = newProduct;
    // Condition is no longer required to add a product
    if (!name || !price || !category || !buy) return alert("Please fill all required fields");

    setBuy(prev => prev ? ({
      ...prev,
      products: [
        {
          id: Date.now(),
          name: name,
          price: Number(price),
          category: category,
          emoji: newProduct.emoji || "📱",
          condition: "N/A", // Hardcoded
          rank: newProduct.rank || "Standard",
          promoPrice: Number(newProduct.promoPrice) || 0,
          image: newProduct.image || "https://placehold.co/200x200?text=No+Image",
          isActive: true
        },
        ...prev.products
      ]
    }) : prev);

    setNewProduct({ name: "", price: 0, category: "", emoji: "📱", condition: "N/A", image: "", rank: "Standard", promoPrice: 0, isActive: true });
  };

  const ChevronDown = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  );

  if (!buy) return <div className="pt-28 text-center text-gray-500">Loading Inventory Data...</div>;

  return (
    <section className="w-full bg-gray-50 pt-28 pb-32 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Shop Inventory</h1>
          <div className="flex items-center gap-4">
             {statusMsg && <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">{statusMsg}</span>}
             <button onClick={() => navigate("/admin-panel")} className="px-4 py-2 bg-white border rounded-full hover:bg-gray-100 transition shadow-sm font-medium">← Back</button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-10 p-8 border border-gray-200 rounded-2xl bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">1. Inventory Categories</h2>
            <div className="flex flex-wrap gap-3 mb-6">
                {buy.categories.map((cat, i) => (
                <div key={i} className="flex gap-2 items-center bg-gray-50 px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="font-semibold text-gray-700">{cat}</span>
                    <button onClick={() => deleteCategory(i)} className="text-gray-400 hover:text-red-500 font-bold ml-2">✕</button>
                </div>
                ))}
            </div>
            <div className="flex gap-3 max-w-md">
                <input className="border border-gray-300 p-3 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-black bg-gray-50" placeholder="New Category (e.g. Gaming)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                <button onClick={addCategory} className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition">Add</button>
            </div>
        </div>

        {/* Add Product Form - Condition Input Removed */}
        <div className="p-8 border border-blue-100 rounded-2xl bg-blue-50 mb-10 shadow-sm">
            <h3 className="font-bold text-xl mb-6 text-blue-900 border-b border-blue-200 pb-2">Add New Product</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-blue-800 uppercase mb-1">Device Name</label>
                  <input className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="e.g. iPad Pro M4" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-blue-800 uppercase mb-1">Standard Price ($)</label>
                  <input className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Price" type="number" value={newProduct.price || ""} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-blue-800 uppercase mb-1">Category</label>
                  <div className="relative">
                    <select className="w-full border p-3 rounded-lg outline-none appearance-none focus:ring-2 focus:ring-blue-500 bg-white" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                        <option value="">Select Category...</option>{buy.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-blue-800 uppercase mb-1">Badge / Rank</label>
                  <div className="relative">
                    <select className="w-full border p-3 rounded-lg outline-none appearance-none focus:ring-2 focus:ring-blue-500 bg-white" value={newProduct.rank} onChange={(e) => setNewProduct({ ...newProduct, rank: e.target.value })}>
                        <option value="Standard">Standard</option>
                        <option value="Staff Pick">Staff Pick ⭐</option>
                        <option value="Best Seller">Best Seller 📈</option>
                        <option value="Clearance">Clearance 🚨</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-purple-700 uppercase mb-1">Sale Price ($)</label>
                  <input className="border border-purple-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50 text-purple-900 font-bold" placeholder="0 = No Sale" type="number" value={newProduct.promoPrice || ""} onChange={(e) => setNewProduct({ ...newProduct, promoPrice: Number(e.target.value) })} />
                </div>

                <div className="flex flex-col lg:col-span-3">
                  <label className="text-xs font-bold text-blue-800 uppercase mb-1">Image URL</label>
                  <input className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="https://..." value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
                </div>

                <div className="lg:col-span-4 mt-2">
                  <button onClick={addProduct} className="w-full bg-blue-600 text-white rounded-lg py-4 font-bold text-lg hover:bg-blue-700 transition shadow-md">+ Add Product to Inventory</button>
                </div>
            </div>
        </div>

        {/* Current Inventory List */}
        <div className="mb-4 flex justify-between items-end border-b pb-2">
            <h2 className="text-2xl font-bold text-gray-800">Current Inventory ({buy.products.length})</h2>
        </div>
        
        <div className="space-y-6 mb-8">
          {buy.products.map((p) => {
            const isEditing = editingId === p.id;
            const cardOpacity = p.isActive ? 'opacity-100' : 'opacity-60 grayscale-[50%]';

            return (
              <div key={p.id} className={`border p-5 rounded-2xl shadow-sm transition-all duration-300 ${isEditing ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 bg-white hover:shadow-md'} ${cardOpacity}`}>
                  
                  {isEditing ? (
                      /* --- EDIT MODE - Condition Input Removed --- */
                      <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b pb-2">
                              <h4 className="font-bold text-blue-900">Editing: {p.name}</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="flex flex-col">
                                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">Name</label>
                                  <input className="border border-gray-300 p-2.5 rounded-lg text-sm" value={p.name} onChange={(e) => updateProduct(p.id, 'name', e.target.value)} />
                              </div>

                              <div className="flex flex-col">
                                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">Price ($)</label>
                                  <input className="border border-gray-300 p-2.5 rounded-lg text-sm font-bold" value={p.price} type="number" onChange={(e) => updateProduct(p.id, 'price', Number(e.target.value))} />
                              </div>

                              <div className="flex flex-col">
                                  <label className="text-[10px] uppercase font-bold text-purple-600 mb-1">Sale ($)</label>
                                  <input className="border border-purple-300 p-2.5 rounded-lg text-sm font-bold text-purple-700 bg-purple-50" value={p.promoPrice} type="number" onChange={(e) => updateProduct(p.id, 'promoPrice', Number(e.target.value))} />
                              </div>

                              <div className="flex flex-col">
                                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">Category</label>
                                  <div className="relative">
                                    <select className="w-full border border-gray-300 p-2.5 rounded-lg text-sm appearance-none bg-white" value={p.category} onChange={(e) => updateProduct(p.id, 'category', e.target.value)}>
                                        {buy.categories.map(cat => <option key={cat}>{cat}</option>)}
                                    </select>
                                    <ChevronDown />
                                  </div>
                              </div>

                              <div className="flex flex-col">
                                  <label className="text-[10px] uppercase font-bold text-blue-600 mb-1">Badge</label>
                                  <div className="relative">
                                    <select className="w-full border border-blue-300 p-2.5 rounded-lg text-sm bg-blue-50 text-blue-800 font-medium appearance-none" value={p.rank} onChange={(e) => updateProduct(p.id, 'rank', e.target.value)}>
                                        <option value="Standard">Standard</option>
                                        <option value="Staff Pick">Staff Pick ⭐</option>
                                        <option value="Best Seller">Best Seller 📈</option>
                                        <option value="Clearance">Clearance 🚨</option>
                                    </select>
                                    <ChevronDown />
                                  </div>
                              </div>

                              <div className="flex flex-col lg:col-span-3">
                                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">Image URL</label>
                                  <input className="border border-gray-300 p-2.5 rounded-lg text-sm" value={p.image} onChange={(e) => updateProduct(p.id, 'image', e.target.value)} />
                              </div>
                          </div>

                          <div className="flex justify-end mt-2">
                              <button onClick={() => setEditingId(null)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition">
                                  Done
                              </button>
                          </div>
                      </div>
                  ) : (
                      /* --- READ-ONLY MODE - Condition Display Removed --- */
                      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center w-full relative">
                          
                          {/* The Active/Inactive Toggle */}
                          <div className="absolute top-0 right-0 lg:static lg:mr-4 flex flex-col items-center">
                              <span className={`text-[10px] font-bold uppercase mb-1 ${p.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                  {p.isActive ? 'Live' : 'Hidden'}
                              </span>
                              <button 
                                  onClick={() => toggleActive(p.id, p.isActive)}
                                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${p.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                              >
                                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${p.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                          </div>

                          {/* Image Thumbnail */}
                          <div className="w-24 h-24 bg-gray-50 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 mt-6 lg:mt-0">
                              {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <span className="text-xs text-gray-400">No Img</span>}
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-1">
                                  <h4 className="font-bold text-xl leading-tight text-gray-900">{p.name}</h4>
                                  {p.promoPrice > 0 && <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm">SALE: ${p.promoPrice}</span>}
                                  {p.rank !== "Standard" && <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">{p.rank}</span>}
                              </div>
                              <p className="text-xs text-gray-400 mb-3 font-mono">ID: {p.id}</p>
                              
                              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                  <div><span className="text-gray-400 text-xs font-bold uppercase mr-1">Price:</span><span className="font-bold text-gray-800">${p.price}</span></div>
                                  <div><span className="text-gray-400 text-xs font-bold uppercase mr-1">Category:</span><span className="font-medium text-gray-700">{p.category}</span></div>
                              </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                              <button onClick={() => setEditingId(p.id)} className="flex-1 lg:flex-none bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2">
                                  ✏️ Edit
                              </button>
                              <button onClick={() => deleteProduct(p.id)} className="flex-1 lg:flex-none bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2">
                                  🗑️ Delete
                              </button>
                          </div>
                      </div>
                  )}
              </div>
            );
          })}
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 right-8 z-50">
            <button 
                onClick={saveChanges} 
                disabled={isSaving}
                className="bg-black text-white px-8 py-4 rounded-full shadow-2xl font-bold text-lg hover:scale-105 transition flex items-center gap-2 disabled:bg-gray-400 disabled:hover:scale-100"
            >
                {isSaving ? "Saving..." : "💾 Save All Inventory"}
            </button>
        </div>

      </div>
    </section>
  );
};

export default AdminBuy;