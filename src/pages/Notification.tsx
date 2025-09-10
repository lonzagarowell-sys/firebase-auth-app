// src/pages/Notifications.tsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";

interface Notification {
  id: string;
  title: string;
  message?: string;
  readBy?: string[];
  createdAt?: any;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Handle auth (anonymous if needed)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          const anonUser = await signInAnonymously(auth);
          setUser(anonUser.user);
        } catch (err) {
          console.error("Anonymous sign-in failed:", err);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch notifications once user is ready
  useEffect(() => {
    if (!user || loading) return;

    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Notification, "id">),
        }))
      );
    });

    return () => unsubscribe();
  }, [user, loading]);

  if (loading) {
    return <p className="text-white p-4">Loading notifications...</p>;
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🔔 Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="border-b py-2">
              {n.title && <p className="font-semibold">{n.title}</p>}
              {n.message && <p>{n.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
