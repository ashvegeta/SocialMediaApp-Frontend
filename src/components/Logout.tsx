import React from "react";
import { handleLogout } from "@/lib/firebase"; // Adjust the import path as needed

const LogoutButton: React.FC = () => {
  const onLogout = async () => {
    try {
      await handleLogout();
      console.log("User has been logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button onClick={onLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogoutButton;
