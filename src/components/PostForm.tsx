// src/components/PostForm.tsx
import { useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

interface PostFormProps {
  postId?: string;
  existingTitle?: string;
  existingContent?: string;
  onClose: () => void;
}

export default function PostForm({
  postId,
  existingTitle = "",
  existingContent = "",
  onClose,
}: PostFormProps) {
  const [title, setTitle] = useState(existingTitle);
  const [content, setContent] = useState(existingContent);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("⚠️ Please log in");

    if (postId) {
      // ✏️ Update existing post
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        title,
        content,
        updatedAt: serverTimestamp(),
      });
    } else {
      // ➕ Add new post
      await addDoc(collection(db, "posts"), {
        title,
        content,
        authorId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-2 p-2 rounded text-black"
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full mb-2 p-2 rounded text-black"
        rows={4}
        required
      />
      <button type="submit" className="bg-blue-500 px-4 py-2 rounded text-white">
        {postId ? "Update Post" : "Create Post"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 bg-gray-500 px-4 py-2 rounded text-white"
      >
        Cancel
      </button>
    </form>
  );
}
