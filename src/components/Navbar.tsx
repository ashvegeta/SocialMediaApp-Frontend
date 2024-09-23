import React, { useState } from "react";
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

const Navbar: React.FC<{ User: User | null; profilePicUrl?: string }> = ({
  User,
  profilePicUrl,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [userId, setuserId] = useState(UID);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
          <li>
            {User ? (
              <Link href={`profile/${User.uid}`} className="navbar-item">
                {isMobileMenuOpen ? "Profile" : <FaUserCircle size={24} />}
              </Link>
            ) : (
              <Link href="/auth/login" className="navbar-item">
                {isMobileMenuOpen ? "Login" : <IoLogIn size={24} />}
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
