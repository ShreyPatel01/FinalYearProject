"use client";
import UnauthenticatedNavbar from "../components/indexPage/unauthenticatedNavbar";
import axios from "axios";
import Link from "next/link";

import React, { useCallback, useEffect, useState } from "react";

export default function VerifyEmail() {
  const [token, setToken] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState(false);

  const verifyUserEmail = useCallback(async () => {
    try {
      await axios.put("/api/account/verifyEmail", { token });
      setEmailVerified(true);
    } catch (error: any) {
      setError(true);
      console.error(error.response.data);
    }
  },[token])

  useEffect(() => {
    const tokenFromURL = window.location.search.split("=")[1];
    console.log(tokenFromURL);
    setToken(tokenFromURL || "");
  }, []);

  useEffect(() => {
    if (token.length > 0) {
      verifyUserEmail();
    }
  }, [token, verifyUserEmail]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white">
        <UnauthenticatedNavbar />
        <h1 className="text-4xl font-bold">Email Verification</h1>
        {emailVerified && (
          <div>
            <h2 className="mt-4">
              Your email has been verified. You can click the link below to
              login to your account
            </h2>
            <div className="flex pt-4 justify-center">
              <Link href="/login">
                <button className="btn btn-active text-white">Login</button>
              </Link>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4">
            <h2>
              There&apos;s been some kind of error, please try to create your account
              again
            </h2>
            <div className="flex justify-center mt-4">
              <Link href="/signup">
                <button className="btn btn-active text-white">Signup</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
