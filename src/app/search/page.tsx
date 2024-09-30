"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { db, useGeneralAuth } from "@/lib/firebase";
import { useNotificationCount } from "@/lib/notificationsCount";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import Loading from "@/components/Loading";
import { doc, getDoc } from "firebase/firestore";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clickedSearch, setClickedSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useGeneralAuth(); // Get the authenticated user
  const notificationCount = useNotificationCount();

  // New state to hold connection statuses
  const [connectionStatuses, setConnectionStatuses] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (clickedSearch && searchResults.length > 0) {
      fetchConnectionStatuses();
    }
  }, [searchResults, clickedSearch]);

  useEffect(() => {
    if (!user) return;

    // Initial fetch of connection statuses when user is available
    fetchConnectionStatuses();
  }, [user]);

  const fetchConnectionStatuses = async () => {
    const statuses = await Promise.all(
      searchResults.map(async (currUser) => {
        return {
          UID: currUser.UID,
          status: await checkConnectionStatus(currUser),
        };
      })
    );

    // Create a mapping of UID to connection status
    const statusMap = statuses.reduce((acc, { UID, status }) => {
      acc[UID] = status;
      return acc;
    }, {} as Record<string, string>);

    setConnectionStatuses(statusMap);
  };

  const connectUser = async (UID: string) => {
    try {
      // Update the local "Pending" status immediately
      const updatedResults = searchResults.map((result) =>
        result.UID === UID ? { ...result, connectionStatus: "Pending" } : result
      );
      setSearchResults(updatedResults);

      // Now send the connection request to the server
      const response = await fetch(
        process.env.NEXT_PUBLIC_APPENGINE_URL + "/conn/request",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            From: user?.uid,
            To: UID,
            ConnStatus: "pending",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send connection request.");
      }

      // Update the connectionStatuses state to reflect the new status
      setConnectionStatuses((prev) => ({
        ...prev,
        [UID]: "Pending",
      }));
    } catch (err) {
      console.error("Error connecting to user: ", err);

      // If there's an error, revert the status back to "Connect" if needed
      const updatedResults = searchResults.map((result) =>
        result.UID === UID ? { ...result, connectionStatus: "Connect" } : result
      );
      setSearchResults(updatedResults);
    }
  };

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
      setClickedSearch(true); // Set clicked search to true
    } catch (err) {
      console.error("Error searching users: ", err);
      setError("Failed to search users.");
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async (currUser: any) => {
    if (!user?.uid) return "No Connection"; // If no authenticated user

    const userDocRef = doc(db, "users", user.uid); // Firestore doc for the authenticated user
    const userDocSnap = await getDoc(userDocRef);
    let pending = false;

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      pending = userData.Pending?.some(
        (pending: any) => pending.To === currUser.UID
      );
    }

    if (currUser.Friends?.includes(user?.uid)) {
      return "Connected";
    } else if (pending) {
      return "Pending";
    } else {
      return "No Connection";
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
            {searchResults.map((user: any, index: number) => {
              return (
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

                      {connectionStatuses[user.UID] === "Connected" ? (
                        <p className="status connected">Already Connected</p>
                      ) : connectionStatuses[user.UID] === "Pending" ? (
                        <p className="status pending">Request Pending</p>
                      ) : (
                        <button
                          className="connect-button"
                          onClick={() => connectUser(user.UID)}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          !loading && clickedSearch && <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
