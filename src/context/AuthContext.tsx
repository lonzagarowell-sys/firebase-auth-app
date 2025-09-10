// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, onSnapshot, serverTimestamp, getDoc } from "firebase/firestore"; // Added getDoc
import { auth, db } from "../firebase";

// Context type
interface AuthContextType {
  user: User | null;
  role: string | null; // "admin" or "user"
  loading: boolean;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
}

// Default context values
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
  signup: async () => {},
});

// Hook to access AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setRole(null);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        // ✅ Step 1: Check if the document exists before setting up the listener
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          // Document does not exist, so it's a new signup or the user doc hasn't been created yet.
          // Set a default role and stop loading.
          setRole("user");
          setLoading(false);
          return;
        }

        // ✅ Step 2: If the document exists, set up the Firestore listener
        const unsubscribeSnapshot = onSnapshot(
          userRef,
          (updatedDocSnap) => {
            if (updatedDocSnap.exists()) {
              setRole(updatedDocSnap.data().role || "user");
            } else {
              setRole("user"); // Fallback if doc is deleted
            }
            setLoading(false);
          },
          (error) => {
            console.error("❌ Firestore snapshot error:", error);
            setRole("user");
            setLoading(false);
          }
        );

        // ✅ Cleanup Firestore listener
        return () => unsubscribeSnapshot();
      } else {
        // User is logged out
        setLoading(false);
      }
    });

    // ✅ Cleanup auth listener
    return () => unsubscribeAuth();
  }, []);

  // 🔹 Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  // 🔹 Signup
  const signup = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }

      // 🔹 Create Firestore user doc
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName: displayName || email,
        role: "user", // default role
        createdAt: serverTimestamp(),
      });

      setRole("user");
      console.log("✅ User registered with role:user");
    } catch (err) {
      console.error("❌ Signup failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, signup }}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <span className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></span>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};