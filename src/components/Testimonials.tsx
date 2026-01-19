import React, { useState, useEffect } from 'react';

// --- Type Definition ---
interface Testimonial {
  name: string;
  review: string;
  img: string; // Google Profile Picture URL
  rating: number; 
}

// --- Fallback Data ---
const staticFallbackTestimonials: Testimonial[] = [
    {
      name: "Sarah W. (Default)",
      review: "Amazing service! My iPhone was fixed in less than an hour. Super friendly staff.",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
    {
      name: "Jason K. (Default)",
      review: "Best repair experience ever. Transparent pricing and quick turnaround!",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
    },
    {
      name: "Alicia G. (Default)",
      review: "I sold my old phone here and got the highest offer compared to other stores.",
      img: "https://randomuser.me/api/portraits/women/65.jpg",
      rating: 4,
    },
];

const Testimonials: React.FC = () => {
    const [realTimeTestimonials, setRealTimeTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGoogleReviews = async () => {
            try {
                // 🚀 CALLS YOUR NEW SECURE SERVERLESS FUNCTION
                const response = await fetch('/api/reviews'); 
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch reviews. Status: ${response.status}`);
                }
                
                const data = await response.json();
                
                setRealTimeTestimonials(data.reviews || []);
                setError(null);

            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Could not load real-time Google reviews. Displaying default reviews.");
                setRealTimeTestimonials(staticFallbackTestimonials); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchGoogleReviews();
    }, []); 

    // --- UI (JSX) remains the same ---
    if (isLoading) {
        return (
          <section id="testimonials" className="py-16 bg-gray-50 text-center">
               <p className="text-xl text-gray-700">Loading real-time Google reviews...</p>
          </section>
        );
    }
    
    return (
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
  
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
            What Our Customers Say
          </h2>

          {error && (<p className="text-red-500 text-center mb-6">{error}</p>)}
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {realTimeTestimonials.map((t, index) => (
              <div
                key={index} 
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 text-center transform transition duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                <img
                  src={t.img} 
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  alt={`Reviewer ${t.name}`}
                />
                
                <div className="mb-2 text-yellow-500 text-2xl">
                    {'★'.repeat(t.rating)}
                    {'☆'.repeat(5 - t.rating)}
                </div>
                
                <p className="text-gray-600 italic mb-4">"{t.review}"</p>
                <h3 className="text-lg font-semibold text-black">{t.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
};
  
export default Testimonials;