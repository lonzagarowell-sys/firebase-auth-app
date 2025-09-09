// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;

    // ✅ Track unread messages
    const q = query(
      collection(db, "messages"),
      where("uid", "!=", user.uid),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));

    // ✅ Check if user is admin
    const checkRole = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setIsAdmin(snap.data().role === "admin"); // ✅ only admins see Admin section
      }
    };
    checkRole();

    return () => unsub();
  }, [user]);

  // ✅ Buttons for normal users
  const buttons = [
    { to: "/events", label: "🗓️ Events" },
    { to: "/upload", label: "📤 Upload" },
    { to: "/files", label: "📂 Files" },
    { to: "/todo", label: "✅ Todo" },
    { to: "/chat", label: "💬 Chat", badge: unreadCount },
    { to: "/blog", label: "📝 Blog" },
    { to: "/notifications", label: "🔔 Notifications" },
    { to: "/profile", label: "👤 Profile", span: true },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 w-full max-w-md text-center shadow-2xl"
      >
        {/* ✅ Welcome message */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {user?.displayName || user?.email || "Guest"} 🚀
        </h1>
        <p className="text-white/70 mb-8">Choose an action:</p>

        {/* ✅ Main buttons */}
        <div className="grid grid-cols-2 gap-4">
          {buttons.map((btn, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={btn.span ? "col-span-2" : ""}
            >
              <Link
                to={btn.to}
                className="relative block px-4 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition"
              >
                {btn.label}
                {btn.badge && btn.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {btn.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ✅ User Catalog Section */}
        <div className="mt-8">
          <h2 className="text-white text-lg font-semibold mb-3">🛒 Catalog</h2>
          <Link
            to="/products"
            className="block w-full px-4 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition"
          >
            Browse Products
          </Link>
        </div>

        {/* ✅ Admin Catalog Section */}
        {isAdmin && (
          <div className="mt-6">
            <h2 className="text-white text-lg font-semibold mb-3">
              ⚙️ Admin Catalog
            </h2>
            <Link
              to="/admin/products"
              className="block w-full px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
            >
              Manage Products
            </Link>
          </div>
        )}

        {/* ✅ Logout button */}
        {user && (
          <button
            onClick={() => signOut(auth)}
            className="mt-6 w-full bg-red-400 hover:bg-red-300 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        )}
      </motion.div>
    </div>
  );
}
