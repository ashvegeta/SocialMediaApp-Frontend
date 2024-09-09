"use client";

import React, { useState } from "react";
import { storage, useGeneralAuth } from "@/lib/firebase"; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const NewPostPage = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useGeneralAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!user) return;

    e.preventDefault();
    setLoading(true);

    try {
      let mediaURL = "";

      // Upload file to Firebase Storage if a file is selected
      if (file) {
        const storageRef = ref(storage, `media/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Get the URL after successful upload
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Handle progress here if needed
            },
            (error) => reject(error),
            async () => {
              mediaURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      // Create post data object
      const newPost = {
        UserId: user.uid, // Replace with actual user ID
        Content: content,
        MediaURL: mediaURL,
        Tags: tags,
      };

      // Send post data to your backend API
      const response = await fetch(
        process.env.NEXT_PUBLIC_APPENGINE_URL + "/post/add",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPost),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      console.log("Post created successfully");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create New Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          required
        />
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          value={tags.join(", ")}
          onChange={(e) => setTags(e.target.value.split(","))}
          placeholder="Tags (comma separated)"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default NewPostPage;
