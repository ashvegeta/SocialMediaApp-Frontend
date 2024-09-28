"use client";

import React from "react";
import { useGeneralAuth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import { useNotificationCount } from "@/lib/notificationsCount";
import Loading from "@/components/Loading";

const AboutPage = () => {
  const { user, loading } = useGeneralAuth();
  const notificationCount = useNotificationCount();

  if (loading) return <Loading />;
  return (
    <div>
      <Navbar User={user} notificationCount={notificationCount} />
      <div className="about-page"></div>
    </div>
  );
};

export default AboutPage;
