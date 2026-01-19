const features = [
    {
      title: "Premier Customer Service",
      desc: "Friendly support and transparent communication from start to finish.",
      icon: "💬",
    },
    {
      title: "Quick Turnaround",
      desc: "Most repairs completed within the same day with precision and care.",
      icon: "⚡",
    },
    {
      title: "Low Price Guarantee",
      desc: "Competitive pricing with no hidden fees — real value, real results.",
      icon: "💲",
    },
    {
      title: "Expert Technicians",
      desc: "Skilled professionals with years of hands-on repair experience.",
      icon: "🛠️",
    },
  ];
  
  const WhyUs = () => {
    return (
      <section id="whyus" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
            Why Our Customers Love Us
          </h2>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm transform transition duration-200 hover:scale-105 hover:shadow-lg"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default WhyUs;
  