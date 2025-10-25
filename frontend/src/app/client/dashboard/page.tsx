import React from "react";
import DashboardNavbar from "../../components/userComponents/navbar/dashboardNavbar";
import DashboardSidebar from "../../components/userComponents/dashboardSidebar/dashboardSidebar";
import AllProjectAnalytics from "./projectAnalytics";
import { Toaster } from "react-hot-toast";

const page = () => {
  return (
    <div className="min-h-screen w-screen bg-white text-black">
      <DashboardNavbar />
      <div className="flex flex-row pt-2 px-24 min-h-screen bg-white text-black">
        {/* Lists the client's projects */}
        <DashboardSidebar />
        {/* Analytics for client's projects */}
        <AllProjectAnalytics />
      </div>
      <Toaster position = 'bottom-right'/>
    </div>
  );
};

export default page;
