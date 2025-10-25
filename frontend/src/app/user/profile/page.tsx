import React from "react";
import DashboardNavbar from "../../components/userComponents/navbar/dashboardNavbar";
import ProfileContent from "./profileContent";
import { Toaster } from "react-hot-toast";

const ProfilePage = () => {
  return (
    <main className="flex flex-col w-screen min-h-screen bg-white">
      <DashboardNavbar />
      <div className="w-full">
        <ProfileContent />
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default ProfilePage;
