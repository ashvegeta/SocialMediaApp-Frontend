"use client";

import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, useAuth } from "@/lib/firebase"; // Custom hook to get the current user (as implemented before)

const NotificationsPage = () => {
  const { user, loading } = useAuth(); // Get the authenticated user
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handledNotifications, setHandledNotifications] = useState<string[]>(
    []
  ); // Track handled notifications

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

  const handleAcceptRequest = async (
    fromUserId: string,
    notificationId: string
  ) => {
    try {
      // Accept the connection request and handle notifications in the backend
      const response = await fetch(
        process.env.NEXT_PUBLIC_APPENGINE_URL + "/conn/add",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            From: fromUserId,
            To: user?.uid,
            NID: notificationId,
            ConnStatus: "accepted",
          }),
        }
      );

      if (response.ok) {
        console.log("Connection accepted successfully!");
        // Mark the notification as handled
        setHandledNotifications((prev) => [...prev, notificationId]);
      } else {
        console.error("Error accepting connection");
      }
    } catch (error) {
      console.error("Error handling connection request:", error);
    }
  };

  const handleDeleteRequest = async (
    fromUserId: string,
    notificationId: string
  ) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_APPENGINE_URL + "/conn/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            From: fromUserId,
            To: user?.uid,
          }),
        }
      );
      if (response.ok) {
        console.log("Connection deleted successfully!");
        // Update the state to mark the notification as handled

        const trailRes = await fetch(
          process.env.NEXT_PUBLIC_APPENGINE_URL + "/notification/delete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              UserId: user?.uid,
              NID: notificationId,
            }),
          }
        );

        if (!trailRes.ok) {
          console.error("Error deleting notification " + trailRes.body);
        }

        setHandledNotifications((prev) => [...prev, notificationId]);
      } else {
        console.error("Error deleting connection");
      }
    } catch (error) {
      console.error("Error handling connection request:", error);
    }
  };

  if (loading || loadingNotifications) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>
              {notification.CType === "connRequest" ? (
                <div>
                  {handledNotifications.includes(notification.NID) ? (
                    // Show success message after handling the request
                    <p>
                      You are now friends with {notification.MetaData.UserName}
                    </p>
                  ) : (
                    // Show the accept and delete buttons if the request is not handled
                    <div>
                      <p>
                        Connection Request from {notification.MetaData.UserName}
                      </p>
                      <button
                        onClick={() =>
                          handleAcceptRequest(
                            notification.MetaData.From,
                            notification.NID
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteRequest(
                            notification.MetaData.From,
                            notification.NID
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p>{JSON.stringify(notification)}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications found.</p>
      )}
    </div>
  );
};

export default NotificationsPage;
