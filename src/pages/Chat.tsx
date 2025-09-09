// src/pages/Chat.tsx
import { useState, useEffect, type FormEvent } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  type User,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";
import { uploadToCloudinary } from "../utils/cloudinary";

const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

interface ChatMessage {
  id: string;
  text: string;
  imageUrl?: string;
  uid: string;
  displayName?: string;
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
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
          } catch {
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};

export default function Chat() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "artifacts", appId, "public", "data", "chats"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map(
          (doc) =>
            ({ id: doc.id, ...(doc.data() as Omit<ChatMessage, "id">) }) as ChatMessage
        )
      );
    });

    return unsubscribe;
  }, [user]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    let imageUrl: string | undefined;

    if (file) {
      try {
        const uploadResult = await uploadToCloudinary(file, (progress) =>
          setUploadProgress(progress)
        );
        imageUrl = uploadResult?.secure_url;
        setFile(null);
        setUploadProgress(0);
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

    const messageData: any = {
      text: newMessage,
      uid: user.uid,
      displayName: user.displayName || "Anonymous",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
    };

    if (imageUrl) messageData.imageUrl = imageUrl;

    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "chats"),
        messageData
      );
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen text-white p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <h2 className="text-2xl font-bold text-center mb-4">💬 Public Chat</h2>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-black/40 border border-gray-700">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-xl max-w-[75%] ${
              msg.uid === user?.uid
                ? "bg-blue-600 self-end"
                : "bg-gray-700 self-start"
            }`}
          >
            {msg.displayName && (
              <p className="font-semibold text-sm mb-1">{msg.displayName}</p>
            )}
            <p>{msg.text}</p>
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="chat image"
                className="mt-2 max-h-48 rounded"
              />
            )}
          </div>
        ))}
      </div>

      {uploadProgress > 0 && (
        <p className="mt-2 text-sm text-gray-300">Uploading: {uploadProgress}%</p>
      )}

      {/* Input area */}
      <form onSubmit={sendMessage} className="flex gap-2 mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-xl bg-gray-800/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
