import React from "react";
import { Toaster } from "react-hot-toast";
import DashboardSidebar from "../../components/userComponents/dashboardSidebar/dashboardSidebar";
import DashboardNavbar from "../../components/userComponents/navbar/dashboardNavbar";
import AssignedTaskList from "../../components/userComponents/dashboard/assignedTaskList";

const userProfile = () => {
  return (
    <main>
      <DashboardNavbar />
      <div className="flex flex-row pt-2 px-24 min-h-screen bg-white text-black">
        {/* Project Sidebar */}
        <DashboardSidebar />
        {/* Assigned Tasks Card */}
        <div className="ml-4 mt-20 w-full">
          <AssignedTaskList />
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default userProfile;
