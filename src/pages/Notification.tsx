// src/pages/Notifications.tsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";

interface Notification {
  id: string;
  title: string;
  message?: string;
  readBy?: string[];
  createdAt?: any;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return (
      <div className="p-6 text-white">
        <p>Please log in to see notifications.</p>
      </div>
    );
  }

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Notification, "id">),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        readBy: arrayUnion(currentUser.uid),
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🔔 Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const isRead = n.readBy?.includes(currentUser.uid);
            return (
              <li
                key={n.id}
                className={`border-b py-2 flex justify-between items-center ${
                  isRead ? "text-gray-400" : "text-white"
                }`}
              >
                <div>
                  <p className="font-semibold">{n.title}</p>
                  {n.message && <p className="text-sm">{n.message}</p>}
                </div>
                {!isRead && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
