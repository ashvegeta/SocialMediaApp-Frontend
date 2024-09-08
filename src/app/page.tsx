"use client";

import { useGeneralAuth } from "@/lib/firebase";
import LogoutButton from "@/components/Logout";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useGeneralAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.email}!</h2>
          <Link href={`/profile/${user.uid}`}>Go to Profile</Link>
          <LogoutButton />
        </div>
      ) : (
        <p>Please log in to see more content.</p>
      )}
    </div>
  );
}
