// src/components/Navbar.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔑 Fetch role from Firestore when user logs in
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

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold hover:text-gray-300 transition"
        >
          My App
        </Link>

        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              <Link to="/favorites" className="hover:text-gray-300 transition">
                Favorites
              </Link>
              <Link to="/profile" className="hover:text-gray-300 transition">
                Profile
              </Link>
              <Link to="/events" className="hover:text-gray-300 transition">
                Events
              </Link>
              <Link to="/products" className="hover:text-gray-300 transition">
                Products
              </Link>
              <Link to="/chat" className="hover:text-gray-300 transition">
                Chat
              </Link>
              <Link to="/blog" className="hover:text-gray-300 transition">
                Blog
              </Link>

              {/* ✅ Only visible if user is admin */}
              {isAdmin && (
                <Link
                  to="/add-product"
                  className="hover:text-gray-300 transition"
                >
                  Add Product
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition">
                Login
              </Link>
              <Link to="/signup" className="hover:text-gray-300 transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
