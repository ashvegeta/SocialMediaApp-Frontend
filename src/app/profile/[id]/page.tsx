"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db, useGeneralAuth } from "@/lib/firebase";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useNotificationCount } from "@/lib/notificationsCount";
import Loading from "@/components/Loading";

type Post = {
  PostId: string;
  Content: string;
  CreatedAt: Timestamp;
  MediaURL?: string;
  Tags: string[];
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = String(useParams().id);
  const { user } = useGeneralAuth();
  const notificationCount = useNotificationCount();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!id) return;

        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfile(userData); // Set profile data
          setPosts((userData.Posts || []).reverse()); // Reverse the posts for newer-first order
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

  if (loading) return <Loading />;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <Navbar User={user} notificationCount={notificationCount} />
      <div className="profile-page">
        <h2 className="profile-title">User Profile</h2>
        {profile ? (
          <div className="profile-header">
            <div className="profile-info">
              <div className="profile-pic">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Profile picture"
                  className="profile-pic-img"
                />
              </div>
              <div className="profile-details">
                <p className="profile-username">
                  <strong>{profile.UserName}</strong>
                </p>
                <p className="profile-email">{profile.EmailId}</p>
                <p className="profile-visibility">
                  <em>{profile.Visibility}</em>
                </p>
              </div>
            </div>

            <div className="aesthetic-line"></div>

            {/* User's Posts Section */}
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
                        <p className="post-content">{post.Content}</p>
                        <div className="tags-container">
                          <span className="tags">
                            {post.Tags.map((tag, index) => (
                              <span className="tag" key={index}>
                                {tag}
                              </span>
                            ))}
                          </span>
                        </div>
                        <p className="post-date">
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
    </div>
  );
};

export default ProfilePage;
