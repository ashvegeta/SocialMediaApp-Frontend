"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, useGeneralAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For error message state
  const router = useRouter();
  const { user, loading } = useGeneralAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in successfully\n" + userCredential);
      router.push("/");
    } catch (error) {
      console.error("Error signing in: ", error);
      setErrorMessage("Invalid email or password. Please try again."); // Set error message
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (user) {
    router.push("/");
  } else {
    return (
      <div className="login-container">
        <div className="login-card">
          <h3 className="login-title">Welcome Back</h3>

          {/* Display error message if it exists */}
          {errorMessage && (
            <p className="login error-message">{errorMessage}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="login-button">
              Log In
            </button>
          </form>

          <p className="link-text">
            Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
          </p>
          <p className="link-text">
            Forgot Password? <Link href="/auth/reset">Reset</Link>
          </p>
        </div>
      </div>
    );
  }
};

export default LoginPage;
