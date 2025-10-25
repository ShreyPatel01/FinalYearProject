"use client";
import ProjectSettingsNavbar from "@/src/app/components/userComponents/navbar/projectSettingsNavbar";
import { usePathname } from "next/navigation";
import React from "react";
import MemberTable from "./MemberTable";
import { Toaster } from "react-hot-toast";

const ProjectRoleSettingsPage = () => {
  const projectID = usePathname().split("/")[3];

  return (
    <div className="w-screen min-h-screen bg-white flex flex-col">
      <ProjectSettingsNavbar id={projectID} />
      <div className="mt-24 flex w-full px-24 items-center justify-center">
        {/* Table of Members with Actions */}
        <MemberTable projectID={projectID} />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ProjectRoleSettingsPage;
