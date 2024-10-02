import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Props: UserID and PostID are passed to fetch the specific post
interface PopupPostProps {
  userID: string;
  postID: string;
  onClose: () => void; // Close the popup when clicking the cross button
}

interface Post {
  imageUrl: string;
  content: string;
  tags: string[];
  timestamp: string;
}

const PopupPost: React.FC<PopupPostProps> = ({ userID, postID, onClose }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch post details from Firestore using userID and postID
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        console.log(userID, postID);

        // Replace with your Firestore fetching logic
        const postDoc = await fetchPostFromFirestore(userID, postID);
        setPost(postDoc);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [userID, postID]);

  // Fetch the post from Firestore using the userID and postID
  const fetchPostFromFirestore = async (
    userID: string,
    postID: string
  ): Promise<Post | null> => {
    try {
      // Reference to the user's document in Firestore
      const userDocRef = doc(db, "users", userID);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const posts = userData?.Posts || [];

        // Find the post in the "Posts" array that matches the postID
        const post = posts.find((p: any) => p.PostId === postID);

        console.log(post);

        if (post) {
          return {
            imageUrl: post.MediaURL,
            content: post.Content,
            tags: post.Tags,
            timestamp: new Date(post.CreatedAt.seconds * 1000).toLocaleString(),
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  };

  // Loading screen while fetching the post
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close-button" onClick={onClose}>
          &times;
        </button>
        {post ? (
          <>
            <div className="popup-image-wrapper">
              <img src={post.imageUrl} alt="Post" />
            </div>
            <div className="popup-details">
              <p>{post.content}</p>
              <div className="popup-tags">
                {post.tags.map((tag, index) => (
                  <span key={index}>#{tag}</span>
                ))}
              </div>
              <p className="popup-timestamp">Posted on {post.timestamp}</p>
            </div>
          </>
        ) : (
          <p>Post not found.</p>
        )}
      </div>
    </div>
  );
};

export default PopupPost;
