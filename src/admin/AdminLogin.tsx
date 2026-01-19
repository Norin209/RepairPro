import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { auth } from "../utils/firebase"; // Ensure this path points to your firebase.ts

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload if you wrap inputs in a <form>
    setError("");
    setLoading(true);

    try {
      // 🔒 SECURE CHECK:
      // This sends the email/pass to Firebase. If wrong, it throws an error.
      await signInWithEmailAndPassword(auth, email, pass);

      // If we get here, the password was correct!
      // We set the local storage so your Protected Routes let you in.
      localStorage.setItem("adminAuth", "true");
      
      navigate("/admin-panel"); // Adjust this if your dashboard link is different
    } catch (err) {
      console.error("Login failed:", err);
      setError("Incorrect login details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white px-4 pt-32 pb-20 flex justify-center">
      <div className="max-w-sm w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Added <form> wrapper so "Enter" key submits the form */}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="w-full border p-2.5 rounded mb-4"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            className="w-full border p-2.5 rounded mb-6"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black text-white py-2.5 rounded-full font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
            }`}
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLogin;