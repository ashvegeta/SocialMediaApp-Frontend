"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust the path to your firebase config
import { useParams } from "next/navigation";

type Post = {
  PostId: string;
  Content: string;
  CreatedAt: Timestamp;
  MediaURL?: string;
  Tags: string[];
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]); // State to hold the user's posts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = String(useParams().id); // Get the user ID from the URL

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!id) return; // No ID available

        const docRef = doc(db, "users", id); // Firestore collection 'users' and document 'id'
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfile(userData); // Set profile data
          setPosts(userData.Posts || []); // Set the user's posts (default to an empty array if none)
        } else {
          console.log("No such user profile exists!");
          setError("User profile not found");
        }
      } catch (error: any) {
        console.log("Error fetching user profile: ", error);
        setError("Failed to fetch user profile " + id);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      {profile ? (
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-pic">
              {/* Placeholder profile picture */}
              <img
                src="https://via.placeholder.com/150"
                alt="Profile picture"
                className="profile-pic-img"
              />
            </div>
            <div className="profile-details">
              <p>
                <strong>{profile.UserName}</strong>
              </p>
              <p>{profile.EmailId}</p>
              <p>
                <em>{profile.Visibility}</em>
              </p>
            </div>
          </div>

          <div className="aesthetic-line"></div>

          {/* Display User's Posts */}
          <div className="user-posts-section">
            <h3>User&apos;s Posts</h3>
            {posts.length > 0 ? (
              <div className="post-grid">
                {posts.map((post) => (
                  <div className="post-item" key={post.PostId}>
                    {post.MediaURL ? (
                      <img
                        src={post.MediaURL}
                        alt="Post media"
                        className="post-media"
                      />
                    ) : (
                      <div className="post-placeholder">
                        <p>No Media</p>
                      </div>
                    )}
                    <div className="post-details">
                      <p>
                        <strong>Tags:</strong> {post.Tags.join(", ")}
                      </p>
                      <p>
                        <strong>Created At:</strong>{" "}
                        {new Date(
                          post.CreatedAt.seconds * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No posts available.</p>
            )}
          </div>
        </div>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default ProfilePage;
