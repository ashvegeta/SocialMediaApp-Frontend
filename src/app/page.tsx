"use client";

import { useEffect, useState } from "react";
import { useGeneralAuth } from "@/lib/firebase";
import { useUserTags } from "@/lib/userInfo"; // Custom hook to get user tags
import LogoutButton from "@/components/Logout";
import Link from "next/link";
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

type Post = {
  Content: string;
  CreatedAt: string;
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

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || loading || userTags.length === 0) return; // Wait until user is loaded and has preferences

      let posts: Post[] = []; // Explicitly type the posts array
      let fetchedAll = false; // Flag to check if all users are fetched

      try {
        // Repeat until we have enough posts or fetched all public users
        while (posts.length < 5 && !fetchedAll) {
          let lastUserDoc = lastFetchedUser; // Start after this document in the next batch

          // Step 1: Query to get public users with a limit, and pagination
          const usersCollection = collection(db, "users");
          const usersQuery = lastUserDoc
            ? query(
                usersCollection,
                where("Visibility", "==", "public"),
                startAfter(lastUserDoc),
                limit(10) // Fetch 10 users in each batch
              )
            : query(
                usersCollection,
                where("Visibility", "==", "public"),
                limit(10)
              );

          const usersSnapshot = await getDocs(usersQuery);
          // If there are no more users, set fetchedAll to true
          if (usersSnapshot.empty) {
            fetchedAll = true;
            break;
          }

          // Update the last fetched user for pagination
          setLastFetchedUser(usersSnapshot.docs[usersSnapshot.docs.length - 1]);

          // Step 2: Iterate over fetched users and filter posts
          usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const userPosts: Post[] = userData.Posts || []; // Ensure Posts is always an array

            // Filter posts by user's preferences
            const matchedPosts = userPosts.filter((post) =>
              post.Tags?.some((tag) => userTags.includes(tag))
            );

            // Add matched posts to the result array
            posts.push(...matchedPosts);
          });

          // Step 3: Limit the total posts to 5
          if (posts.length >= 5) break; // Stop fetching more users if we have enough posts
        }

        setFilteredPosts(posts.slice(0, 5)); // Set a maximum of 5 posts
        setLoadingPosts(false); // Update loading state after fetching posts

        console.log("Filtered Posts:", posts); // Debugging log
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoadingPosts(false); // Ensure loading state is updated even if there's an error
      }
    };

    fetchPosts();
  }, [user, loading, userTags]);

  if (loading || loadingPosts) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.email}!</h2>
          <Link href={`/profile/${user.uid}`}>Go to Profile</Link>
          <LogoutButton />
          <br />
          <br />
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <div>
                {JSON.stringify(post)}
                <br />
                <br />
              </div>
            ))
          ) : (
            <p>No posts available.</p>
          )}
        </div>
      ) : (
        <p>Please log in to see more content.</p>
      )}
    </div>
  );
}
