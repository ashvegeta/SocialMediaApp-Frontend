"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, writeBatch } from "firebase/firestore";
import { db, useAuth } from "@/lib/firebase"; // Custom hook to get the current user (as implemented before)
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const markAllNotificationsAsRead = async (userId: string) => {
  try {
    // Step 1: Get the user's Notifications array
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.log("User document not found.");
      return;
    }

    const userData = userDocSnap.data();
    const notifications = userData.Notifications || [];

    // Step 2: Create a write batch
    const batch = writeBatch(db);

    // Step 3: Loop through all notifications and mark them as read
    notifications.forEach((notification: any) => {
      // Update the IsRead field of each notification
      notification.IsRead = true;
    });

    // Update the user's document with the modified notifications array
    batch.update(userDocRef, { Notifications: notifications });

    // Step 4: Commit the batch
    await batch.commit();
    console.log("All notifications marked as read successfully.");
  } catch (error) {
    console.error("Error marking notifications as read:", error);
  }
};

const NotificationsPage = () => {
  const { user, loading } = useAuth(); // Get the authenticated user
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handledNotifications, setHandledNotifications] = useState<string[]>(
    []
  );
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) {
      return; // User is not authenticated
    }
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

  // Use this function to mark all notifications as read when the component mounts
  useEffect(() => {
    if (user) {
      markAllNotificationsAsRead(user.uid);
    }
  }, [user, loadingNotifications]);

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
    notificationId: string | null
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

        if (notificationId) {
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
        }
      } else {
        console.error("Error deleting connection");
      }
    } catch (error) {
      console.error("Error handling connection request:", error);
    }
  };

  if (user && (loading || loadingNotifications)) return <Loading />;
  if (error) return <p>{error}</p>;
  if (!user) return null;

  return (
    <div>
      <Navbar User={user} />
      <div className="notification-container">
        <h2 className="notification-heading">Notifications</h2>
        {notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.map((notification, index) => (
              <li key={index} className="notification-item">
                {notification.CType === "connRequest" ? (
                  <div className="notification-request">
                    {handledNotifications.includes(notification.NID) ? (
                      <p className="notification-accepted">
                        You are now friends with{" "}
                        {notification.MetaData.UserName}
                      </p>
                    ) : (
                      <div className="notification-actions">
                        <p className="notification-message">
                          Connection Request from{" "}
                          {notification.MetaData.UserName}
                        </p>
                        <button
                          className="notification-btn accept-btn"
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
                          className="notification-btn delete-btn"
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
                    <p className="notification-timestamp">
                      {new Date(notification.TimeStamp).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="notification-detail">
                    <p className="notification-meta">{notification.Content}</p>
                    <p className="notification-timestamp">
                      {new Date(notification.TimeStamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="notification-empty">No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
