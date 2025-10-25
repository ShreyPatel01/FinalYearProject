import React from "react";
import ProjectSidebar from "@/src/app/components/projectComponents/projectSidebar/projectSidebar";
import { Toaster } from "react-hot-toast";
import ProjectNavbar from "@/src/app/components/userComponents/navbar/projectNavbar";
import ProjectDetailsCard from "@/src/app/components/projectComponents/projectDashboard/projectDetailsCard";
import ClientDetailsCard from "@/src/app/components/projectComponents/projectDashboard/clientDetailsCard";
import IssueCard from "./issueCard";

const ProjectPage = () => {
  return (
    <main>
      <ProjectNavbar />
      <div className="flex flex-row pt-2 px-24 min-h-screen bg-white text-black">
        <ProjectSidebar />
        {/* Details about Project */}
        <div className='flex flex-col h-full w-1/3 ml-8 mt-20'>
          <ProjectDetailsCard />
          <ClientDetailsCard />
        </div>
        {/* Issue Ticket Card */}
        <div className='h-full ml-8 mt-20 w-2/3'>
          <IssueCard/>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default ProjectPage;
