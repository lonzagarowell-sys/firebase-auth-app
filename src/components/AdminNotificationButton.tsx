import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function AdminNotificationButton() {
  const { user, role } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  if (role !== "admin") return null; // hide from non-admins

  const handleSend = async () => {
    if (!message.trim()) return;
    await addDoc(collection(db, "notifications"), {
      message,
      sender: user?.uid,
      createdAt: serverTimestamp(),
      readBy: [],
    });
    setMessage("");
    setShowForm(false);
  };

  return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)}>Send Notification</button>
      ) : (
        <div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={handleSend}>Send</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
