import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase'; 

interface AboutContent {
  title: string;
  description: string;
}

const AboutUs = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Title and Description from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, "pageContent", "aboutUs");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContent(docSnap.data() as AboutContent);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // 2. Fallback Data 
  // If content.description is empty, we show a placeholder so you can see the layout
  const title = content?.title || "Why Our Customers Love Us";
  const description = content?.description; 

  // 3. HARDCODED CARDS (Static)
  const CARDS = [
    {
      icon: "💬",
      title: "Premier Customer Service",
      text: "Friendly support and transparent communication from start to finish."
    },
    {
      icon: "⚡",
      title: "Quick Turnaround",
      text: "Most repairs completed within the same day with precision and care."
    },
    {
      icon: "💲",
      title: "Low Price Guarantee",
      text: "Competitive pricing with no hidden fees — real value, real results."
    },
    {
      icon: "🛠️",
      title: "Expert Technicians",
      text: "Skilled professionals with years of hands-on repair experience."
    }
  ];

  if (loading) return <div className="text-center py-40 text-gray-400">Loading...</div>;

  return (
    // ✅ CHANGED pt-24 to pt-44 to push it down from the navbar
    <section className="w-full bg-white pt-44 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        
        {/* Dynamic Title */}
        <h1 className="text-4xl font-bold text-black mb-6">
          {title}
        </h1>

        {/* ✅ Dynamic Paragraph (Below Heading) */}
        {/* We use min-h to ensure space is reserved even if loading */}
        <div className="max-w-3xl mx-auto mb-16">
          {description ? (
            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
              {description}
            </p>
          ) : (
            // This placeholder shows ONLY if the database is empty so you know it works
            <p className="text-gray-400 italic">
              (No description added yet. Go to Admin Panel to add text here.)
            </p>
          )}
        </div>

        {/* Static Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map((card, index) => (
            <div key={index} className="border border-gray-200 shadow-sm rounded-xl p-8 bg-white hover:shadow-md transition-shadow">
              <div className="text-6xl mb-6">{card.icon}</div>
              <h3 className="text-lg font-bold text-black mb-3">{card.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutUs;