import { Link } from "react-router-dom";

const calls = [
  {
    id: "buy",
    title: "Buy Certified Pre-Owned Devices",
    desc: "Get high-quality refurbished devices backed by warranty and tested by experts.",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=60",
    // ✅ CHANGED: Points to real URL (App.tsx handles the redirect if disabled)
    link: "/shop", 
  },
  {
    id: "sell",
    title: "Sell Your Used or Broken Device",
    desc: "Instant quotes and same-day payouts. Trade in your old tech for cash.",
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=60",
    // ✅ CHANGED: Points to real URL
    link: "/buy-back",
  },
];

const SecondaryCalls = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">

        {calls.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className="block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transform transition duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-56 object-cover"
            />

            <div className="p-6">
              <h3 className="text-2xl font-bold text-black mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>

              <div className="mt-4 text-blue-600 font-semibold hover:underline">
                Learn More →
              </div>
            </div>
          </Link>
        ))}

      </div>
    </section>
  );
};

export default SecondaryCalls;