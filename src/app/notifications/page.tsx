"use client";

import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, useAuth } from "@/lib/firebase"; // Custom hook to get the current user (as implemented before)

const NotificationsPage = () => {
  const { user, loading } = useAuth(); // Get the authenticated user
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return; // User is not authenticated

    // Function to handle real-time updates
    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data(); // Get the user data

          if (userData && userData.Notifications) {
            setNotifications(userData.Notifications); // Set notifications from the user's field
          } else {
            setNotifications([]); // No notifications found
          }
        } else {
          console.error("No user document found");
          setError("User not found");
        }
        setLoadingNotifications(false); // Stop loading
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setError("Failed to fetch notifications.");
        setLoadingNotifications(false);
      }
    );

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [user, loading]); // Only run when user or loading state changes

  if (loading || loadingNotifications) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{JSON.stringify(notification)}</li>
          ))}
        </ul>
      ) : (
        <p>No notifications found.</p>
      )}
    </div>
  );
};

export default NotificationsPage;
