// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { motion } from "framer-motion";

// Components & Pages
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Todo from "./pages/TodoList";
import Upload from "./pages/Upload";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import EventsPage from "./pages/EventsPage";
import AddProduct from "./pages/AddProduct";
import ProductCatalog from "./pages/ProductCatalog";
import Favorites from "./components/Favorites";
import SeedPage from "./pages/SeedPage";
import Blog from "./pages/Blog";
import NotificationPanel from "./components/NotificationPanel";

// ✅ Admin
import AdminRoute from "./components/AdminRoute";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminNotifications from "./pages/AdminNotifications";

// Spinner
function Loading() {
  return <div className="text-center mt-10">Loading...</div>;
}

// Protected Routes
interface RouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? <Navigate to="/" /> : <>{children}</>;
}

// Home
function Home() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "messages"),
      where("uid", "!=", user.uid),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
    return () => unsub();
  }, [user]);

  const buttons = [
    { to: "/events", label: "🗓️ Events" },
    { to: "/upload", label: "📤 Upload" },
    { to: "/files", label: "📂 Files" },
    { to: "/todo", label: "✅ Todo" },
    { to: "/chat", label: "💬 Chat", badge: unreadCount },
    { to: "/blog", label: "📝 Blog" },
    { to: "/notifications", label: "🔔 Notifications" },
    { to: "/products", label: "🛍️ Catalog" },
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
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {user?.displayName || user?.email || "Guest"} 🚀
        </h1>
        <p className="text-white/70 mb-8">Choose an action:</p>

        <div className="grid grid-cols-2 gap-4">
          {buttons.map((btn, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={btn.span ? "col-span-2" : ""}
            >
              <a
                href={btn.to}
                className="relative block px-4 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition"
              >
                {btn.label}
                {btn.badge && btn.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {btn.badge}
                  </span>
                )}
              </a>
            </motion.div>
          ))}
        </div>

        {user && (
          <button
            onClick={() => signOut(auth)}
            className="mt-6 w-full bg-red-500 hover:bg-red-400 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ✅ App
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Private */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/todo" element={<PrivateRoute><Todo /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
          <Route path="/file-upload" element={<PrivateRoute><FileUpload /></PrivateRoute>} />
          <Route path="/files" element={<PrivateRoute><FileList /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
          <Route path="/blog" element={<PrivateRoute><Blog /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationPanel /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><ProductCatalog /></PrivateRoute>} />

          {/* Admin-only */}
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />

          {/* Utility */}
          <Route path="/seed" element={<SeedPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/add-product" element={<AddProduct />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
