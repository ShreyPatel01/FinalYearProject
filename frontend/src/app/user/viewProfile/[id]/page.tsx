import React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import ViewProfileContent from "./viewProfileContent";
import DashboardNavbar from "@/src/app/components/userComponents/navbar/dashboardNavbar";

const ViewProfilePage = () => {

  return (
    <main className="flex flex-col w-screen min-h-screen bg-white">
      <DashboardNavbar />
      <div className="w-full">
        <ViewProfileContent />
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default ViewProfilePage;
