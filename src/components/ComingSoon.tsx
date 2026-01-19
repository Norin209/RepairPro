import { useNavigate } from "react-router-dom";

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-white text-black px-4 pt-28">
      <div className="text-center max-w-md">

        <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>

        <p className="text-gray-600 text-lg mb-8">
          This feature is currently under development.  
          We're working hard to bring it to you soon!
        </p>

        {/* ✅ UPDATED: Uses React Router for smoother navigation to /home */}
        <button
          onClick={() => navigate("/home")}
          className="px-8 py-3 rounded-full border border-black text-black font-semibold hover:bg-black hover:text-white transition"
        >
          Back to Home
        </button>
      </div>
    </section>
  );
};

export default ComingSoon;