import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- 1. CONFIGURATION (Self-Contained) ---
const LOCAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBphZ89XRmnJTt2b58n42cR50OuRV7NLms",
  authDomain: "repairprodatabase.firebaseapp.com",
  projectId: "repairprodatabase",
  storageBucket: "repairprodatabase.firebasestorage.app",
  messagingSenderId: "139649930430",
  appId: "1:139649930430:web:e41aeb3a7c37ffac61baef",
};

// Initialize Firebase for this component
const app = initializeApp(LOCAL_FIREBASE_CONFIG);
const db = getFirestore(app);
const APP_ID_KEY = LOCAL_FIREBASE_CONFIG.projectId;

// --- 2. TYPES ---
export interface FooterData {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string; // ✅ Added TikTok
  businessHours: string;
}

const DEFAULT_FOOTER_DATA: FooterData = {
  companyName: "RepairPro",
  contactEmail: "help@repairpro.com",
  contactPhone: "(555) 123-4567",
  address: "123 Tech Street, Silicon Valley",
  instagramUrl: "https://instagram.com/",
  facebookUrl: "https://facebook.com/",
  tiktokUrl: "https://tiktok.com/", // ✅ Added Default
  businessHours: "Mon-Fri: 9am - 6pm",
};

// --- 3. COMPONENT ---
const AdminFooter = () => {
  const [footerData, setFooterData] = useState<FooterData>(DEFAULT_FOOTER_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // DB Path: artifacts/{APP_ID}/public/data/footer-data/main
  const footerDocRef = doc(db, "artifacts", APP_ID_KEY, "public", "data", "footer-data", "main");

  // Load Data
  useEffect(() => {
    const unsubscribe = onSnapshot(footerDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FooterData;
        // Ensure tiktokUrl exists in state even if old data didn't have it
        setFooterData({ ...DEFAULT_FOOTER_DATA, ...data });
      } else {
        setDoc(footerDocRef, DEFAULT_FOOTER_DATA);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save Data
  const saveFooter = async () => {
    setIsSaving(true);
    try {
      await setDoc(footerDocRef, footerData);
      setStatusMsg("Footer updated live!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (error) {
      console.error(error);
      setStatusMsg("Error saving footer.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof FooterData, value: string) => {
    setFooterData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full bg-white pt-28 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Edit Footer Content</h1>
          {statusMsg && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
              {statusMsg}
            </span>
          )}
        </div>

        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
          
          {/* Section 1: Business Info */}
          <div className="space-y-5">
            <h3 className="font-bold text-gray-900 border-b pb-2">Business Details</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                value={footerData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Hours</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                value={footerData.businessHours}
                onChange={(e) => handleChange("businessHours", e.target.value)}
              />
            </div>

            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
               <textarea
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-none"
                value={footerData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Contact & Socials */}
          <div className="space-y-5">
            <h3 className="font-bold text-gray-900 border-b pb-2">Contact & Socials</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                  value={footerData.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                  value={footerData.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                />
              </div>
            </div>

            {/* INSTAGRAM */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram Link</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                value={footerData.instagramUrl}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
              />
            </div>
            
            {/* FACEBOOK */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook Link</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                value={footerData.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
              />
            </div>

            {/* ✅ TIKTOK (New Field) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">TikTok Link</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                value={footerData.tiktokUrl}
                onChange={(e) => handleChange("tiktokUrl", e.target.value)}
              />
            </div>

          </div>
        </div>

        <button
          onClick={saveFooter}
          disabled={isSaving}
          className={`w-full mt-8 py-4 rounded-full font-bold text-lg text-white transition shadow-lg ${
            isSaving ? "bg-gray-400 cursor-wait" : "bg-black hover:bg-gray-800 hover:scale-[1.01]"
          }`}
        >
          {isSaving ? "Publishing Changes..." : "Save Footer Changes"}
        </button>

      </div>
    </div>
  );
};

export default AdminFooter;