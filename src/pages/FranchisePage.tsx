import { Link } from "react-router-dom";

const FranchisePage = () => {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl">
        
        {/* Cleaner Back Button with Arrow */}
        <Link 
          to="/" 
          className="text-gray-500 hover:text-gray-900 font-medium mb-10 inline-flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Main Content Area (No borders or floating cards) */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          Franchise Opportunities
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 leading-relaxed">
          Join the RepairPro family and build your own successful business in the booming device repair industry. We provide the blueprint, you provide the drive.
        </p>

        {/* Modernized List Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Franchise With Us?</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              "Proven, highly profitable business model",
              "Comprehensive initial training and ongoing support",
              "Established global supply chain for premium parts",
              "National marketing campaigns driving local traffic"
            ].map((item, index) => (
              <div key={index} className="flex items-start">
                <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Soft CTA Section to anchor the bottom of the page */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to take the next step?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Fill out our standard contact form and mention "Franchising" in your message, or email our franchise development team directly.
          </p>
          <Link
            to="/contact?subject=franchising"
            className="inline-flex justify-center items-center bg-red-600 text-white font-semibold px-8 py-3.5 rounded-full shadow-sm hover:bg-red-700 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            Apply for a Franchise
          </Link>
        </div>

      </div>
    </div>
  );
};

export default FranchisePage;