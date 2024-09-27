"use client";

import { useEffect, useState } from "react";
import { useGeneralAuth } from "@/lib/firebase";
import { useUserTags } from "@/lib/userInfo"; // Custom hook to get user tags
import Navbar from "@/components/Navbar";

import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Import your Firestore instance
import { useNotificationCount } from "@/lib/notificationsCount";

type TS = {
  seconds: number;
  nanoseconds: number;
};

type Post = {
  Content: string;
  CreatedAt: TS;
  LastUpdatedAt: string;
  MediaURL: string;
  PostId: string;
  Tags: string[];
  UserId: string;
};

export default function Home() {
  const { user, loading } = useGeneralAuth();
  const userTags = useUserTags(); // This returns a string array directly
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]); // Type the posts correctly
  const [lastFetchedUser, setLastFetchedUser] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true); // State to track loading posts
  const notificationCount = useNotificationCount();

  useEffect(() => {
    const fetchPosts = async () => {
      if (loading) return; // Ensure the auth state has been checked

      let posts: Post[] = [];
      const postIds = new Set<string>();

      try {
        if (user && userTags.length > 0) {
          // Authenticated: Fetch posts based on user preferences
          let fetchedAll = false;
          let lastUserDoc = lastFetchedUser;

          while (posts.length < 5 && !fetchedAll) {
            const usersCollection = collection(db, "users");
            const usersQuery = lastUserDoc
              ? query(
                  usersCollection,
                  where("Visibility", "==", "public"),
                  startAfter(lastUserDoc),
                  limit(10)
                )
              : query(
                  usersCollection,
                  where("Visibility", "==", "public"),
                  limit(10)
                );

            const usersSnapshot = await getDocs(usersQuery);

            if (usersSnapshot.empty) {
              fetchedAll = true;
              break;
            }

            lastUserDoc = usersSnapshot.docs[usersSnapshot.docs.length - 1];
            setLastFetchedUser(lastUserDoc);

            usersSnapshot.forEach((userDoc) => {
              const userData = userDoc.data();
              const userPosts: Post[] = userData.Posts || [];

              const matchedPosts = userPosts.filter((post) =>
                post.Tags?.some((tag) => userTags.includes(tag))
              );

              matchedPosts.forEach((post) => {
                if (!postIds.has(post.PostId)) {
                  posts.push(post);
                  postIds.add(post.PostId);
                }
              });
            });

            if (posts.length >= 5) break;
          }
        } else {
          // Non-authenticated: Fetch 5 random posts
          const randomQuery = query(
            collection(db, "users"),
            where("Visibility", "==", "public"),
            limit(10) // Fetch some public users to get random posts
          );
          const usersSnapshot = await getDocs(randomQuery);

          usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const userPosts: Post[] = userData.Posts || [];

            userPosts.forEach((post) => {
              if (!postIds.has(post.PostId) && posts.length < 5) {
                posts.push(post);
                postIds.add(post.PostId);
              }
            });

            if (posts.length >= 5) return;
          });
        }

        setFilteredPosts(posts.slice(0, 5)); // Set a maximum of 5 posts
        setLoadingPosts(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [user, loading, userTags]);

  if (loading || loadingPosts) return <div>Loading...</div>;

  return (
    <div>
      <Navbar User={user} notificationCount={notificationCount} />

      {user ? (
        <div className="home-welcome-message">
          {/* <h2>Welcome, {user.displayName}!</h2> */}
          {/* <Link href={`/profile/${user.uid}`}>Go to Profile</Link> */}
          {/* <LogoutButton /> */}
        </div>
      ) : (
        <p>Explore some random posts below!</p>
      )}

      <div className="home-posts-grid">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.PostId} className="home-post-card">
              <div className="home-post-header">
                <p className="home-post-caption">{post.Content}</p>
                <p className="home-post-time">
                  {new Date(post.CreatedAt.seconds * 1000).toLocaleString()}
                </p>
              </div>
              <div className="home-post-media">
                <img src={post.MediaURL} alt="post" />
              </div>
              <div className="home-post-tags">
                {post.Tags.map((tag, index) => (
                  <span key={index} className="home-post-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
}
