import { Link } from "react-router-dom";

const WorkOpportunitiesPage = () => {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl">
        
        <Link 
          to="/" 
          className="text-gray-500 hover:text-gray-900 font-medium mb-10 inline-flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          Certified Technician Training
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 leading-relaxed">
          Kickstart your career in tech. Our accredited training programs are designed to take you from a beginner to a master device repair technician.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 font-bold text-xl">1</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fundamentals</h3>
            <p className="text-gray-600 leading-relaxed">
              Learn the basics of device teardowns, screen replacements, and battery swaps for the most popular smartphone models.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 font-bold text-xl">2</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Micro-soldering</h3>
            <p className="text-gray-600 leading-relaxed">
              Master motherboard repairs, data recovery, and complex diagnostic troubleshooting for advanced repairs.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the Team</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            We are always looking for passionate individuals to join our repair centers. Apply for training or submit your resume if you are already certified.
          </p>
          <Link
            to="/contact?subject=training"
            className="inline-flex justify-center items-center bg-gray-900 text-white font-semibold px-8 py-3.5 rounded-full shadow-sm hover:bg-black hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            Enroll in Courses
          </Link>
        </div>

      </div>
    </div>
  );
};

export default WorkOpportunitiesPage;