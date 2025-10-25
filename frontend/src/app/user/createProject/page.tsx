"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import DashboardNavbar from "@/src/app/components/userComponents/navbar/dashboardNavbar";
import { Switch } from "@/components/ui/switch";

const CreateProjectPage = () => {
  //Setting up variables
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editedFields, setEditedFields] = useState(false);
  const [
    manuallyChangedEstimatedCompletion,
    setManuallyChangedEstimatedCompletion,
  ] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    projectName: "",
    projectDescription: "",
    field: "",
    numberOfSprints: "",
    averageSprintLength: "",
    estimatedCompletion: "",
    members: "",
    privateProject: false,
  });

  const createProject = async () => {
    try {
      console.log(projectDetails);
      const response = await axios.post(
        "/api/projects/createProject",
        projectDetails
      );
      console.log(projectDetails);
      console.log("Successfully Created Project", response.data);
      toast.success("Successfully Created Project");
      const queryString = response.data.savedProject._id;
      console.log(queryString);
      setTimeout(() => {
        router.push(`/user/project/${queryString}`);
      }, 150);
    } catch (error: any) {
      if (error.response) {
        console.log(projectDetails);
        console.log(error);
        //Checks if the error has a response object
        if (error.response) {
          //Gets error message from response
          const errorMessages =
            error.response.data && error.response.data.errors;
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
    }
  };

  //Retrieving variables from URL
  useEffect(() => {
    const field = searchParams.get("field") || "";
    const project = searchParams.get("project") || "";
    const members = searchParams.get("members") || "";

    //Updates projectDetails if necessary
    const updateProjectDetails = (newDetails: any) => {
      setProjectDetails((prevDetails) => {
        if (
          JSON.stringify(prevDetails) !== JSON.stringify(newDetails) &&
          !editedFields
        ) {
          setEditedFields(true);
          return newDetails;
        } else {
          return prevDetails;
        }
      });
    };

    //Updates projectDetails from URL if the form fields are empty or haven't been edited
    if (
      projectDetails.field === "" ||
      projectDetails.projectName === "" ||
      projectDetails.members === ""
    ) {
      updateProjectDetails({
        projectName: project,
        projectDescription: "",
        field: field,
        numberOfSprints: "",
        averageSprintLength: "",
        estimatedCompletion: "",
        members: members,
      });
    }
  }, [searchParams, projectDetails, editedFields]);

  //Calculating the estimated completion date based off the values in
  //the "number of sprints" and "average sprint length" input forms
  useEffect(() => {
    if (projectDetails.numberOfSprints && projectDetails.averageSprintLength) {
      const totalDays =
        parseInt(projectDetails.numberOfSprints) *
        parseInt(projectDetails.averageSprintLength);
      const estimatedDeadline = new Date();
      estimatedDeadline.setDate(estimatedDeadline.getDate() + totalDays);

      //Getting the current time
      const currentHours = estimatedDeadline
        .getHours()
        .toString()
        .padStart(2, "0");
      const currentMinutes = estimatedDeadline
        .getMinutes()
        .toString()
        .padStart(2, "0");

      // Format the date to match datetime-local format
      const newEstimatedCompletion = `${
        estimatedDeadline.toISOString().split("T")[0]
      }T${currentHours}:${currentMinutes}`;

      // Update projectDetails only when newEstimatedCompletion is different
      if (
        projectDetails.estimatedCompletion !== newEstimatedCompletion &&
        !manuallyChangedEstimatedCompletion
      ) {
        setProjectDetails((prevDetails) => ({
          ...prevDetails,
          estimatedCompletion: newEstimatedCompletion,
        }));
      }
    }
  }, [projectDetails, manuallyChangedEstimatedCompletion]);
  return (
    <main className="bg-white w-screen min-h-screen">
      <DashboardNavbar />
      <div className="flex flex-col pt-16 mx-60">
        <p className="font-bold mt-12 text-2xl w-full text-center">
          Project Creation
        </p>
        {/* Private Project Switch */}
        <div className="flex flex-row w-full justify-between mt-4">
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
          <Switch
            className="mt-6"
            onClick={() => {
              const changePrivate = !projectDetails.privateProject;
              setProjectDetails({
                ...projectDetails,
                privateProject: changePrivate,
              });
              console.log(`thingy changed to ${changePrivate}`);
            }}
          />
        </div>
        {/* Project Name Input Form */}
        <div className="justify-center w-full mt-4">
          <div className="label">
            <span className="label-text text-black opacity-60 font-semibold text-xl">
              Project Name
            </span>
          </div>
          <input
            type="text"
            defaultValue={projectDetails.projectName}
            className="input input-bordered input-lg text-black bg-slate-50 w-full"
            onChange={(e) =>
              setProjectDetails({
                ...projectDetails,
                projectName: e.target.value,
              })
            }
          />
        </div>
        {/* Project Description Input Form */}
        <div className="justify-cetner w-full mt-4">
          <div className="label">
            <span className="label-text text-black opacity-60 font-semibold text-xl">
              Project Description
            </span>
          </div>
          <textarea
            className="textarea textarea-bordered p-2 h-24 text-black bg-slate-50 w-full text-lg"
            placeholder="A brief description of the project"
            onChange={(e) =>
              setProjectDetails({
                ...projectDetails,
                projectDescription: e.target.value,
              })
            }
          />
        </div>
        {/* Field Input Form */}
        <div className="justify-center w-full mt-4">
          <div className="label">
            <span className="label-text text-black font-semibold opacity-60 text-xl">
              Project Field
            </span>
          </div>
          <input
            type="text"
            defaultValue={projectDetails.field}
            className="input input-bordered input-lg text-black bg-slate-50 w-full"
            onChange={(e) =>
              setProjectDetails({ ...projectDetails, field: e.target.value })
            }
          />
        </div>
        {/* Number of Sprints Input Form */}
        <div className="justify-center w-full mt-4">
          <div className="label">
            <span className="label-text text-black font-semibold opacity-60 text-xl">
              Average Sprint Length
            </span>
          </div>
          <input
            type="text"
            placeholder="Number of Sprints"
            value={projectDetails.numberOfSprints}
            className="input input-bordered input-lg text-black bg-slate-50 w-full"
            onChange={(e) =>
              setProjectDetails({
                ...projectDetails,
                numberOfSprints: e.target.value,
              })
            }
          />
        </div>
        {/* Average Sprint Length Input Form */}
        <div className="justify-center w-full mt-4">
          <div className="label">
            <span className="label-text text-black font-semibold opacity-60 text-xl">
              Average Sprint Length
            </span>
          </div>
          <input
            type="text"
            placeholder="Average Sprint Length In Days"
            value={projectDetails.averageSprintLength}
            className="input input-bordered input-lg text-black bg-slate-50 w-full"
            onChange={(e) =>
              setProjectDetails({
                ...projectDetails,
                averageSprintLength: e.target.value,
              })
            }
          />
        </div>
        {/* Estimated Completion Date Input Form */}
        {projectDetails.numberOfSprints &&
          projectDetails.averageSprintLength && (
            <div className="justify-center w-full mt-4">
              <div className="label">
                <span className="label-text text-black font-semibold opacity-60 text-xl">
                  Estimated Completion Date
                </span>
              </div>
              <input
                type="datetime-local"
                className="input input-bordered input-lg text-black bg-slate-50 w-full"
                value={projectDetails.estimatedCompletion}
                onChange={(e) => {
                  setProjectDetails({
                    ...projectDetails,
                    estimatedCompletion: e.target.value,
                  });
                  setManuallyChangedEstimatedCompletion(true);
                }}
              />
            </div>
          )}
        {/* Create Project button */}
        <div className="justify-center w-full mt-4 pb-8">
          <button
            className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none text-white hover:underline justify-center w-full"
            onClick={createProject}
            disabled={
              projectDetails.averageSprintLength.trim().length === 0 ||
              projectDetails.estimatedCompletion.trim().length === 0 ||
              projectDetails.field.trim().length === 0 ||
              projectDetails.numberOfSprints.trim().length === 0 ||
              projectDetails.projectDescription.trim().length === 0 ||
              projectDetails.projectName.trim().length === 0
            }
          >
            Create Project
          </button>
        </div>
      </div>
    </main>
  );
};

export default CreateProjectPage;
