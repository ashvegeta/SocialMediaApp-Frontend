"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, useGeneralAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { user, loading } = useGeneralAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Firebase function to sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in successfully\n" + userCredential);
      localStorage.setItem(
        "appid:authUser",
        JSON.stringify(userCredential.user)
      );
      router.push("/");
    } catch (error) {
      localStorage.removeItem("appid:authUser");
      console.log("Error signing in " + error);
    }
  };

  if (loading) {
    return <div>loading...</div>;
  }

  if (user) {
    router.push("/");
  } else {
    return (
      <div>
        <h3>login page</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>

        <p className="link-text">
          Don't have an account? <Link href="/auth/signup">Sign up</Link>
        </p>
      </div>
    );
  }
};

export default page;
