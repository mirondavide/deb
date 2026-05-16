import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const WAITLIST_COLLECTION = "waitlist";
const COUNTER_DOC = "waitlist/__counter__";

export const joinWaitlist = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { email, linkedin, price, role } = req.body;

    if (!email || !price || !role) {
      res.status(400).json({ error: "Email, price preference, and role are required" });
      return;
    }

    const emailNormalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalized)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    try {
      // Check for duplicate email
      const existing = await db
        .collection(WAITLIST_COLLECTION)
        .where("email", "==", emailNormalized)
        .limit(1)
        .get();

      if (!existing.empty) {
        res.status(409).json({ error: "This email is already on the waitlist" });
        return;
      }

      // Atomically increment counter and get position
      const counterRef = db.doc(COUNTER_DOC);
      const position = await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        let newCount: number;
        if (!counterDoc.exists) {
          newCount = 1;
          transaction.set(counterRef, { count: 1 });
        } else {
          newCount = (counterDoc.data()?.count || 0) + 1;
          transaction.update(counterRef, { count: FieldValue.increment(1) });
        }

        // Add the waitlist entry
        const entryRef = db.collection(WAITLIST_COLLECTION).doc();
        transaction.set(entryRef, {
          email: emailNormalized,
          linkedin: linkedin?.trim() || null,
          price,
          role,
          position: newCount,
          createdAt: FieldValue.serverTimestamp(),
        });

        return newCount;
      });

      res.status(201).json({
        message: "Successfully joined the waitlist",
        position,
      });
    } catch (error) {
      console.error("Error joining waitlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
