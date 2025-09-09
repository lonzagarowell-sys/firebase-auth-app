// src/pages/Admin.tsx
import { motion } from "framer-motion";
import AdminNotification from "../pages/AdminNotifications";

export default function Admin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-4xl w-full border border-white/20"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          🔔 Admin Notifications
        </h1>

        {/* Admin Notifications List */}
        <AdminNotification />
      </motion.div>
    </div>
  );
}
