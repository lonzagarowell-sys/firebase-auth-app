import { useEffect, useState, type FormEvent } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";

interface Notification {
  id: string;
  title?: string;
  message?: string;
  createdAt?: any;
}

export default function Notifications() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Handle authentication with ID token refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Refresh ID token to pick up custom claims
        await currentUser.getIdToken(true);
        setUser(currentUser);

        // Check if user is admin
        const tokenResult = await currentUser.getIdTokenResult();
        setIsAdmin(!!tokenResult.claims.admin);
      } else {
        try {
          const anonUser = await signInAnonymously(auth);
          setUser(anonUser.user);
          setIsAdmin(false);
        } catch (err) {
          console.error("Anonymous sign-in failed:", err);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch notifications in real-time
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

  // Send new notification (admin only)
  const sendNotification = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle && !newMessage) return;

    try {
      await addDoc(collection(db, "notifications"), {
        title: newTitle,
        message: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewTitle("");
      setNewMessage("");
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("You do not have permission to send notifications.");
    }
  };

  if (loading) return <p className="text-white p-4">Loading notifications...</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🔔 Notifications</h1>

      {/* Admin form */}
      {isAdmin && (
        <form onSubmit={sendNotification} className="mb-6 space-y-2">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border px-2 py-1 text-black rounded"
          />
          <input
            type="text"
            placeholder="Message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full border px-2 py-1 text-black rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 px-4 py-2 rounded text-white"
          >
            Send Notification
          </button>
        </form>
      )}

      {/* Notification list */}
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
