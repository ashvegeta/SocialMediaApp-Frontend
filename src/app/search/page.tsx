"use client";

import React, { useState } from "react";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Search Users</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username..."
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {searchResults.length > 0 ? (
        <ul>
          {searchResults.map((user: any, index: number) => (
            <li key={index}>
              <p>{user.EmailId}</p>
              <p>{user.UserName}</p>
              <p>{user.Visibility}</p>
              <p>{JSON.stringify(user.Posts)}</p>
              <br />
              <br />
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No users found.</p>
      )}
    </div>
  );
};

export default SearchPage;
