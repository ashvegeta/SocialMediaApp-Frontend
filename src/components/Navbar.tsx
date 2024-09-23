import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaPlus,
  FaUserCircle,
} from "react-icons/fa";
import { IoIosNotifications, IoIosInformationCircle } from "react-icons/io";
import { IoLogIn } from "react-icons/io5";
import Link from "next/link";
import { User } from "firebase/auth";
import LogoutButton from "./Logout"; // Assuming LogoutButton is imported here

const Navbar: React.FC<{ User: User | null; profilePicUrl?: string }> = ({
  User,
  profilePicUrl,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // State for profile dropdown

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // useEffect to monitor screen resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false); // Close mobile menu when screen is resized
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up event listener
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Burger Menu for Mobile */}
        <div className="burger-menu" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Logo/Brand */}
        <Link href="/" className="navbar-brand">
          Yet Another Social Media App
        </Link>

        {/* Main Links */}
        <ul className={`navbar-links ${isMobileMenuOpen ? "mobile" : ""}`}>
          {/* Search Icon */}
          <li>
            <Link href="/search" className="navbar-item">
              {isMobileMenuOpen ? "Search" : <FaSearch size={24} />}
            </Link>
          </li>

          {/* New Post Icon */}
          <li>
            <Link href="/new" className="navbar-item">
              {isMobileMenuOpen ? "New Post" : <FaPlus size={24} />}
            </Link>
          </li>

          {/* Notifications */}
          <li>
            <Link href="/notifications" className="navbar-item">
              {isMobileMenuOpen ? (
                "Notification"
              ) : (
                <IoIosNotifications size={25} />
              )}
            </Link>
          </li>

          {/* About Us Page */}
          <li>
            <Link href="/about" className="navbar-item">
              {isMobileMenuOpen ? (
                "About"
              ) : (
                <IoIosInformationCircle size={24} />
              )}
            </Link>
          </li>

          {/* Profile or Login */}
          <li className="navbar-item-profile">
            {User ? (
              <div onClick={toggleProfileDropdown} className="profile-icon">
                {isMobileMenuOpen ? "Profile" : <FaUserCircle size={24} />}
              </div>
            ) : (
              <Link href="/auth/login" className="navbar-item">
                {isMobileMenuOpen ? "Login" : <IoLogIn size={24} />}
              </Link>
            )}

            {/* Profile Dropdown (only shown when profile is clicked) */}
            {User && isProfileDropdownOpen && !isMobileMenuOpen && (
              <div className="profile-dropdown">
                <Link
                  href={`/profile/${User.uid}`}
                  className="profile-dropdown-item"
                >
                  Go to Profile
                </Link>
                <LogoutButton className="profile-dropdown-item" />
              </div>
            )}
          </li>

          {User && isProfileDropdownOpen && isMobileMenuOpen && (
            <li
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <Link
                href={`/profile/${User?.uid}`}
                className="profile-dropdown-item"
              >
                Go to Profile
              </Link>
              <LogoutButton className="profile-dropdown-item" />
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
