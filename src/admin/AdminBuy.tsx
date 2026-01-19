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
  condition: string;
  image?: string; 
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
      condition: "Excellent",
      emoji: "📱",
      image: "https://placehold.co/200x200/png?text=iPhone+13"
    }
  ]
};

const AdminBuy = () => {
  const navigate = useNavigate();
  const [buy, setBuy] = useState<BuyData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: "",
    emoji: "📱",
    condition: "",
    image: ""
  });

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) navigate("/admin-portal-9831");
  }, [navigate]);

  const buyDocRef = doc(db, 'artifacts', 'repairprodatabase', 'public', 'data', 'buy-data', 'main');

  useEffect(() => {
    const unsubscribe = onSnapshot(buyDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setBuy(docSnap.data() as BuyData);
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
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) { 
      console.error("Error saving:", e); 
      setStatusMsg("❌ Save failed.");
    } finally {
      setIsSaving(false);
    }
  }, [buy]);

  const deleteProduct = (id: number) => {
    setBuy(prev => prev ? ({ ...prev, products: prev.products.filter((p) => p.id !== id) }) : prev);
  };

  const updateProduct = (id: number, key: keyof Product, value: string | number) => {
    setBuy(prev => prev ? ({ ...prev, products: prev.products.map((prod) => prod.id === id ? { ...prod, [key]: value } : prod) }) : prev);
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
    const { name, price, category, condition } = newProduct;
    if (!name || !price || !category || !condition || !buy) return alert("Please fill all fields");

    setBuy(prev => prev ? ({
      ...prev,
      products: [
        {
          id: Date.now(),
          name: name,
          price: Number(price),
          category: category,
          emoji: newProduct.emoji || "📱",
          condition: condition,
          image: newProduct.image || "https://placehold.co/200x200?text=No+Image"
        },
        ...prev.products
      ]
    }) : prev);

    setNewProduct({ name: "", price: 0, category: "", emoji: "📱", condition: "", image: "" });
  };

  // ✅ Arrow Helper
  const ChevronDown = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  );

  if (!buy) return <div className="pt-28 text-center text-gray-500">Loading...</div>;

  return (
    <section className="w-full bg-gray-50 pt-28 pb-10 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Shop Inventory</h1>
          <div className="flex items-center gap-4">
             {statusMsg && <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">{statusMsg}</span>}
             <button onClick={() => navigate("/admin-panel")} className="px-4 py-2 border rounded-full hover:bg-gray-100 transition">← Back</button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-10 p-6 border border-gray-200 rounded-xl bg-gray-50">
            <h2 className="text-xl font-bold mb-4 text-gray-800">1. Categories</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                {buy.categories.map((cat, i) => (
                <div key={i} className="flex gap-3 items-center bg-white p-2 rounded shadow-sm border">
                    <span className="flex-1 font-medium">{cat}</span>
                    <button onClick={() => deleteCategory(i)} className="text-red-500 font-bold px-2">×</button>
                </div>
                ))}
            </div>
            <div className="flex gap-3">
                <input className="border border-gray-300 p-2 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-black" placeholder="New Category (e.g. Gaming)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                <button onClick={addCategory} className="px-4 py-2 bg-black text-white rounded-lg font-bold">Add</button>
            </div>
        </div>

        {/* Add Product Form */}
        <div className="p-6 border border-gray-200 rounded-xl bg-blue-50 mb-10">
            <h3 className="font-bold text-lg mb-4 text-blue-900">Add New Product</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Price" type="number" value={newProduct.price || ""} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
                
                {/* ✅ Flat Select: Category */}
                <div className="relative">
                  <select 
                    className="w-full border p-2 rounded-lg outline-none appearance-none focus:ring-2 focus:ring-blue-500 bg-white" 
                    value={newProduct.category} 
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                      <option value="">Category...</option>{buy.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown />
                </div>

                {/* ✅ Flat Select: Condition */}
                <div className="relative">
                  <select 
                    className="w-full border p-2 rounded-lg outline-none appearance-none focus:ring-2 focus:ring-blue-500 bg-white" 
                    value={newProduct.condition} 
                    onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })}
                  >
                      <option value="">Condition...</option><option>Excellent</option><option>Very Good</option><option>Good</option><option>Fair</option>
                  </select>
                  <ChevronDown />
                </div>

                <input className="border p-2 rounded-lg col-span-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Image URL (Optional)" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
                <button onClick={addProduct} className="bg-blue-600 text-white rounded-lg font-bold col-span-2 hover:bg-blue-700 transition">Add Product</button>
            </div>
        </div>

        {/* Products List */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">2. Current Inventory</h2>
        <div className="space-y-4 mb-8">
          {buy.products.map((p) => (
            <div key={p.id} className="border border-gray-200 p-4 rounded-xl shadow-sm bg-white flex flex-col md:flex-row gap-4 items-center">
                <img src={p.image} className="w-16 h-16 object-contain bg-gray-50 rounded" alt="product" />
                
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                    <input className="border border-gray-300 p-2 rounded" value={p.name} onChange={(e) => updateProduct(p.id, 'name', e.target.value)} />
                    <input className="border border-gray-300 p-2 rounded" value={p.price} type="number" onChange={(e) => updateProduct(p.id, 'price', Number(e.target.value))} />
                    
                    {/* ✅ Flat Select (Inventory Item) */}
                    <div className="relative">
                      <select 
                        className="w-full border border-gray-300 p-2 rounded appearance-none bg-white" 
                        value={p.category} 
                        onChange={(e) => updateProduct(p.id, 'category', e.target.value)}
                      >
                          {buy.categories.map(cat => <option key={cat}>{cat}</option>)}
                      </select>
                      <ChevronDown />
                    </div>

                    {/* ✅ Flat Select (Inventory Item) */}
                    <div className="relative">
                      <select 
                        className="w-full border border-gray-300 p-2 rounded appearance-none bg-white" 
                        value={p.condition} 
                        onChange={(e) => updateProduct(p.id, 'condition', e.target.value)}
                      >
                          <option>Excellent</option><option>Very Good</option><option>Good</option><option>Fair</option>
                      </select>
                      <ChevronDown />
                    </div>
                </div>
                
                <button onClick={() => deleteProduct(p.id)} className="bg-red-100 text-red-600 font-bold p-3 rounded-lg hover:bg-red-200">Delete</button>
            </div>
          ))}
        </div>

        <button onClick={saveChanges} disabled={isSaving} className="w-full py-4 rounded-full font-extrabold text-lg bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 shadow-xl">
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </section>
  );
};

export default AdminBuy;