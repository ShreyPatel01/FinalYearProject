"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface UseTemplateModalProps {
  defaultProjectName: string;
  creatorID: string;
  onClose: () => void;
}

export const UseTemplateModal: React.FC<UseTemplateModalProps> = ({
  defaultProjectName,
  creatorID,
  onClose,
}) => {
  const [projectUserInputs, setProjectUserInputs] = useState({
    projectName: "",
    projectDesc: "",
    projectDeadline: "",
    privateProject: false,
  });
  const router = useRouter();
  const createProjectFromTemplate = async () => {
    let projectName = projectUserInputs.projectName;
    if (projectUserInputs.projectName === "") {
      projectName = defaultProjectName;
    }
    const projectDesc = projectUserInputs.projectDesc;
    try {
      const requestBody = {
        defaultProjectName,
        creatorID,
        projectName,
        projectDesc,
      };
      const response = await axios.post(
        `/api/projects/createProjectFromTemplate`,
        { requestBody }
      );
      if (response.data.success) {
        toast.success(`Successfully created the project ${projectName}`);
        const newProjectID = response.data.newProjectID;
        setTimeout(() => {
          router.push(`/user/project/${newProjectID}`);
        }, 150);
      }
    } catch (error: any) {
      console.error("An error occurred", error);
      //Checks if the error has a response object
      if (error.response) {
        //Gets error message from response
        const errorMessages = error.response.data && error.response.data.errors;
        //Checks if errorMessages has multiple objects
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((message) => {
            toast.error(message);
          });
        } else {
          toast.error(errorMessages);
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  //Handling when the user exits by pressing escape instead of the X button
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    // Add the event listener when the component mounts
    document.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener
    );
    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener
      );
    };
  }, [onClose]);

  return (
    <dialog id="useTemplateModal" className="modal">
      <div className="modal-box bg-slate-50 max-w-xl">
        <form method="dialog">
          <button
            className="btn btn-md btn-circle btn-ghost absolute right-2 top-2 text-black"
            onClick={handleClose}
          >
            ✕
          </button>
        </form>
        <h1 className="font-bold text-2xl text-center text-black">
          Create A New Project
        </h1>
        <p className="text-lg text-black text-center mt-4">
          Fill out the forms below to create your new project
        </p>
        {/* Private Project Switch*/}
        <div className="flex flex-row justify-between w-full mt-4">
          {/* Labels */}
          <div className="flex flex-col">
            <div className="label">
              <span className="label-text text-black opacity-60 font-semibold text-xl">
                Private Project?
              </span>
            </div>
            <div className="label -mt-1">
              <span className="label-text text-black opacity-60 font-semibold">
                If set to private, this project will not appear in your
                portfolio.
              </span>
            </div>
          </div>
          {/* Switch */}
          <Switch
            className="mt-6"
            onClick={() => {
              const changePrivate = !projectUserInputs.privateProject;
              setProjectUserInputs({
                ...projectUserInputs,
                privateProject: changePrivate,
              });
              console.log(`thingy changed to ${changePrivate}`);
            }}
          />
        </div>
        {/* Task Name Input Form */}
        <div className="label">
          <span className="label-text mt-3 text-black font-bold">
            Project Name
          </span>
        </div>
        <input
          type="text"
          defaultValue={defaultProjectName}
          className="input w-full rounded-md border-2 border-white text-white p-3"
          onChange={(e) => {
            setProjectUserInputs({
              ...projectUserInputs,
              projectName: e.target.value,
            });
          }}
        />
        <div className="label">
          <span className="label-text mt-3 text-black font-bold">
            Project Description
          </span>
        </div>
        <textarea
          placeholder="A brief description of the project"
          className="textarea textarea-bordered textarea-lg border-white border-2 w-full h-36 text-white text-sm"
          onChange={(e) => {
            console.log("Task Description Input Changed:", e.target.value);
            setProjectUserInputs({
              ...projectUserInputs,
              projectDesc: e.target.value,
            });
          }}
        />
        <div className="flex justify-center mt-3 w-full">
          <button
            className="btn btn-info text-white"
            onClick={createProjectFromTemplate}
          >
            Create Project
          </button>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </dialog>
  );
};
