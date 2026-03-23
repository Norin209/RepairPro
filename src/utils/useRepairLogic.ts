import { useEffect, useState, useCallback, useMemo } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

// ✅ Import from local file
import useBookingLogic from "./useBookingLogic"; 
import type { DeviceName, RepairData, Location } from "../types/repairTypes";
import type { DeviceItem } from "../UI/DeviceGrid";
import { auth, db } from "./firebase";

// Images & Icons
import IphoneImg from "../assets/Iphone.jpeg";
import AndroidImg from "../assets/Andriod.jpeg";
import TabletImg from "../assets/Tablet.jpeg";
import ComputerImg from "../assets/Computer.jpeg";
import WatchImg from "../assets/AppleWatch.jpeg";
import ConsoleImg from "../assets/Console.jpg";

import ScreenIcon from "../assets/Screen.png";
import BatteryIcon from "../assets/Battery.png";
import ChargingIcon from "../assets/Charge.png";
import BackGlassIcon from "../assets/Back.png";
import WaterIcon from "../assets/Water.png";
import CameraIcon from "../assets/Camera.png";
import SpeakerIcon from "../assets/Speaker.png";
import SoftwareIcon from "../assets/Software.png";

export const REPAIR_ISSUE_ICONS: Record<string, string> = {
  "Screen Replacement": ScreenIcon,
  "Battery Replacement": BatteryIcon,
  "Charging Port": ChargingIcon,
  "Back Glass": BackGlassIcon,
  "Water Damage": WaterIcon,
  "Camera Repair": CameraIcon,
  "Speaker Issue": SpeakerIcon,
  "Software Problem": SoftwareIcon,
  default: ScreenIcon,
};

const firebaseConfig = { projectId: "repairprodatabase" };
declare const __app_id: string | undefined;
const appId = typeof __app_id !== "undefined" ? __app_id : firebaseConfig.projectId;

export const STEPS = [
  "Device", "Model", "Issue", "Location", "Details", "Quote", "Booking", "Success", 
];

interface PromoCode {
  code: string;
  label: string;
  value: number;
  type: "percent" | "fixed";
}

