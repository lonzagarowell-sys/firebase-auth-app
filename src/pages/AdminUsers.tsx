// src/pages/AdminUsers.tsx
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Real-time Firestore listener for "users" collection
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👤 Admin User Management</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="p-4 border rounded-lg shadow bg-white hover:shadow-md transition"
            >
              <p className="font-semibold">{u.displayName || "Unnamed User"}</p>
              <p className="text-gray-600">{u.email}</p>
              <p className="text-sm text-gray-400">UID: {u.id}</p>

              {u.role && (
                <p className="text-xs font-medium mt-1">
                  Role: <span className="text-indigo-600">{u.role}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
