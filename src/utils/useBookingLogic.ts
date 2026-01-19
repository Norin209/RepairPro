import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase"; 
import {
  collection,
  doc,
  getDocs,
  runTransaction,
  setDoc,
} from "firebase/firestore";

// ============================
// TYPES
// ============================
export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  count: number;
}

const MAX_CAPACITY = 10;

// ============================
// MAIN HOOK
// ============================
const useBookingLogic = (
  locationId: string,
  extraDetails?: {
    device?: string;
    model?: string;
    issue?: string;
    locationName?: string;
    locationAddress?: string;
    email?: string;
    phone?: string;
    price?: number | null;
  }
) => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeLoading, setIsTimeLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Helper: Format Date YYYY-MM-DD
  const getFullDateString = useCallback(
    (day: number): string => {
      const date = new Date(currentYear, currentMonth, day);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },
    [currentYear, currentMonth]
  );

  // ============================================
  // 1. DYNAMIC SLOT GENERATION (Store Hours)
  // ============================================
  const generateStoreSlots = useCallback((day: number) => {
    const bookingDate = new Date(currentYear, currentMonth, day);
    const dayOfWeek = bookingDate.getDay(); 
    const isToday = bookingDate.toDateString() === new Date().toDateString();
    
    // Check if store is Melbourne
    const isMelbourne = locationId === "melbourne-central" || extraDetails?.locationName?.includes("Melbourne");

    let closingHour = 17; // Default 5:00 PM
    
    if (isMelbourne) {
      if (dayOfWeek === 4 || dayOfWeek === 5) {
        closingHour = 21; // Thu/Fri close 9:00 PM
      } else {
        closingHour = 19; // Mon-Wed, Sat-Sun close 7:00 PM
      }
    } else {
      closingHour = 17; // Other stores close 5:00 PM
    }

    const slots: string[] = [];
    for (let h = 9; h <= closingHour; h++) {
      const displayHour = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      slots.push(`${displayHour}:00 ${ampm}`);
    }

    if (isToday) {
      const currentHour = new Date().getHours();
      return slots.filter(timeStr => {
        const [time, ampm] = timeStr.split(" ");
        let hour = parseInt(time.split(":")[0]);
        if (ampm === "PM" && hour !== 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        return hour > currentHour;
      });
    }

    return slots;
  }, [locationId, currentYear, currentMonth, extraDetails?.locationName]);

  // ============================================
  // 2. FETCH AVAILABILITY
  // ============================================
  const fetchSlots = useCallback(
    async (day: number) => {
      if (!locationId || !db) return;

      setIsTimeLoading(true);
      setLoadingError(null);
      setAvailableTimeSlots([]);
      setSelectedTime(null);

      const dateStr = getFullDateString(day);
      const dynamicSlotsList = generateStoreSlots(day);

      try {
        const slotsCol = collection(db, "availability", locationId, "dates", dateStr, "slots");
        const snap = await getDocs(slotsCol);

        const existing: Record<string, number> = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data() as { count?: number };
          existing[docSnap.id] = data.count ?? 0;
        });

        const merged: TimeSlot[] = dynamicSlotsList.map((time) => {
          const count = existing[time] ?? 0;
          return {
            time,
            count,
            isAvailable: count < MAX_CAPACITY,
          };
        });

        setAvailableTimeSlots(merged);
      } catch (err) {
        console.error("Failed to load time slots:", err);
        setLoadingError("Could not load times. Please try again.");
      } finally {
        setIsTimeLoading(false);
      }
    },
    [locationId, getFullDateString, generateStoreSlots]
  );

  useEffect(() => {
    if (!locationId || selectedDate === null) return;
    fetchSlots(selectedDate);
  }, [locationId, selectedDate, fetchSlots]);

  // ============================================
  // 3. CONFIRM BOOKING
  // ============================================
  const onConfirmBooking = useCallback(async () => {
    if (!db || !locationId || selectedDate === null || !selectedTime) {
      return console.error("Missing booking fields");
    }

    const dateStr = getFullDateString(selectedDate);
    const slotRef = doc(db, "availability", locationId, "dates", dateStr, "slots", selectedTime);

    try {
      setIsTimeLoading(true);

      // --- A. Firebase Transaction ---
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(slotRef);
        const currentCount = snap.exists() ? snap.data()?.count || 0 : 0;
        if (currentCount >= MAX_CAPACITY) throw new Error("SLOT_FULL");
        tx.set(slotRef, { count: currentCount + 1, updatedAt: new Date().toISOString() }, { merge: true });
      });

      // --- B. Save Booking ---
      const bookingId = `booking-${Date.now()}`;
      
      const bookingData = {
        id: bookingId,
        locationId,
        date: dateStr,
        time: selectedTime,
        timestamp: new Date().toISOString(),
        
        // ✅ ADDED: This is the critical line to show "Submitted Time" in Admin Panel
        createdAt: new Date().toISOString(),

        // 🟢 Using props directly
        device: extraDetails?.device ?? null,
        model: extraDetails?.model ?? null,
        issue: extraDetails?.issue ?? null,
        store: extraDetails?.locationName ?? null,      
        storeAddress: extraDetails?.locationAddress ?? null, 
        email: extraDetails?.email ?? null,
        phone: extraDetails?.phone ?? null,
        quotePrice: extraDetails?.price ?? null,
        status: "Pending", // Good practice to have a default status
      };

      await setDoc(doc(db, "bookings", bookingId), bookingData);

      // --- C. TELEGRAM NOTIFICATION ---
      const telegramPayload = {
        device: bookingData.device || "",
        model: bookingData.model || "",
        issue: bookingData.issue || "",
        quotePrice: bookingData.quotePrice || "0", 
        store: bookingData.store || "",
        storeAddress: bookingData.storeAddress || "",
        date: bookingData.date,
        time: bookingData.time,
        email: bookingData.email || "",
        phone: bookingData.phone || "",
        message: "Booking via Website"
      };

      const API_URL = "https://repairpro.com.au/repair_api/sendToTelegram.php";

      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramPayload),
      })
      .then(res => {
        if(!res.ok) console.warn("Telegram Error:", res.statusText);
        else console.log("✅ Telegram Sent");
      })
      .catch(err => console.warn("Telegram Network Error:", err));
      
      // --- D. Refresh Slots ---
      await fetchSlots(selectedDate);

    } catch (err: any) {
      console.error("Booking Error:", err);
      if (err?.message === "SLOT_FULL") {
        setLoadingError("This time slot is already full.");
      } else {
        setLoadingError("Could not confirm booking. Please try again.");
      }
    } finally {
      setIsTimeLoading(false);
    }
  }, [db, locationId, selectedDate, selectedTime, extraDetails, getFullDateString, fetchSlots]);

  return {
    selectedDate, setSelectedDate,
    selectedTime, setSelectedTime,
    availableTimeSlots, isTimeLoading, loadingError,
    onConfirmBooking, getFullDateString,
  };
};

export default useBookingLogic;