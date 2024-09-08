"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust the path to your firebase config
import { useParams } from "next/navigation";

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = String(useParams().id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!id) return; // No ID available
        const docRef = doc(db, "users", id); // Firestore collection 'users' and document 'id'
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data()); // Set profile data
        } else {
          console.log("No such user profile exists!");
          setError("User profile not found");
        }
      } catch (error: any) {
        console.log("Error fetching user profile: ", error);
        setError("Failed to fetch user profile " + id);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>User Profile</h2>
      {profile ? (
        <div>
          <p>
            {console.log(profile)}
            <strong>Username:</strong> {profile.UserName}
          </p>
          <p>
            <strong>Email:</strong> {profile.EmailId}
          </p>
          <p>
            <strong>Visibility:</strong> {profile.Visibility}
          </p>
        </div>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default ProfilePage;
