import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  condition: string;
}

interface BuyData {
  categories: string[];
  products: Product[];
}

const BuyPage = () => {
  const [data, setData] = useState<BuyData>({ categories: [], products: [] });
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Scroll ref for category bar
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch data from Firestore
    const ref = doc(db, "artifacts", "repairprodatabase", "public", "data", "buy-data", "main");
    
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const fetchedData = snap.data() as BuyData;
        setData(fetchedData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = activeCategory === "All"
    ? data.products
    : data.products.filter(p => p.category === activeCategory);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  if (loading) return <div className="pt-40 text-center font-bold">Loading Inventory...</div>;

  return (
    <section className="w-full bg-white pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Shop Certified Devices</h1>
          <p className="text-gray-600 text-lg">Quality checked, warranty included, unlocked.</p>
        </div>

        {/* Category Filter Bar */}
        <div className="relative mb-12 flex items-center">
          <button onClick={() => scroll("left")} className="hidden sm:block absolute left-0 z-10 p-2 bg-white border rounded-full shadow hover:bg-gray-50">←</button>
          
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full px-12 pb-4"
          >
            <button
              onClick={() => setActiveCategory("All")}
              className={`whitespace-nowrap px-6 py-2 rounded-full border transition ${
                activeCategory === "All" ? "bg-black text-white border-black" : "bg-white hover:border-black"
              }`}
            >
              All Devices
            </button>
            
            {data.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2 rounded-full border transition ${
                  activeCategory === cat ? "bg-black text-white border-black" : "bg-white hover:border-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button onClick={() => scroll("right")} className="hidden sm:block absolute right-0 z-10 p-2 bg-white border rounded-full shadow hover:bg-gray-50">→</button>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition duration-300 bg-white">
                
                {/* Image Area */}
                <div className="h-48 flex items-center justify-center mb-4 overflow-hidden rounded-lg bg-gray-50">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500"
                    onError={(e) => {e.currentTarget.src = "https://via.placeholder.com/200?text=No+Image"}} 
                  />
                </div>

                {/* Details */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {product.condition}
                    </span>
                  </div>
                  <div className="text-xl font-bold">${product.price}</div>
                </div>

                {/* Action Button */}
                <button className="w-full mt-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">No devices found in this category.</p>
            <button onClick={() => setActiveCategory("All")} className="mt-4 text-black underline font-bold">View all devices</button>
          </div>
        )}

      </div>
    </section>
  );
};

export default BuyPage;