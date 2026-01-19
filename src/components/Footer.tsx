import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// --- 1. FIREBASE CONFIG ---
const LOCAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBphZ89XRmnJTt2b58n42cR50OuRV7NLms",
  authDomain: "repairprodatabase.firebaseapp.com",
  projectId: "repairprodatabase",
  storageBucket: "repairprodatabase.firebasestorage.app",
  messagingSenderId: "139649930430",
  appId: "1:139649930430:web:e41aeb3a7c37ffac61baef",
};

const app = initializeApp(LOCAL_FIREBASE_CONFIG);
const db = getFirestore(app);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // --- 2. STATE ---
  const [data, setData] = useState({
    companyName: "RepairPro",
    phone: "+61 426 09 00 99",
    email: "hello@repairpro.com",
    address: "Melbourne, Australia",
    facebook: "#",
    instagram: "#",
    tiktok: "#",
    disclaimer: "Independent service. Not affiliated with Apple, Samsung, or any other brands."
  });

  // --- 3. REAL-TIME LISTENER ---
  useEffect(() => {
    const docRef = doc(db, "artifacts", "repairprodatabase", "public", "data", "footer-data", "main");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        setData((prev) => ({
          ...prev,
          companyName: cloudData.companyName || prev.companyName,
          phone: cloudData.contactPhone || prev.phone,
          email: cloudData.contactEmail || prev.email,
          address: cloudData.address || prev.address,
          facebook: cloudData.facebookUrl || prev.facebook,
          instagram: cloudData.instagramUrl || prev.instagram,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* --- Column 1: Brand & Socials --- */}
        <div>
          <Link to="/home" className="block">
            <h3 className="text-2xl font-bold text-black mb-2 hover:text-blue-600 transition-colors">
              {data.companyName}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mb-6">
            Fast and reliable device repairs from certified technicians.
          </p>

          <div className="flex space-x-5">
            {data.facebook && data.facebook !== "#" && (
              <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors text-xl"><i className="bi bi-facebook"></i></a>
            )}
            {data.instagram && data.instagram !== "#" && (
              <a href={data.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors text-xl"><i className="bi bi-instagram"></i></a>
            )}
            <a href={data.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors text-xl"><i className="bi bi-tiktok"></i></a>
          </div>
        </div>

        {/* --- Column 2: Quick Links (UPDATED) --- */}
        <div>
          <h4 className="text-lg font-semibold text-black mb-4">Quick Links</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link to="/home" className="hover:text-black transition-colors">Home</Link></li>
            <li><Link to="/booking" className="hover:text-black transition-colors">Booking</Link></li>
            <li><Link to="/buy-back" className="hover:text-black transition-colors">Buy Back</Link></li>
            <li><Link to="/shop" className="hover:text-black transition-colors">Shop</Link></li>
            <li><Link to="/location" className="hover:text-black transition-colors">Location</Link></li>
            <li><Link to="/about" className="hover:text-black transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* --- Column 3: Contact Us --- */}
        <div>
          <h4 className="text-lg font-semibold text-black mb-4">Contact Us</h4>
          <div className="space-y-3 text-gray-600 text-sm">
            <p className="whitespace-pre-line">{data.address}</p>
            <p><span className="font-medium text-black">Phone:</span> {data.phone}</p>
            <p><span className="font-medium text-black">Email:</span> {data.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
        <p className="font-semibold text-gray-800 text-sm">
          © {currentYear} {data.companyName}. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-2 max-w-lg mx-auto">
          {data.disclaimer}
        </p>
      </div>
    </footer>
  );
};

export default Footer;