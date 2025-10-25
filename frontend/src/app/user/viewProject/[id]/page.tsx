import React from "react";
import DashboardNavbar from "@/src/app/components/userComponents/navbar/dashboardNavbar";
import ViewProjectSidebar from "./viewProjectSidebar";
import { Toaster } from "react-hot-toast";
import ViewIssueBoard from "./viewIssueBoard";

const ViewProjectPage = () => {
  return (
    <main>
      <DashboardNavbar />
      <div className="flex flex-row pt-2 px-24 min-h-screen bg-white text-black w-screen">
        <div className="w-fit p-2">
          <ViewProjectSidebar />
        </div>
        {/* Project Issue Board  */}
        <div className="flex flex-grow w-full">
          <ViewIssueBoard />
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default ViewProjectPage;
