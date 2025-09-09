// src/components/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <p className="text-center text-gray-600">Checking access...</p>;
  }

  // 🚫 Not logged in OR not an admin → redirect
  if (!user || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ✅ Admin → render children
  return <>{children}</>;
}
