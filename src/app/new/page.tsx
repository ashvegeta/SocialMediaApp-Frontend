"use client";

import React, { useState } from "react";
import { storage, useGeneralAuth } from "@/lib/firebase"; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useNotificationCount } from "@/lib/notificationsCount";
import { useRouter } from "next/navigation";

const NewPostPage = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useGeneralAuth();
  const notificationCount = useNotificationCount();
  const router = useRouter();

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

      // Extract data from the post creation response
      const postData = await response.json();

      console.log(postData);

      // Now, send notifications to all connected users
      const notificationResponse = await fetch(
        process.env.NEXT_PUBLIC_APPENGINE_URL + "/notification/sendallconn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UserID: postData.UserId,
            PostID: postData.PostId,
            UserName: user.displayName, // Assuming your post response contains the username
          }),
        }
      );

      if (!notificationResponse.ok) {
        console.error("Failed to send notifications to some/all users");
      } else {
        console.log("Notifications sent successfully");
      }

      // Redirect to the profile page after the post is created successfully
      router.push(`profile/${user.uid}`);
    } catch (error) {
      console.error("Error creating post or sending notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ margin: "2% 3%", fontSize: "20px" }}>
        Please <Link href="/auth/login">Login</Link> to Upload Posts.
      </div>
    );
  }

  return (
    <div>
      <Navbar User={user} notificationCount={notificationCount} />
      <div className="new-post-container">
        <h2>Create New Post</h2>
        <form className="new-post-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="content-textarea"
              required
            />
          </div>

          <div className="input-group file-upload">
            <label htmlFor="file-upload" className="custom-file-upload">
              <span role="img" aria-label="upload">
                📷
              </span>{" "}
              Upload Media
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} />
            {file && <p className="file-name">Selected: {file.name}</p>}
          </div>

          <div className="input-group">
            <input
              type="text"
              value={tags.join(",")}
              onChange={(e) => setTags(e.target.value.split(","))}
              placeholder="Tags (comma separated)"
              className="tags-input"
            />
          </div>

          <button className="post-button" type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPostPage;
