// migrateTodos.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrTy5EC4AnJRSqeW0iKVBy4gy-zpFZrcE",
  authDomain: "newerfire.firebaseapp.com",
  projectId: "newerfire",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixTodos() {
  const todosSnapshot = await getDocs(collection(db, "todos"));
  for (const todoDoc of todosSnapshot.docs) {
    const data = todoDoc.data();
    if (!data.createdAt) {
      console.log(`Updating todo ${todoDoc.id}`);
      await updateDoc(doc(db, "todos", todoDoc.id), { createdAt: serverTimestamp() });
    }
  }
  console.log("Migration complete ✅");
}

fixTodos().catch(console.error);
