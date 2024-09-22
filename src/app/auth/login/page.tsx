"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, useGeneralAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      console.log("Error signing in " + error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    router.push("/");
  } else {
    return (
      <div className="login-container">
        <div className="login-card">
          <h3 className="login-title">Welcome Back</h3>

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
