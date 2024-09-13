"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGeneralAuth } from "@/lib/firebase"; // Custom hook to get the authenticated user
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const PreferencesPage = () => {
  const { user, loading } = useGeneralAuth(); // Get the authenticated user
  const router = useRouter();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Define the available tags
  const availableTags = [
    "sports",
    "anime",
    "nature",
    "space",
    "science",
    "gaming",
  ];

  const handleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // If tag is already selected, remove it from the array
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      // If tag is not selected, add it to the array
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    try {
      // Reference to the user's document
      const userDocRef = doc(db, "users", user.uid);

      // Update the user's document with selected preferences
      await updateDoc(userDocRef, { Preferences: selectedTags });

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  // While checking preferences or loading user
  if (loading) return <p>Loading...</p>;

  if (!user) {
    router.push("/");
  } else {
    return (
      <div>
        <h2>Select Your Preferences</h2>
        <form onSubmit={handleSubmit}>
          {availableTags.map((tag) => (
            <div key={tag}>
              <input
                type="checkbox"
                id={tag}
                value={tag}
                onChange={() => handleTagSelection(tag)}
                checked={selectedTags.includes(tag)}
              />
              <label htmlFor={tag}>{tag}</label>
            </div>
          ))}

          <button type="submit">Save Preferences</button>
        </form>
      </div>
    );
  }
};

export default PreferencesPage;
