// src/pages/TodoList.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: any;
  userId: string;
}

export default function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);

  // Load todos for the current user
  useEffect(() => {
    if (!user) return;

    const todosQuery = query(
      collection(db, "todos"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      todosQuery,
      (snapshot) => {
        const list: Todo[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Todo, "id">),
        }));
        setTodos(list);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore snapshot error:", error);
        alert(
          "Unable to load your todos. Check that you are logged in and have proper permissions."
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Add a new todo
  const handleAdd = async () => {
    if (!user || !newTodo.trim()) return;

    try {
      await addDoc(collection(db, "todos"), {
        title: newTodo.trim(),
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewTodo("");
    } catch (err) {
      console.error("Add todo failed:", err);
      alert("Failed to add todo. Make sure you have permission.");
    }
  };

  // Toggle completion
  const handleToggle = async (todo: Todo) => {
    if (!user || todo.userId !== user.uid) return;

    try {
      const todoRef = doc(db, "todos", todo.id);
      await updateDoc(todoRef, { completed: !todo.completed });
    } catch (err) {
      console.error("Toggle failed:", err);
      alert("Failed to update todo. Make sure you have permission.");
    }
  };

  // Delete a todo
  const handleDelete = async (todo: Todo) => {
    if (!user || todo.userId !== user.uid) return;

    try {
      const todoRef = doc(db, "todos", todo.id);
      await deleteDoc(todoRef);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete todo. Make sure you have permission.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        <p>Please log in to view your To-Do List.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 text-white p-8 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">✅ My To-Do List</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 p-2 rounded-lg text-black"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-200">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-gray-300">No todos yet!</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex justify-between items-center p-3 bg-white/20 backdrop-blur-md rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo)}
                    className="mr-2"
                  />
                  <span
                    className={todo.completed ? "line-through text-gray-400" : ""}
                  >
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(todo)}
                  className="text-red-300 hover:text-red-500 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
