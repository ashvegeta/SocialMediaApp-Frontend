import { initializeApp } from "firebase/app";
import {
  getAuth,
  onIdTokenChanged,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const LOCAL_STORAGE_KEY = String(process.env.NEXT_PUBLIC_LOCAL_USER_KEY);

// Custom hook to use authentication state
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve user from local storage on initial load
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }

    // Listen for ID token changes
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Save user to local storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(firebaseUser));
        setUser(firebaseUser);

        // Refresh token if close to expiry (Firebase auto-refreshes the token)
        const tokenResult = await firebaseUser.getIdTokenResult();
        const expirationTime = tokenResult.expirationTime;
        const currentTime = new Date().getTime();

        // If the token is about to expire within 5 minutes, force a refresh
        if (new Date(expirationTime).getTime() - currentTime < 5 * 60 * 1000) {
          await firebaseUser.getIdToken(true); // Forces token refresh
        }
      } else {
        // User is signed out or token expired
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
};

const useGeneralAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(user ? false : true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(firebaseUser));
      setUser(firebaseUser ? firebaseUser : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

// Function to handle logout
const handleLogout = async () => {
  await signOut(auth);
  localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear local storage
};

export { auth, db, storage, useAuth, useGeneralAuth, handleLogout };
