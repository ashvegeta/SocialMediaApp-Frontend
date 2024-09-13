"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, useGeneralAuth } from "./firebase"; // Adjust the import path based on your project structure

const getUserTags = async (userId: string) => {
  const LOCAL_USER_TAGS_KEY = userId + ":userTags";

  // Check if the tags are already stored in localStorage
  const storedTags = localStorage.getItem(LOCAL_USER_TAGS_KEY);
  if (storedTags) {
    return JSON.parse(storedTags); // Return the tags from localStorage if available
  }

  try {
    // Reference to the user's document in Firestore
    const userDocRef = doc(db, "users", userId);

    // Fetch the user's document
    const userDocSnap = await getDoc(userDocRef);

    // Check if the document exists
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      // Extract the "Preferences" field (tags) from the user document
      const tags = userData.Preferences || []; // Default to an empty array if no preferences are found

      // Store the fetched tags locally
      localStorage.setItem(LOCAL_USER_TAGS_KEY, JSON.stringify(tags));

      console.log("User tags stored locally:", tags);
      return tags;
    } else {
      console.error("No user document found");
      localStorage.removeItem(LOCAL_USER_TAGS_KEY); // Remove stored tags if the document does not exist
      return [];
    }
  } catch (error) {
    console.error("Error fetching user tags:", error);
    return [];
  }
};

// Hook to wrap fetching tags in useEffect
const useUserTags = () => {
  const { user, loading } = useGeneralAuth(); // Custom hook to get the authenticated user
  const [tags, setTags] = useState<string[]>([]); // State to store tags

  useEffect(() => {
    // Only fetch tags if the user is authenticated and not loading
    if (!loading && user) {
      const fetchTags = async () => {
        const userTags = await getUserTags(user.uid);
        setTags(userTags); // Update the state with the fetched tags
      };

      fetchTags();
    }
  }, [user, loading]); // Dependency array: triggers when `user` or `loading` changes

  return tags; // Return the tags from the hook
};

export { useUserTags };
