"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, useGeneralAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignUpPage = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  // const LOCAL_STORAGE_KEY = String(process.env.NEXT_PUBLIC_LOCAL_USER_KEY);
  const { user, loading } = useGeneralAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      console.log(error);
      return;
    }

    try {
      // Create a new user with email and password using Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // If user creation is successful, send additional data to backend
      const userId = userCredential.user.uid; // Firebase generated user ID

      const response = await fetch(
        process.env.NEXT_PUBLIC_APPENGINE_URL + "/user/add",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UserId: userId,
            UserName: username,
            EmailId: email,
          }),
        }
      );

      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to save user data to the backend");
      }

      // add to localstorage and push to protected page router
      // localStorage.setItem(
      //   LOCAL_STORAGE_KEY,
      //   JSON.stringify(userCredential.user)
      // );

      // If successful, clear the form and display a success message
      setEmail("");
      setPassword("");
      setUsername("");
      setConfirmPassword("");
      console.log("User signed up successfully:", userCredential.user);
      router.push("/preferences");
    } catch (err: any) {
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
      setError(err.message);
      console.error("Error signing up:", err);
    }
  };

  if (loading) {
    return <div>loading...</div>;
  }

  if (user) {
    router.push("/");
  } else {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <h2 className="signup-title">Sign Up</h2>
          <form onSubmit={handleSubmit} id="signup-form">
            <div className="form-group" id="signup-username">
              <label> User Name </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // placeholder="Username"
                required
                className="form-input"
              />
            </div>

            <div className="form-group" id="signup-email">
              <label> Email </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // placeholder="Email"
                required
                className="form-input"
              />
            </div>

            <div className="form-group" id="signup-password">
              <label> Password </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // placeholder="Password"
                required
                className="form-input"
              />
            </div>

            <div className="form-group" id="signup-confirm-password">
              <label> Confirm Password </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                // placeholder="Confirm Password"
                required
                className="form-input"
              />
            </div>
            <button className="signup-button" type="submit">
              Sign Up
            </button>
          </form>

          <p className="link-text">
            Have an account? <Link href="/auth/login">Login</Link>
          </p>
        </div>
      </div>
    );
  }
};

export default SignUpPage;
