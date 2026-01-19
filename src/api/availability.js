// --- File: api/availability.js ---

const admin = require("firebase-admin");

const MAX_CAPACITY = 2;
const ALL_TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

// 🔐 Firebase Admin init (keep your existing config if you already had one)
if (!admin.apps.length) {
  // If you're using a service account via env:
  // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  // If you're using default credentials:
  admin.initializeApp();
}

const db = admin.firestore();

// Helper: path to a slot doc for a store/date/time
function getSlotRef(locationId, dateStr, timeStr) {
  return db
    .collection("availability")
    .doc(locationId)
    .collection("dates")
    .doc(dateStr)
    .collection("slots")
    .doc(timeStr);
}

module.exports = async (req, res) => {
  // Allow CORS if needed (optional)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { locationId, date, time } = req.method === "GET" ? req.query : req.body;

  if (!locationId) {
    return res.status(400).json({ message: "Missing locationId" });
  }

  // ───────────────────── GET: fetch availability ─────────────────────
  if (req.method === "GET") {
    if (!date) {
      return res.status(400).json({ message: "Missing date (YYYY-MM-DD)" });
    }

    try {
      // Pull all slot docs for this date
      const slotsCollection = db
        .collection("availability")
        .doc(locationId)
        .collection("dates")
        .doc(date)
        .collection("slots");

      const snapshot = await slotsCollection.get();

      const existing = {};
      snapshot.forEach((doc) => {
        existing[doc.id] = doc.data().count || 0;
      });

      // Build full list of slots, even if no docs exist yet
      const slots = ALL_TIME_SLOTS.map((slotTime) => {
        const count = existing[slotTime] || 0;
        return {
          time: slotTime,
          isAvailable: count < MAX_CAPACITY,
          count,
        };
      });

      // Always return 200, even if empty (front-end will handle)
      return res.status(200).json({ slots });
    } catch (err) {
      console.error("Availability GET error:", err);
      return res
        .status(500)
        .json({ message: "Could not load availability. Please try again." });
    }
  }

  // ───────────────────── POST: create a booking (increment count) ─────────────────────
  if (req.method === "POST") {
    if (!date || !time) {
      return res
        .status(400)
        .json({ message: "Missing date or time in body." });
    }

    try {
      const slotRef = getSlotRef(locationId, date, time);

      await db.runTransaction(async (tx) => {
        const snap = await tx.get(slotRef);
        const currentCount = snap.exists ? snap.data().count || 0 : 0;

        if (currentCount >= MAX_CAPACITY) {
          throw new Error("SLOT_FULL");
        }

        tx.set(
          slotRef,
          {
            count: currentCount + 1,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      });

      return res.status(200).json({ ok: true, message: "Booking confirmed." });
    } catch (err) {
      console.error("Availability POST error:", err);

      if (err.message === "SLOT_FULL") {
        return res
          .status(409)
          .json({ message: "This time slot is already full." });
      }

      return res
        .status(500)
        .json({ message: "Could not save booking. Please try again." });
    }
  }

  // ───────────────────── Unsupported method ─────────────────────
  return res.status(405).send("Method Not Allowed");
};
