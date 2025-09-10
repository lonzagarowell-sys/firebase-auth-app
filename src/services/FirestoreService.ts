// src/services/FirestoreService.ts
import { 
  doc, collection, query, where, onSnapshot, getDoc 
} from "firebase/firestore";
import { db, auth } from "../firebase";

// ---------------------
// Helper functions
// ---------------------
function currentUser() {
  return auth.currentUser;
}

async function userIsAdmin() {
  const user = currentUser();
  if (!user) return false;
  const idTokenResult = await user.getIdTokenResult();
  return idTokenResult.claims.admin === true;
}

function ensureAuth() {
  const user = currentUser();
  if (!user) throw new Error("User not signed in");
  return user;
}

// ---------------------
// Roles
// ---------------------
export async function fetchRole(roleId: string) {
  ensureAuth();
  const roleDocRef = doc(db, "roles", roleId);
  const docSnap = await getDoc(roleDocRef);
  if (!docSnap.exists()) return null;
  return docSnap.data();
}

// ---------------------
// Todos
// ---------------------
export function subscribeTodos(callback: (todos: any[]) => void) {
  const user = ensureAuth();
  const q = query(collection(db, "todos"), where("userId", "==", user.uid));
  return onSnapshot(q, (snapshot) => {
    const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(todos);
  }, (err) => console.error("Firestore snapshot error (todos):", err));
}

// ---------------------
// Tasks
// ---------------------
export function subscribeTasks(callback: (tasks: any[]) => void) {
  const user = ensureAuth();
  const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tasks);
  }, (err) => console.error("Firestore snapshot error (tasks):", err));
}

// ---------------------
// Favorites
// ---------------------
export function subscribeFavorites(callback: (favorites: any[]) => void) {
  const user = ensureAuth();
  const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
  return onSnapshot(q, (snapshot) => {
    const favorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(favorites);
  }, (err) => console.error("Firestore snapshot error (favorites):", err));
}

// ---------------------
// Private Chats
// ---------------------
export function subscribeChat(chatId: string, callback: (data: any) => void) {
  const user = ensureAuth();
  const chatRef = doc(db, "chats", chatId);

  return onSnapshot(chatRef, (docSnap) => {
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const allowed = data.senderId === user.uid || data.recipientId === user.uid || userIsAdmin();
    if (allowed) callback(data);
    else console.error("Not authorized to read this chat");
  }, (err) => console.error("Firestore snapshot error (chat):", err));
}

// ---------------------
// Notifications
// ---------------------
export function subscribeNotifications(callback: (notifications: any[]) => void) {
  ensureAuth();
  const q = query(collection(db, "notifications"));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notifications);
  }, (err) => console.error("Firestore snapshot error (notifications):", err));
}
