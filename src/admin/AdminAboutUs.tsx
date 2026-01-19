import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
// ✅ Import from your central file
import { db } from "../utils/firebase";

type AboutUsData = {
  title: string;
  description: string;
};

const DEFAULT_DATA: AboutUsData = {
  title: "Why Our Customers Love Us",
  description: "We are dedicated to providing the best repair services in Melbourne.",
};

const AdminAboutUs = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<AboutUsData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");

  // 🔒 SECURITY CHECK
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) {
      navigate("/admin-portal-9831");
    }
  }, [navigate]);

  // Firestore location
  const ABOUT_DOC_REF = doc(db, "pageContent", "aboutUs");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDoc(ABOUT_DOC_REF);
        if (snap.exists()) {
          setData({ ...DEFAULT_DATA, ...snap.data() as Partial<AboutUsData> });
        } else {
          setData(DEFAULT_DATA);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setStatus("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (key: keyof AboutUsData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await setDoc(ABOUT_DOC_REF, data, { merge: true });
      setStatus("Saved successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
      setStatus("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-28 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-white px-6 pt-28 pb-12">
      <div className="max-w-3xl mx-auto">
        
        {/* ✅ BACK BUTTON */}
        <button
          onClick={() => navigate("/admin-panel")}
          className="mb-6 px-4 py-2 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-100 transition inline-flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2">Edit "About Us" Section</h1>
        <p className="text-gray-500 mb-8">Update the main title and the description paragraph. The 4 icon cards are static.</p>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Main Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Main Heading</label>
            <input
              value={data.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
              placeholder='e.g. "Why Our Customers Love Us"'
            />
          </div>

          {/* Description Paragraph */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description Paragraph</label>
            <textarea
              value={data.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="This text appears below the heading and above the cards."
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {status && <span className="text-green-600 font-medium">{status}</span>}
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminAboutUs;