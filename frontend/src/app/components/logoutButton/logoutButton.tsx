"use client";
import React from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();
  const logout = async () => {
    try {
      await axios.get("/api/account/logout");
      toast.success("Successfully logged out");
      setTimeout(() => {
        router.push("/login");
      }, 100);
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <main>
      <button className="text-black w-full" onClick={logout}>
        Logout
      </button>
    </main>
  );
};
export default LogoutButton;
