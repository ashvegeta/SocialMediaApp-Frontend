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

const firebaseConfig = {
  apiKey: "AIzaSyCfWWAF1LBbR8N2CublnWjtARWnvvO8rTo",
  authDomain: "socialmediaapp-431315.firebaseapp.com",
  projectId: "socialmediaapp-431315",
  storageBucket: "socialmediaapp-431315.appspot.com",
  messagingSenderId: "1099275205469",
  appId: "1:1099275205469:web:db76c439abdcd27a8e06b4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const LOCAL_STORAGE_KEY = "appid:authUser";

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

export { auth, db, useAuth, useGeneralAuth, handleLogout };
