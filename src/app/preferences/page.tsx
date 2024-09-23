"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGeneralAuth } from "@/lib/firebase"; // Custom hook to get the authenticated user
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

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
    "music",
    "movies",
    "fitness",
    "photography",
    "travel",
    "food",
    "fashion",
    "technology",
    "art",
    "history",
    "health",
    "coding",
    "self-improvement",
    "memes",
    "comedy",
    "design",
    "mental health",
    "entrepreneurship",
    "books",
    "startups",
    "outdoor activities",
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
        <div className="preferences-container">
          <h2>Select Your Preferences</h2>
          <form className="preferences-form" onSubmit={handleSubmit}>
            <div className="tag-cloud">
              {availableTags.map((tag) => (
                <div
                  key={tag}
                  className={`tag-item ${
                    selectedTags.includes(tag) ? "selected" : ""
                  }`}
                  onClick={() => handleTagSelection(tag)}
                >
                  {tag}
                </div>
              ))}
            </div>

            <button type="submit" className="save-button">
              Save Preferences
            </button>
          </form>
        </div>
      </div>
    );
  }
};

export default PreferencesPage;
