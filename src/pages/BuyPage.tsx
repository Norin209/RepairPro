import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";
// If you set up Firebase Analytics, you would import it here:
// import { analytics } from "../utils/firebase"; 
// import { logEvent } from "firebase/analytics";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  condition: string;
  rank?: string;       
  promoPrice?: number; 
  isActive?: boolean;  
}

interface BuyData {
  categories: string[];
  products: Product[];
}

const BuyPage = () => {
  const [data, setData] = useState<BuyData>({ categories: [], products: [] });
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = doc(db, "artifacts", "repairprodatabase", "public", "data", "buy-data", "main");
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) setData(snap.data() as BuyData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const activeProducts = data.products.filter(p => p.isActive !== false); 
  const filteredProducts = activeCategory === "All"
    ? activeProducts
    : activeProducts.filter(p => p.category === activeCategory);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // ✅ ANALYTICS / TRACKING FUNCTION
  const handleProductClick = (product: Product) => {
    console.log(`User clicked on: ${product.name}`);
    
    // Example of tracking the click in Firebase Analytics:
    // if (analytics) {
    //   logEvent(analytics, 'select_item', {
    //     item_id: product.id,
    //     item_name: product.name,
    //     item_category: product.category,
    //     price: product.price
    //   });
    // }

    // Next step: Open a modal or navigate to a product details page!
    alert(`Opening details for ${product.name}`); 
  };

  const renderBadge = (rank?: string) => {
    if (!rank || rank === "Standard") return null;
    let colorClass = "bg-gray-100 text-gray-800 border-gray-200"; 
    if (rank.includes("Staff Pick")) colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (rank.includes("Best Seller")) colorClass = "bg-blue-50 text-blue-700 border-blue-200";
    if (rank.includes("Clearance")) colorClass = "bg-red-50 text-red-700 border-red-200";

    return (
      <span className={`absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md ${colorClass}`}>
        {rank}
      </span>
    );
  };

  if (loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
      </div>
  );

  return (
    <section className="w-full bg-[#FAFAFA] min-h-screen font-sans selection:bg-black selection:text-white">
      
      {/* 1. Sleek Gradient Hero Section */}
      <div className="pt-32 pb-16 px-4 bg-gradient-to-b from-gray-100 to-[#FAFAFA]">
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Premium Devices.<br/>Unbeatable Value.
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                Strictly vetted, unlocked, and ready for you. Every device is backed by our Premier Guarantee.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-32">
        {/* 2. Glassmorphism Sticky Category Bar */}
        <div className="sticky top-4 z-40 mb-12">
            <div className="relative max-w-fit mx-auto bg-white/80 backdrop-blur-xl border border-gray-200/50 p-1.5 rounded-full shadow-lg shadow-gray-200/50 flex items-center">
            
            <button onClick={() => scroll("left")} className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2 snap-x">
                <button
                onClick={() => setActiveCategory("All")}
                className={`snap-center whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                    activeCategory === "All" ? "bg-black text-white shadow-md" : "text-gray-500 hover:text-black hover:bg-gray-100"
                }`}
                >
                All
                </button>
                {data.categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`snap-center whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                    activeCategory === cat ? "bg-black text-white shadow-md" : "text-gray-500 hover:text-black hover:bg-gray-100"
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>

            <button onClick={() => scroll("right")} className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all ml-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
            </div>
        </div>

        {/* 3. Ultra-Clean Product Cards */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const isOnSale = product.promoPrice && product.promoPrice > 0;
              const displayPrice = isOnSale ? product.promoPrice : product.price;

              return (
                <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    className="group flex flex-col bg-white rounded-3xl p-4 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-400 cursor-pointer border border-gray-100/80"
                >
                  
                  {/* Image Container with subtle gray background */}
                  <div className="relative h-64 w-full mb-6 rounded-2xl bg-[#F4F4F5] flex items-center justify-center overflow-hidden">
                    {renderBadge(product.rank)}
                    {isOnSale && (
                        <span className="absolute top-4 right-4 z-10 text-[10px] font-black uppercase text-red-600 bg-red-100 px-3 py-1.5 rounded-full">
                            Sale
                        </span>
                    )}
                    <img 
                      src={product.image || "https://placehold.co/400x400?text=No+Image"} 
                      alt={product.name} 
                      className="h-3/4 object-contain group-hover:scale-105 transition-transform duration-500 ease-out mix-blend-multiply"
                    />
                  </div>

                  {/* Clean Typography */}
                  <div className="px-2 pb-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                            {product.name}
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {product.condition}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400">{product.category}</span>
                    </div>

                    {/* Pricing */}
                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-bold ${isOnSale ? 'text-red-500' : 'text-gray-900'}`}>
                                ${displayPrice}
                            </span>
                            {isOnSale && (
                                <span className="text-sm text-gray-400 line-through font-medium">
                                    ${product.price}
                                </span>
                            )}
                        </div>
                        
                        {/* Hover Action Arrow */}
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                             <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Elegant Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 mt-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No devices found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-sm">We currently don't have any active stock in the "{activeCategory}" category.</p>
            <button onClick={() => setActiveCategory("All")} className="bg-gray-100 text-black px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition">
                Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BuyPage;