// src/components/AdminNotification.tsx
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminNotification() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async () => {
    if (!message.trim()) {
      setError("⚠️ Message cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await addDoc(collection(db, "notifications"), {
        message,
        createdAt: serverTimestamp(),
        sender: "Admin",
      });

      setSuccess("✅ Notification sent successfully!");
      setMessage(""); // clear input
    } catch (err) {
      console.error("Error sending notification:", err);
      setError("❌ Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/10 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">📢 Send Notification</h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter notification message..."
        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        rows={4}
        disabled={loading}
      />

      <button
        onClick={sendNotification}
        disabled={loading}
        className={`mt-4 px-5 py-2 rounded-lg text-white font-medium transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Sending..." : "Send"}
      </button>

      {/* Feedback messages */}
      {success && <p className="mt-3 text-green-400">{success}</p>}
      {error && <p className="mt-3 text-red-400">{error}</p>}
    </div>
  );
}