const useRepairLogic = () => {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [repairData, setRepairData] = useState<RepairData | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAuthCompleted, setIsAuthCompleted] = useState(false);

  const initialStep = new URLSearchParams(window.location.search).get("step");
  const [step, setStep] = useState(initialStep ? parseInt(initialStep) : 1);

  const [selectedDevice, setSelectedDevice] = useState<DeviceName | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerMessage, setCustomerMessage] = useState(""); 
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);
  
  // 🛑 ANTI-SPAM LOCK
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  
  const [discountCode, setDiscountCode] = useState("");
  const [selectedLocationTemp, setSelectedLocationTemp] = useState<Location | null>(null);
  const [activeMapCenter, setActiveMapCenter] = useState<[number, number] | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);

  // --- PRICE CALCULATION ---
  const basePrice = useMemo(() => {
    if (!selectedDevice || !selectedModel || !selectedIssue || !repairData) return null;
    const raw = repairData.pricing?.[selectedDevice]?.[selectedModel]?.[selectedIssue];
    return raw ? Number(raw) : null;
  }, [selectedDevice, selectedModel, selectedIssue, repairData]);

  const appliedPromo = useMemo(() => {
    if (!discountCode) return null;
    const found = promos.find(p => p.code === discountCode.toUpperCase().trim());
    return found || null;
  }, [discountCode, promos]);

  const quotePrice = useMemo(() => {
    if (basePrice === null) return null;
    if (!appliedPromo) return basePrice;
    if (appliedPromo.type === "fixed") {
      return Math.max(0, basePrice - appliedPromo.value);
    } else {
      return Math.max(0, basePrice * (1 - appliedPromo.value / 100));
    }
  }, [basePrice, appliedPromo]);

  // --- PASSING DATA TO BOOKING HOOK ---
  const bookingData = useMemo(() => ({
    device: selectedDevice || undefined,
    model: selectedModel || undefined,
    issue: selectedIssue || undefined,
    locationName: selectedLocation?.name,
    locationAddress: selectedLocation?.address,
    email: customerEmail,
    phone: customerPhone,
    price: quotePrice,
    createdAt: new Date().toISOString(),
  }), [selectedDevice, selectedModel, selectedIssue, selectedLocation, customerEmail, customerPhone, quotePrice]);

  const booking = useBookingLogic(selectedLocation?.id || "", bookingData);

  const {
    selectedDate, setSelectedDate, selectedTime, setSelectedTime,
    availableTimeSlots, isTimeLoading, loadingError,
    onConfirmBooking: handleBookingApiConfirm,
    getFullDateString
  } = booking;

  const navigateStep = useCallback((newStep: number) => {
      if (newStep < 1) return;
      const url = new URL(window.location.href);
      url.searchParams.set("step", newStep.toString());
      window.history.pushState({ step: newStep }, "", url.search);
      setStep(newStep);

      if (newStep < 2) setSelectedDevice(null);
      if (newStep < 3) setSelectedModel(null);
      if (newStep < 4) setSelectedIssue(null);
      if (newStep < 5) setSelectedLocation(null);
      if (newStep < 6) setIsLeadSubmitted(false);
      if (newStep < 7) { setSelectedDate(null); setSelectedTime(null); }
  }, [setSelectedDate, setSelectedTime]);

  useEffect(() => {
    if (!auth) { setIsDataLoading(false); return; }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).then(() => setIsAuthCompleted(true)).catch(() => setIsAuthCompleted(true));
      } else { setIsAuthCompleted(true); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAuthCompleted || !db || !appId) return;

    const repairDoc = doc(db, "artifacts", appId, "public", "data", "repair-data", "main");
    const unsubRepair = onSnapshot(repairDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as RepairData;
        setRepairData(data);
        if (devices.length === 0) {
          setDevices([
            { name: "iPhone", image: IphoneImg }, { name: "Android", image: AndroidImg },
            { name: "Tablet / iPad", image: TabletImg }, { name: "Computer", image: ComputerImg },
            { name: "Smart Watch", image: WatchImg }, { name: "Game Console", image: ConsoleImg },
          ]);
        }
      }
      setIsDataLoading(false);
    });

    const locDoc = doc(db, "artifacts", appId, "public", "data", "locations-data", "main");
    const unsubLoc = onSnapshot(locDoc, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.data()) as Location[];
        list.sort((a, b) => (a.order || 99) - (b.order || 99));
        setLocations(list);
        if (list.length > 0 && !activeMapCenter) setActiveMapCenter([list[0].lat, list[0].lng]);
      }
    });

    const promoDoc = doc(db, "artifacts", appId, "public", "data", "promos-data", "main");
    const unsubPromo = onSnapshot(promoDoc, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.data()) as PromoCode[];
        setPromos(list);
      }
    });

    return () => { unsubRepair(); unsubLoc(); unsubPromo(); };
  }, [isAuthCompleted, devices.length, activeMapCenter]);

  const isPromoInvalid = useMemo(() => {
    if (!discountCode) return false;
    return appliedPromo === null;
  }, [discountCode, appliedPromo]);

  // ✅ FIXED: Now properly maps 'type' to "REPAIR" or "BOOKING" so the PHP script understands it.
  const sendLeadToTelegram = useCallback(async (type: "REPAIR" | "BOOKING") => {
      if (!selectedDevice || !selectedModel || !selectedIssue || !selectedLocation) return;
      
      const fullDate = selectedDate ? getFullDateString(selectedDate) : "N/A";
      const promoInfo = appliedPromo 
        ? `${appliedPromo.code} (-${appliedPromo.type === 'fixed' ? '$'+appliedPromo.value : appliedPromo.value+'%'})` 
        : "NONE";

      const payload = {
        type: type, // 👈 Tells PHP if this is a lead or a final booking
        device: selectedDevice,
        model: selectedModel,
        issue: selectedIssue,
        quotePrice: quotePrice,          
        store: selectedLocation.name,    
        storeAddress: selectedLocation.address,
        email: customerEmail,
        phone: customerPhone,
        message: customerMessage, 
        date: fullDate,
        time: selectedTime || "N/A",
        discountCode: promoInfo,
        couponApplied: appliedPromo !== null
      };

      try {
        await fetch("https://repairpro.com.au/repair_api/sendToTelegram.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Telegram notification failed:", err);
      }
    }, [
      selectedDevice, selectedModel, selectedIssue, selectedLocation, 
      selectedDate, selectedTime, customerEmail, customerPhone, customerMessage,
      quotePrice, appliedPromo, getFullDateString
    ]);

  const handleLeadSubmitInitial = useCallback(async () => {
    if (!db || !selectedLocation || !selectedDevice || !selectedModel || !selectedIssue || !customerEmail || customerPhone.length < 8) return;
    if (isPromoInvalid) return; 
    
    // 🛑 ANTI-SPAM: Prevent double firing
    if (isSubmittingLead) return;
    setIsSubmittingLead(true);

    const newLeadId = leadId || `lead-${Date.now()}`;
    const payload = {
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(), 
      device: selectedDevice, model: selectedModel, issue: selectedIssue,
      store: selectedLocation.name, storeAddress: selectedLocation.address,
      email: customerEmail, phone: customerPhone, message: customerMessage, 
      quotePrice, discountCode: appliedPromo ? appliedPromo.code : "",
      status: "LEAD_ONLY",
    };

    try {
      const userId = auth?.currentUser?.uid || "anonymous";
      await setDoc(doc(db, "artifacts", appId, "users", userId, "leads", newLeadId), payload);
      setLeadId(newLeadId);
      setIsLeadSubmitted(true);
      
      // Send as a standard Lead first
      await sendLeadToTelegram("REPAIR"); 
      
      navigateStep(6);
    } catch (err) { 
        console.error("Lead save failed:", err); 
    } finally {
        setIsSubmittingLead(false); // Release the lock
    }
  }, [db, selectedLocation, selectedDevice, selectedModel, selectedIssue, customerEmail, customerPhone, customerMessage, appliedPromo, isPromoInvalid, leadId, quotePrice, sendLeadToTelegram, navigateStep, isSubmittingLead]);

  const handleBookingConfirm = useCallback(async () => {
    if (!selectedLocation || !selectedDevice || !selectedModel || !selectedIssue || selectedDate === null || !selectedTime) return;
    
    try {
      await handleBookingApiConfirm(); 
      
      // ✅ NEW: Send the final confirmed booking alert to Telegram
      await sendLeadToTelegram("BOOKING");
      
      navigateStep(8);
      window.scrollTo(0, 0);
    } catch (err) { 
        console.error("Booking save failed:", err); 
    }
  }, [selectedLocation, selectedDevice, selectedModel, selectedIssue, selectedDate, selectedTime, customerEmail, customerPhone, customerMessage, quotePrice, appliedPromo, getFullDateString, handleBookingApiConfirm, sendLeadToTelegram, navigateStep]);

  const handleLocationPreview = useCallback((loc: Location) => {
    setSelectedLocationTemp(loc);
    const isMobile = window.innerWidth < 768;
    const offset = isMobile ? 0 : 0.1;
    setActiveMapCenter([loc.lat, loc.lng + offset]);
  }, []);

  const handleLocationConfirm = useCallback((loc: Location) => {
    setSelectedLocation(loc);
    setSelectedLocationTemp(null);
    navigateStep(5);
  }, [navigateStep]);

  return {
    isFirebaseReady: !!db, isDataLoading, repairData, devices, locations, STEPS,
    quotePrice,
    step, navigateStep, REPAIR_ISSUE_ICONS,
    selectedDevice, selectedModel, selectedIssue, selectedLocation, selectedLocationTemp, activeMapCenter,
    selectedDate, setSelectedDate, selectedTime, setSelectedTime, availableTimeSlots, isTimeLoading, loadingError,
    customerEmail, customerPhone, customerMessage, isLeadSubmitted, 
    discountCode, setDiscountCode,
    isPromoInvalid, appliedPromo,
    setSelectedDevice, setSelectedModel, setSelectedIssue, setCustomerEmail, setCustomerPhone, setCustomerMessage, 
    handleLeadSubmitInitial, handleLocationPreview, handleLocationConfirm, handleBookingConfirm,
  };
};

export type { DeviceName, Location, DeviceItem };
export default useRepairLogic;