// src/components/NotificationFeed.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";

interface Notification {
  id: string;
  message: string;
  sender: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export default function NotificationFeed() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ✅ Check if current user is admin
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setIsAdmin(snap.data().role === "admin");
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };

    fetchRole();
  }, [user]);

  // ✅ Live notifications for non-admin users
  useEffect(() => {
    if (!user || isAdmin) return; // Admins don’t need to see feed

    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Notification[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() } as Notification)
      );
      setNotifications(list);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  if (isAdmin || !user) return null; // Hide for admins or logged-out users

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-xl p-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-2">🔔 Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="p-2 border rounded-md bg-gray-100">
              <p className="text-sm">{n.message}</p>
              <span className="text-xs text-gray-500">
                {n.sender} •{" "}
                {n.createdAt?.seconds
                  ? new Date(n.createdAt.seconds * 1000).toLocaleTimeString()
                  : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
