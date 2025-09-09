import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<DocumentData[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-white/10 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-white mb-3">Notifications 🔔</h2>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n.id}
            className="p-3 bg-white/20 rounded-lg shadow-sm text-white"
          >
            <p>{n.message}</p>
            <span className="text-xs opacity-70">
              {n.sender || "System"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
