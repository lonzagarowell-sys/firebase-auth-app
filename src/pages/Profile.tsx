// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { uploadToCloudinary } from "../utils/cloudinary";

const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  photoURL?: string;
  createdAt: any;
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.error("Auth error:", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};

export default function Profile() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const profileRef = doc(db, "users", user.uid, "profile", "data");
      try {
        const docSnap = await getDoc(profileRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setTempProfile(data);
        } else {
          const newProfile: UserProfile = {
            name: user.displayName || "New User",
            email: user.email || "N/A",
            bio: "Welcome to your profile!",
            createdAt: serverTimestamp(),
          };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
          setTempProfile(newProfile);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Update profile
  const handleProfileUpdate = async () => {
    if (!user || !tempProfile) return;

    let photoURL = tempProfile.photoURL || null;

    if (avatarFile) {
      try {
        const uploadResult = await uploadToCloudinary(avatarFile);
        if (uploadResult?.secure_url) photoURL = uploadResult.secure_url;
      } catch (err) {
        console.error("Avatar upload error:", err);
      }
    }

    const profileRef = doc(db, "users", user.uid, "profile", "data");
    const updatedProfile: any = { ...tempProfile, createdAt: profile?.createdAt, photoURL };

    try {
      await setDoc(profileRef, updatedProfile, { merge: true });
      setProfile(updatedProfile);
      setEditMode(false);
      setAvatarFile(null);
      alert("Profile updated!");
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (loading || profileLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 text-white">
        Loading...
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 text-white p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-6">👤 User Profile</h2>
        <div className="flex flex-col items-center mb-4">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt="Avatar"
              className="w-24 h-24 rounded-full mb-2 border-4 border-white/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl mb-2">
              👤
            </div>
          )}
          {editMode && (
            <input
              type="file"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              className="mt-2 text-sm"
            />
          )}
        </div>

        {editMode ? (
          <div className="space-y-3">
            <input
              type="text"
              value={tempProfile?.name || ""}
              onChange={(e) =>
                setTempProfile((p) => (p ? { ...p, name: e.target.value } : p))
              }
              placeholder="Name"
              className="w-full p-2 rounded bg-white/20 text-white placeholder-gray-300"
            />
            <textarea
              value={tempProfile?.bio || ""}
              onChange={(e) =>
                setTempProfile((p) => (p ? { ...p, bio: e.target.value } : p))
              }
              placeholder="Bio"
              className="w-full p-2 rounded bg-white/20 text-white placeholder-gray-300"
            />
            <button
              onClick={handleProfileUpdate}
              className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Save Profile
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">{profile?.name}</h3>
            <p className="text-gray-200">{profile?.email}</p>
            <p className="text-gray-100">{profile?.bio}</p>
            <button
              onClick={() => {
                setTempProfile(profile ? { ...profile } : null);
                setEditMode(true);
              }}
              className="w-full p-2 bg-green-600 rounded hover:bg-green-700"
            >
              Edit Profile
            </button>
          </div>
        )}

        <p className="text-sm text-gray-300 text-center mt-4">
          Member since:{" "}
          {profile?.createdAt && "toDate" in profile.createdAt
            ? profile.createdAt.toDate().toLocaleDateString()
            : "N/A"}
        </p>
      </motion.div>
    </div>
  );
}
