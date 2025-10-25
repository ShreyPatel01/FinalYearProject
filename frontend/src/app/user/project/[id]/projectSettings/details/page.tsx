"use client";
import React, { useEffect, useState } from "react";
import ProjectSettingsNavbar from "@/src/app/components/userComponents/navbar/projectSettingsNavbar";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import fieldData from "../../../../../components/userComponents/createProjectModal/fieldOptions.json";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/16/solid";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import GetUserID from "@/src/helpers/getUserID";
import { useRouter } from "next/navigation";

const ProjectDetailsPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [projectID, setProjectID] = useState<string>("");
  const [oldProjectName, setOldProjectName] = useState<string>("");
  const [oldProjectDesc, setOldProjectDesc] = useState<string>("");
  const [oldProjectField, setOldProjectField] = useState<string>("");
  const [oldPrivacySetting, setOldPrivacySetting] = useState<
    boolean | undefined
  >(undefined);
  const [newPrivacySetting, setNewPrivacySetting] = useState<
    boolean | undefined
  >(undefined);
  const [newProjectName, setNewProjectName] = useState<string | null>(null);
  const [newProjectDesc, setNewProjectDesc] = useState<string | null>(null);
  const [inputtedField, setInputtedField] = useState<string | null>(null);
  const [newProjectField, setNewProjectField] = useState<string | null>(null);
  const [oldIsFinished, setOldIsFinished] = useState<boolean>(false);
  const [newIsFinished, setNewIsFinished] = useState<boolean | undefined>(
    undefined
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const userID = GetUserID();
  const router = useRouter();

  //Getting Project ID from URL
  useEffect(() => {
    if (typeof window !== undefined) {
      const pathname = window.location.pathname.split("/");
      const id = pathname[3];
      setProjectID(id);
    }
  }, []);

  //Getting details of project from database
  const getProjectDetails = async () => {
    if (projectID !== "") {
      try {
        const response = await axios.get(
          `/api/projects/settings/getProjectDetails?projectID=${projectID}`
        );
        if (response.data.success) {
          setOldProjectName(response.data.name);
          setOldProjectDesc(response.data.desc);
          setOldProjectField(response.data.field);
          setOldPrivacySetting(response.data.privacy);
          setOldIsFinished(response.data.isProjectFinished);
        }
      } catch (error: any) {
        toast.error("Unable to retrieve the project details, see console");
        console.error(error);
      }
    }
  };
  useEffect(() => {
    setLoading(true);
    getProjectDetails();
    setLoading(false);
  }, [projectID]);

  const fieldOptions = fieldData.fields.map((option) => {
    return (
      <option
        key={option.value}
        value={option.value}
        selected={option.value === oldProjectField}
        hidden={option.value === ""}
      >
        {option.label}
      </option>
    );
  });

  //Need to update the project with the new attibutes
  const updateProjectAttributes = async () => {
    try {
      const requestBody = {
        projectID: projectID,
        newName: newProjectName,
        newDesc: newProjectDesc,
        newPrivacy: newPrivacySetting,
        newField:
          newProjectField === "Other Field" ? inputtedField : newProjectField,
        newFinished: newIsFinished,
      };

      const response = await axios.put(
        `/api/projects/updateProjectAttributes/updateProjectDetails`,
        requestBody
      );
      if (response.data.success) {
        toast.success("Project has been updated");
        setNewPrivacySetting(undefined);
        setNewProjectDesc(null);
        setNewProjectField(null);
        setNewProjectName(null);
        setNewPrivacySetting(undefined);
        setNewIsFinished(undefined);
        setLoading(true);
        getProjectDetails();
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(`An error occurred while updating the thingy, check console`);
      console.error(error);
    }
  };

  //Deleting Project
  const deleteProject = async () => {
    try {
      const response = await axios.delete(`/api/projects/deleteProject`, {
        params: { projectID: projectID, userID: userID },
      });
      if (response.data.success) {
        toast.success(`Successfully deleted project`);
        router.replace(`/user/dashboard`);
      }
    } catch (error: any) {
      console.error(`Error deleting project: `, error);
      toast.error(`Error deleting project`);
    }
  };

  return (
    <>
      {projectID !== "" && <ProjectSettingsNavbar id={projectID} />}
      {loading === false && (
        <div className="flex flex-col min-h-screen w-screen bg-white text-black pt-40 px-80">
          <h1 className="text-black font-bold text-5xl mb-4 w-full text-center">
            Project Details
          </h1>
          {/* Project Privacy Setting */}
          <div className="flex flex-row w-full items-center justify-between mt-4">
            <div className="label">
              <span className="label-text text-black opacity-60 text-lg font-semibold">
                Private Project
              </span>
            </div>
            <div>
              <Switch
                checked={
                  newPrivacySetting !== undefined
                    ? newPrivacySetting
                    : oldPrivacySetting
                }
                onCheckedChange={(checked) => {
                  setNewPrivacySetting(checked);
                }}
              />
            </div>
          </div>
          {/* Project Finished Setting */}
          <div className="flex flex-row w-full items-cetner justify-between mt-4">
            <div className="label">
              <span className="label-text text-black opacity-60 text-lg font-semibold">
                Is Project Finished?
              </span>
            </div>
            <div>
              <Switch
                checked={
                  newIsFinished !== undefined ? newIsFinished : oldIsFinished
                }
                onCheckedChange={(checked) => {
                  setNewIsFinished(checked);
                }}
              />
            </div>
          </div>
          {/* Project Name Input Form */}
          <div className="label">
            <span className="label-text mt-3 text-black text-lg font-semibold opacity-60">
              Project Name
            </span>
          </div>
          <input
            type="text"
            value={newProjectName ? newProjectName : oldProjectName}
            className="input input-bordered bg-gray-50 w-full rounded-md text-black p-3"
            onChange={(e) => {
              if (newProjectName === oldProjectName) {
                setNewProjectName(null);
              } else {
                setNewProjectName(e.target.value);
              }
            }}
          />
          {/* Project Description Input Form */}
          <div className="label">
            <span className="label-text mt-3 text-black text-lg font-semibold opacity-60">
              Project Description
            </span>
          </div>
          <textarea
            value={newProjectDesc ? newProjectDesc : oldProjectDesc}
            className="textarea bg-gray-50 w-full rounded-md border-2 border-white text-black p-3"
            onChange={(e) => {
              if (newProjectDesc === oldProjectDesc) {
                setNewProjectDesc(null);
              } else {
                setNewProjectDesc(e.target.value);
              }
            }}
          />
          {/* Project Field Select Input Form */}
          <div className="label">
            <span className="label-text mt-3 text-black text-lg font-semibold opacity-60">
              Project Field
            </span>
          </div>
          <select
            className="select bg-gray-50 select-bordered w-full text-black"
            value={newProjectField ? newProjectField : oldProjectField}
            onChange={(e) => {
              if (newProjectField === oldProjectField) {
                setNewProjectField(null);
              } else {
                setNewProjectField(e.target.value);
              }
            }}
          >
            {fieldOptions}
          </select>
          {/* New Field Input Form - Only Appears When newProjectField is Other */}
          {newProjectField === "Other Field" && (
            <>
              <div className="label">
                <span className="label-text mt-3 text-black text-lg">
                  New Field
                </span>
              </div>
              <input
                type="text"
                placeholder="Please enter the new field"
                value={inputtedField ? inputtedField : ""}
                className="input input-bordered bg-gray-50 w-full rounded-md text-black p-3"
                onChange={(e) => {
                  if (inputtedField === oldProjectField) {
                    setInputtedField(null);
                  } else {
                    setInputtedField(e.target.value);
                  }
                }}
              />
            </>
          )}
          {/* Save Changes Button */}
          <div className="flex flex-row w-full justify-evenly mt-8">
            <Button
              className="btn bg-blue-600 hover:bg-blue-700 hover:border-none border-none text-white p-4 w-1/4 hover:underline"
              onClick={updateProjectAttributes}
              disabled={
                (newProjectField === "Other Field" && inputtedField === null) ||
                (newProjectName === null &&
                  newProjectDesc === null &&
                  newProjectField === null &&
                  newPrivacySetting === undefined &&
                  newIsFinished === undefined) ||
                newPrivacySetting === oldPrivacySetting || newIsFinished === oldIsFinished
              }
            >
              <CheckCircleIcon className="w-6 h-6 text-white -mt-1" />
              Save Changes
            </Button>
            <Popover open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
              <PopoverTrigger className="btn bg-red-600 hover:bg-red-700 hover:border-none border-none text-white p-4 w-1/4 hover:underline">
                {isOpen ? (
                  <>Are you sure?</>
                ) : (
                  <>
                    {" "}
                    <TrashIcon className="w-6 h-6 text-white -mt-1" />
                    Delete Project
                  </>
                )}
              </PopoverTrigger>
              <PopoverContent className="mt-2 bg-gray-200 text-center w-96">
                <p>
                  This action is irreversible and all your data and progress
                  will be lost.
                </p>
                <div className="flex flex-row justify-evenly mt-4">
                  <button
                    className="btn bg-red-600 hover:bg-red-700 hover:border-none border-none text-white p-4 hover:underline"
                    onClick={deleteProject}
                  >
                    Yes
                  </button>
                  <button
                    className="btn btn-neutral text-white hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    No
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" />
    </>
  );
};

export default ProjectDetailsPage;
