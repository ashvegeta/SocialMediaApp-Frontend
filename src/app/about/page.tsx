"use client";

import React from "react";
import { useGeneralAuth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";

const AboutPage = () => {
  const { user } = useGeneralAuth();

  return (
    <div>
      <Navbar User={user} />
      <div className="about-page"></div>
    </div>
  );
};

export default AboutPage;
