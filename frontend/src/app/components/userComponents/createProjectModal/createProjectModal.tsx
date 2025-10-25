"use client";
import React, { useEffect, useState } from "react";
import fieldData from "./fieldOptions.json";
import projectData from "./projectOptions.json";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import GetUserID from "@/src/helpers/getUserID";

const CreateProjectModal = () => {
  //Setting up variables
  const userID = GetUserID();
  const router = useRouter();
  const [fullProjectOptions] = useState({
    field: "",
    project: "",
    members: "",
  });
  type ProjectDataKeys = keyof typeof projectData;
  const [projectModalStep, setProjectModalStep] = useState(1);
  const [chosenField, setChosenField] = useState<ProjectDataKeys>(
    "Software Engineering and IT"
  );
  const [chosenProject, setChosenProject] = useState("");
  const [templateCheck, setTemplateCheck] = useState(false);
  const [projectOptions, setProjectOptions] = useState<React.ReactElement[]>(
    []
  );

  //Options for field list
  const fieldOptions = fieldData.fields.map((option, index) => {
    return (
      <option
        key={option.value}
        value={option.value}
        disabled={index === 0}
        selected={index === 0}
        hidden={index === 0}
      >
        {option.label}
      </option>
    );
  });

  const sendToCreationPage = async () => {
    try {
      const finalProjectOptions = {
        ...fullProjectOptions,
        field: chosenField,
        project: chosenProject,
        members: userID,
      };
      console.log(finalProjectOptions);
      const response = await axios.post(
        "/api/projects/sendToProjectPage",
        finalProjectOptions
      );
      console.log("Sending to next page", response.data);
      toast.success("Generating project form page");
      const queryString = new URLSearchParams(
        Object.entries(finalProjectOptions)
      ).toString();
      console.log(queryString);
      setTimeout(() => {
        router.push(`/user/createProject?${queryString}`);
      }, 150);
    } catch (error: any) {
      console.log(error);
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

  useEffect(() => {
    if (chosenField) {
      const chosenFieldProjects = projectData[chosenField] || [];
      const options = chosenFieldProjects.map((option: any, index: number) => {
        return (
          <option
            key={option.value}
            value={option.value}
            disabled={index === 0}
            selected={index === 0}
            hidden={index === 0}
          >
            {option.label}
          </option>
        );
      });
      setProjectOptions(options);
    }
  }, [chosenField]);

  const handleProjectModalStepChange = (step: any) => {
    setProjectModalStep(step);
  };

  //Testing - Remove this later
  useEffect(() => {
    console.log(userID);
    console.log(chosenField);
    if (chosenField) {
      console.log(chosenProject);
    }
    if (chosenField && chosenProject) {
      console.log(fullProjectOptions);
    }
  }, [chosenField, chosenProject, fullProjectOptions, userID]);

  return (
    <dialog id="createProjectModal" className="modal">
      <div className="modal-box bg-slate-50">
        <form method="dialog">
          <button className="btn btn-md btn-circle btn-ghost absolute right-2 top-2 text-black">
            ✕
          </button>
        </form>
        <ul className="steps justify-center pb-4 w-full">
          <li
            className={`step ${
              projectModalStep === 1 ? "step-info" : ""
            } text-black`}
            onClick={() => handleProjectModalStepChange(1)}
          >
            Choose Field
          </li>
          <li
            className={`step ${
              projectModalStep === 2 ? "step-info" : ""
            } text-black mr-8`}
          >
            Choose Project
          </li>
        </ul>
        {/* Create Project Modal Step 1 Content */}
        {projectModalStep === 1 && (
          <div>
            <select
              className="select bg-slate-700 select-bordered w-full text-white"
              value={chosenField}
              onChange={(e) =>
                setChosenField(e.target.value as ProjectDataKeys)
              }
            >
              {fieldOptions}
            </select>
            <div className="flex justify-center">
              <button
                className="flex flex-col mt-4 btn bg-blue-600 hover:bg-blue-700 text-white border-none hover:border-none"
                onClick={() => handleProjectModalStepChange(2)}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {/* Create Project Modal Step 2 Content */}
        {projectModalStep === 2 && (
          <div>
            <select
              className="select select-bordered w-full bg-slate-700 text-white"
              onChange={(e) => setChosenProject(e.target.value)}
            >
              {projectOptions}
            </select>
            <div>
              <div className="form-control mt-2">
                <label className="label cursor-pointer">
                  <span className="label-text text-black">
                    Tick the checkbox if you want to use a template
                  </span>
                  <input
                    type="checkbox"
                    className="checkbox border-stone-400 border-2"
                    checked={templateCheck}
                    onChange={(e) => setTemplateCheck(e.target.checked)}
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="flex flex-col btn bg-blue-600 hover:bg-blue-700 text-white border-none hover:border-none"
                onClick={() => handleProjectModalStepChange(1)}
              >
                Back
              </button>
              {templateCheck ? (
                <button
                  className="flex flex-col btn bg-blue-600 hover:bg-blue-700 text-white border-none hover:border-none ml-4"
                  onClick={() => {router.replace(`/user/viewProjectTemplate?project=${chosenProject}`)}}
                >
                  View Template
                </button>
              ) : (
                <button
                  className="flex flex-col btn bg-blue-600 hover:bg-blue-700 text-white border-none hover:border-none ml-4"
                  onClick={sendToCreationPage}
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </dialog>
  );
};

export default CreateProjectModal;
