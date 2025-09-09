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
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // No more onSnapshot
import { auth, db } from "../firebase";

// Context type
interface AuthContextType {
  user: User | null;
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
  loading: true,
  logout: async () => {},
  signup: async () => {},
});

// Hook to access AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

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

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName: displayName || email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      console.log("✅ User registered with role:user");
    } catch (err) {
      console.error("❌ Signup failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signup }}>
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