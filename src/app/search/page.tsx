"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useGeneralAuth } from "@/lib/firebase";
import { useNotificationCount } from "@/lib/notificationsCount";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clickedSearch, setClickedSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useGeneralAuth(); // Get the authenticated user
  const notificationCount = useNotificationCount();

  const connectUser = async (UID: string) => {};

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return; // Don't search if input is empty

    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      // Make request to backend search API
      const response = await fetch(
        process.env.NEXT_PUBLIC_APPENGINE_URL +
          `/search?UserName=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching users: ", err);
      setError("Failed to search users.");
    } finally {
      setClickedSearch(true);
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar User={user} notificationCount={notificationCount} />
      <div className="search-page-container">
        <h2 className="search-heading">Search Users</h2>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>

        {loading && <Loading />}
        {error && <p>{error}</p>}

        {searchResults.length > 0 ? (
          <ul className="search-results">
            {searchResults.map((user: any, index: number) => (
              <li key={index} className="search-result-item">
                <div className="search-result-card">
                  <Link href={`/profile/${user.UID}`}>
                    {user.ProfilePicture ? (
                      <img
                        src={user.ProfilePicture}
                        alt="User profile"
                        className="search-result-avatar"
                      />
                    ) : (
                      <div className="search-result-icon">
                        <FaUserCircle size={90} color="gray" />
                      </div>
                    )}
                  </Link>
                  <div className="search-result-info">
                    <p className="search-result-username">{user.UserName}</p>
                    <p className="search-result-email">{user.EmailId}</p>
                    <p className="search-result-visibility">
                      {user.Visibility}
                    </p>
                    <button
                      className="connect-button"
                      onClick={() => connectUser(user.UID)}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !loading && clickedSearch && <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
