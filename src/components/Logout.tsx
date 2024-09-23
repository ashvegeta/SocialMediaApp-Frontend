import React from "react";
import { handleLogout } from "@/lib/firebase"; // Adjust the import path as needed

interface LogoutButtonProps {
  className?: string; // Add className as an optional prop
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "logout-button",
}) => {
  const onLogout = async () => {
    try {
      await handleLogout();
      console.log("User has been logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button onClick={onLogout} className={className}>
      Logout
    </button>
  );
};

export default LogoutButton;
