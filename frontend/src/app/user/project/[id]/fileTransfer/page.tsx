import ProjectNavbar from "@/src/app/components/userComponents/navbar/projectNavbar";
import React from "react";
import FileTable from "./fileTable";
import { Toaster } from "react-hot-toast";

const FileTransferPage = () => {
  return (
    <main>
      <ProjectNavbar />
      <div className="flex flex-row pt-24 px-24 min-h-screen bg-white text-black">
        <div className="flex w-full justify-center">
          <FileTable />
        </div>
      </div>
      <Toaster position="bottom-right"/>
    </main>
  );
};

export default FileTransferPage;
