"use client";

import React, { useEffect, useState } from "react";
import GetUserID from "@/src/helpers/getUserID";
import { TemplateKanbanBoard } from "../../components/projectComponents/projectTemplate/templateKanbanBoard";
import { UseTemplateModal } from "../../components/projectComponents/projectTemplate/useTemplateModal";
import { ChangeTemplateModal } from "../../components/projectComponents/projectTemplate/changeTemplateModal";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import DashboardNavbar from "../../components/userComponents/navbar/dashboardNavbar";

export default function viewProjectTemplate() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [modalType, setModalType] = useState("");
  const userID = GetUserID();
  useEffect(() => {
    if (typeof window !== undefined) {
      const Project = window.location.search.split("=")[1].replace(/%20/g, " ");
      setProjectName(Project);
    }
    console.log("Project from URL: ", projectName);
  }, [projectName]);

  useEffect(() => {
    if (modalType === "useTemplate") {
      const element = document.getElementById(
        "useTemplateModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    } else if (modalType === "changeProject") {
      const element = document.getElementById(
        "changeTemplateModal"
      ) as HTMLDialogElement;
      setTimeout(() => {
        element.showModal();
      }, 50);
    }
  }, [modalType]);

  const closeModal = () => {
    setModalType("");
  };

  const handleNewTemplate = (newProjectName: string) => {
    if (projectName !== newProjectName) {
      router.push(`/user/viewProjectTemplate?project=${newProjectName}`);
      toast.success(`Please refresh the page`);
    }
  };

  return (
    <>
      {modalType === "useTemplate" && (
        <UseTemplateModal
          defaultProjectName={projectName}
          creatorID={userID}
          onClose={closeModal}
        />
      )}
      {modalType === "changeProject" && (
        <ChangeTemplateModal
          userID={userID}
          onClose={closeModal}
          onTemplateChange={handleNewTemplate}
        />
      )}
      <div className="bg-white w-screen min-h-screen flex flex-1">
        <DashboardNavbar />
        <div className="flex flex-col pt-2 pr-32 pl-16 min-h-screen w-full bg-white text-black">
          {projectName !== "" && projectName !== null && (
            <TemplateKanbanBoard projectName={projectName} />
          )}
          <div className="flex flex-row form-control mt-2 justify-end w-full pl-7">
            <label className="label cursor-pointer justify-end">
              <span className="label-text text-black text-xl text-end">
                Do you want to use this template?
              </span>
            </label>
            <button
              className="btn btn-info text-white w-fit ml-4 text-lg"
              onClick={() => {
                setModalType("useTemplate");
              }}
            >
              Yes
            </button>
            <button
              className="btn bg-red-600 border-none text-white w-fit ml-4 text-lg hover:bg-red-700"
              onClick={() => {
                setModalType("changeProject");
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
