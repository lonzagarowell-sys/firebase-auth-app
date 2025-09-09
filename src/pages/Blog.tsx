// src/pages/Blog.tsx
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  doc,
  onSnapshot,
  getDoc,
  deleteDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  createdAt?: Timestamp;
  authorName?: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const { user } = useAuth();

  // Real-time fetch
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData: BlogPost[] = [];

      for (const docSnap of snapshot.docs) {
        const postData = docSnap.data() as BlogPost;
        let authorName = "Unknown";

        if (postData.authorId) {
          const userDoc = await getDoc(doc(db, "users", postData.authorId));
          if (userDoc.exists()) {
            authorName =
              userDoc.data().name || userDoc.data().displayName || "Unknown";
          }
        }

        postsData.push({
          ...postData,
          authorName,
          id: docSnap.id,
        });
      }

      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  // Handle create / update
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to post");
    if (!title || !content) return alert("Title and content required");

    if (editingPostId) {
      await updateDoc(doc(db, "posts", editingPostId), { title, content });
      setEditingPostId(null);
    } else {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });
    }

    setTitle("");
    setContent("");
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", postId));
  };

  const formatDate = (timestamp?: Timestamp) =>
    timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-4xl w-full border border-white/20"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          📝 Blog
        </h1>

        {/* Post Form */}
        {user && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-white/10 rounded-xl shadow-inner space-y-3"
          >
            <h2 className="text-xl font-semibold text-white">
              {editingPostId ? "✏️ Edit Post" : "➕ Create New Post"}
            </h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full p-2 rounded bg-white/20 text-white placeholder-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Content"
              className="w-full p-2 rounded bg-white/20 text-white placeholder-gray-300"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
              >
                {editingPostId ? "Update" : "Post"}
              </button>
              {editingPostId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPostId(null);
                    setTitle("");
                    setContent("");
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Blog Posts */}
        {posts.length === 0 ? (
          <p className="text-center text-gray-200">No posts yet...</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const isMine = post.authorId === user?.uid;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`p-4 rounded-xl shadow-lg ${
                    isMine
                      ? "bg-blue-200/30 border-l-4 border-blue-500"
                      : "bg-white/20"
                  }`}
                >
                  <h2 className="text-xl font-semibold text-white">
                    {post.title}
                  </h2>
                  <p className="text-gray-200">{post.content}</p>
                  <p className="text-sm text-gray-300 mt-2">
                    By{" "}
                    <span className="font-medium">{post.authorName}</span> on{" "}
                    {formatDate(post.createdAt)}
                    {isMine && (
                      <span className="ml-2 text-blue-300 font-semibold">
                        — You
                      </span>
                    )}
                  </p>

                  {isMine && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
