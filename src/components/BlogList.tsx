// src/components/BlogList.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import PostForm from "./PostForm";

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorEmail: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Post, "id">),
      }));
      setPosts(list);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "posts", postId));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">📝 Blog Posts</h1>

      {/* New post form */}
      {user && !editingPost && (
        <PostForm onClose={() => setEditingPost(null)} />
      )}

      {/* Editing form */}
      {editingPost && (
        <PostForm
          postId={editingPost.id}
          existingTitle={editingPost.title}
          existingContent={editingPost.content}
          onClose={() => setEditingPost(null)}
        />
      )}

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold">{post.title}</h2>
            <p className="text-gray-300">{post.content}</p>
            <p className="text-sm text-gray-400">
              ✍️ {post.authorEmail || "Unknown"}
            </p>

            {user?.uid === post.authorId && (
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => setEditingPost(post)}
                  className="bg-yellow-500 px-3 py-1 rounded text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="bg-red-500 px-3 py-1 rounded text-white"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
