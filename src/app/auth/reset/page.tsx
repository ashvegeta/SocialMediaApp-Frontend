"use client";

import React, { useEffect, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, useGeneralAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const ResetPasswordPage = () => {
  const { user, loading } = useGeneralAuth(); // Use the custom auth hook
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect if the user is logged in
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      // Firebase function to send a password reset email
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Please check your inbox.");
      setEmail("");

      // Optional: Redirect to login page after a delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 5000); // Redirects to login page after 5 seconds
    } catch (error: any) {
      setError(
        error.message || "Failed to send reset email. Please try again."
      );
    }
  };

  // While checking for auth state, show a loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h3 className="reset-title">Reset Your Password</h3>
        <form onSubmit={handleSubmit} id="reset-form">
          <div className="form-group" id="reset-email">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <button type="submit" className="reset-button">
            Send Reset Email
          </button>
        </form>

        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <p className="link-text">
          Remember your password? <a href="/auth/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
