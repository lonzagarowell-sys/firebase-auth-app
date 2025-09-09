import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email/Password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // success
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Try again later.");
          break;
        default:
          setError(err.message);
      }
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Password reset
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset the password.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message);
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Add user to Firestore if first login
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "User",
          email: user.email,
          avatar:
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.displayName || "User"
            )}&background=random&color=fff`,
          bio: "",
          createdAt: new Date(),
        });
      }

      navigate("/"); // redirect after Google login
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google login popup was closed before completion.");
      } else {
        setError(err.message);
      }
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-500 via-purple-700 to-indigo-700 space-y-6">
      <motion.form
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleLogin}
        className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-lg w-96 space-y-4 border border-white/20"
      >
        <h2 className="text-3xl font-bold text-center text-white">Login</h2>
        {error && <p className="text-red-300 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <div className="flex justify-between items-center text-sm text-white">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="hover:underline"
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className={`w-full bg-indigo-500 hover:bg-indigo-400 text-white p-2 rounded-lg font-semibold transition-colors ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-200 mt-2">
          Don't have an account?{" "}
          <Link to="/signup" className="text-pink-300 hover:underline">
            Create an account
          </Link>
        </p>
      </motion.form>

      <button
        onClick={handleGoogleLogin}
        className={`bg-white text-gray-800 px-6 py-2 rounded-lg shadow-md hover:bg-gray-100 ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Processing..." : "Sign in with Google"}
      </button>
    </div>
  );
}
