"use client";

import React from "react";
import { useGeneralAuth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import { useNotificationCount } from "@/lib/notificationsCount";

const AboutPage = () => {
  const { user } = useGeneralAuth();
  const notificationCount = useNotificationCount();

  return (
    <div>
      <Navbar User={user} notificationCount={notificationCount} />
      <div className="about-page"></div>
    </div>
  );
};

export default AboutPage;
