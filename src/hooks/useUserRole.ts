// src/hooks/useUserRole.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext'; // Import your AuthContext

export const useUserRole = () => {
  const { user } = useAuth(); // Get the user from the AuthContext
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    // Only run this effect if a user is logged in
    if (!user) {
      setRole(null);
      setLoadingRole(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    
    // Set up the real-time listener for the user's document
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setRole(docSnap.data().role || 'user');
        } else {
          // If the document doesn't exist, it means a new user just signed up
          // Their role is 'user' by default until the document is created
          setRole('user');
        }
        setLoadingRole(false);
      },
      (error) => {
        console.error('Firestore snapshot error:', error);
        setRole('user');
        setLoadingRole(false);
      }
    );

    // Clean up the listener when the component unmounts or the user changes
    return () => unsubscribe();
  }, [user]); // Re-run effect whenever the user object changes

  return { role, loadingRole };
};