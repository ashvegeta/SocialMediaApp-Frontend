import { useState, useEffect } from "react";
import { useAuth } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

interface Notification {
  NID: string;
  Content: string;
  MetaData: {
    UserName: string;
    From: string;
  };
  TimeStamp: string;
  CType: string;
  IsRead: boolean;
}

export const useNotificationCount = () => {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const notifications: Notification[] = userData?.Notifications || []; // Type notifications as Notification[]
        const unreadCount = notifications.filter((n) => !n.IsRead).length;
        setNotificationCount(unreadCount);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return notificationCount;
};
