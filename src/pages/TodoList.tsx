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

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: any;
  uid: string;
}

export default function TodoList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // Load tasks for current user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Task[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Task, "id">),
        }));
        setTasks(list);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore snapshot error:", error);
        alert("Unable to load tasks. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Add a new task
  const handleAdd = async () => {
    if (!newTask.trim() || !user) return;
    try {
      await addDoc(collection(db, "tasks"), {
        title: newTask.trim(),
        completed: false,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewTask("");
    } catch (err) {
      console.error("Add task failed:", err);
      alert("Failed to add task.");
    }
  };

  // Toggle completion
  const handleToggle = async (task: Task) => {
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, { completed: !task.completed });
    } catch (err) {
      console.error("Toggle failed:", err);
      alert("Failed to update task.");
    }
  };

  // Delete a task
  const handleDelete = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete task.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 text-white p-8 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">✅ My To-Do List</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
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
          <p className="text-center text-gray-200">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-300">No tasks yet!</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center p-3 bg-white/20 backdrop-blur-md rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task)}
                    className="mr-2"
                  />
                  <span
                    className={
                      task.completed ? "line-through text-gray-400" : ""
                    }
                  >
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
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
