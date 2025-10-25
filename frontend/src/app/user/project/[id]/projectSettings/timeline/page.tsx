"use client";
import React, { useEffect, useState } from "react";
import ProjectSettingsNavbar from "@/src/app/components/userComponents/navbar/projectSettingsNavbar";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import DeleteSprintModal from "@/src/app/components/projectComponents/projectSettings/deleteSprintModal";
import CreateNewSprintModal from "@/src/app/components/projectComponents/projectSettings/createNewSprintModal";
import IndividualSprintInformation from "./individualSprintInformation";

interface Sprint {
  _id: string;
  sprintNo: number;
  startDate: string;
  endDate: string;
  sprintLength: number;
}

const ProjectTimelinePage = () => {
  const [projectID, setProjectID] = useState("");
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [dateInfoFetched, setDateInfoFetched] = useState(false);
  //Stores original project deadline
  const [projectDeadline, setProjectDeadline] = useState<Date | null>(null);
  //Stores inputted project deadline
  const [newProjectDeadline, setNewProjectDeadline] = useState<Date | null>(
    null
  );
  const [editProjectDeadline, setEditProjectDeadline] = useState(false);
  //Stores id of the sprint being edited
  const [sprintBeingEdited, setSprintBeingEdited] = useState<String | null>(
    null
  );
  const [currentSprintNo, setCurrentSprintNo] = useState<String | null>(null);
  //Stores id of the sprint that will be deleted
  const [sprintToDelete, setSprintToDelete] = useState<string | null>(null);
  const [sprintNoToDelete, setSprintNoToDelete] = useState<string | null>(null);
  //Used to differentiate between delete and create sprint modals
  const [modalType, setModalType] = useState("");
  const router = useRouter();

  //Getting Project ID from URL
  useEffect(() => {
    if (typeof window !== undefined) {
      const pathname = window.location.pathname.split("/");
      const id = pathname[3];
      setProjectID(id);
    }
  }, []);

  //Retrieving all sprint information and project deadline information from database
  const getDateInformation = async () => {
    if (projectID !== "") {
      try {
        const response = await axios.get(
          `/api/projects/showProjectAttributes/getProjectDates?projectID=${projectID}`
        );
        if (response.data.success) {
          setSprints(response.data.infoOfSprints);
          setProjectDeadline(new Date(response.data.projectDeadline));
          setDateInfoFetched(true);
        }
      } catch (error: any) {
        toast.error("Unable to retrieve the project details, see console");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (!dateInfoFetched) {
      getDateInformation();
    }
    if (modalType === "create") {
      const element = document.getElementById(
        "createNewSprintModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    } else if (modalType === "delete") {
      const element = document.getElementById(
        "deleteSprintModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    }
  }, [dateInfoFetched, getDateInformation, modalType]);

  const handleEditProjectDeadline = () => {
    if (sprintBeingEdited) {
      toast.error(
        `Finish editing sprint ${currentSprintNo} before you edit the project deadline`
      );
    } else {
      setEditProjectDeadline(true);
    }
  };

  const handleChosenToDeleteSprint = (id: any, sprintNo: any) => {
    if (sprintBeingEdited !== null || currentSprintNo !== null) {
      toast.error(
        `Finish editing sprint ${currentSprintNo} before trying to delete a sprint`
      );
    } else if (editProjectDeadline) {
      toast.error(
        "Finish editing the project deadline before trying to delete a sprint"
      );
    } else {
      setSprintToDelete(id);
      setSprintNoToDelete(sprintNo);
      setModalType("delete");
    }
  };

  const closeModal = () => {
    if (modalType === "delete") {
      setSprintNoToDelete(null);
      setSprintToDelete(null);
    }
    setModalType("");
    getDateInformation();
  };

  //Sends newProjectDeadline to database
  const changeProjectDeadline = async () => {
    try {
      //Assuming the user has changed the project deadline
      if (newProjectDeadline !== null) {
        if (sprints !== null && projectID !== null) {
          setEditProjectDeadline(false);
          const lastSprint = sprints[sprints.length - 1];
          const action = "updateProjectDeadline";
          const requestBody = {
            lastSprint,
            newProjectDeadline,
            projectID,
            action,
          };
          const response = await axios.put(
            `/api/projects/updateProjectAttributes/updateProjectTimeline`,
            requestBody
          );
          if (response.data.success) {
            toast.success("The project deadline has been updated");
            getDateInformation();
          }
        }
      } else {
        toast.error(
          `Please change the project deadline before trying to save a change`
        );
      }
    } catch (error: any) {
      console.error(error);
      setNewProjectDeadline(null);
      if (error.response) {
        //Gets error message from response
        const errorMessages = error.response.data && error.response.data.errors;
        //Checks if errorMessages has multiple objects
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((message) => {
            toast.error(message);
          });
          router.refresh();
        } else {
          toast.error(errorMessages);
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleEditSprint = (sprintID: string | null, sprintNo: number | null) => {
    setSprintBeingEdited(sprintID);
    sprintNo !== null ? setCurrentSprintNo(sprintNo.toString()) : setCurrentSprintNo(null)
  }

  return (
    <>
      {modalType === "delete" &&
        projectID !== "" &&
        sprintToDelete !== null &&
        sprintNoToDelete !== null && (
          <DeleteSprintModal
            projectID={projectID}
            sprintID={sprintToDelete}
            sprintNo={sprintNoToDelete}
            onClose={closeModal}
          />
        )}
      {modalType === "create" &&
        sprints.length !== 0 &&
        projectDeadline !== null &&
        projectID !== "" && (
          <CreateNewSprintModal
            onClose={closeModal}
            sprints={sprints}
            projectID={projectID}
            projectDeadline={projectDeadline}
          />
        )}
      <div className="flex flex-col min-h-screen w-screen bg-white items-center justify-center">
        {projectID !== "" && <ProjectSettingsNavbar id={projectID} />}
        <div className="flex-grow">
          {" "}
          <div className="flex flex-col mt-36 w-screen bg-white items-center justify-center">
            <h1 className="text-black font-bold text-5xl mb-4">Project Timeline</h1>
            <p className="text-black text-xl w-1/2 mb-4 text-center">
              You can change the dates of specific sprints or alter the
              project's deadline here. For more settings, please check the
              drawer.
            </p>
            {/* Project Deadline Section */}
            {projectDeadline && (
              <>
                <div className="flex flex-row justify-between w-1/2">
                  <h1 className="text-start w-1/2 text-2xl font-bold mt-4">
                    Project Deadline
                  </h1>
                  {editProjectDeadline ? (
                    <div>
                      <button
                        className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
                        onClick={() => {
                          changeProjectDeadline();
                        }}
                      >
                        <CheckCircleIcon className="w-5 h-5 text-white" /> Save
                      </button>
                      <button
                        className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white -mt-[3.5px] ml-4"
                        onClick={() => {
                          setEditProjectDeadline(false);
                        }}
                      >
                        <XCircleIcon className="w-5 h-5 text-white" /> Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white mb-4"
                        onClick={handleEditProjectDeadline}
                      >
                        <PencilSquareIcon className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex flex-col w-1/2">
                  <div className="divider -mt-4" />
                </div>
                <div className="flex flex-col w-1/2 mb-12">
                  <input
                    type="datetime-local"
                    className="input input-bordered bg-slate-50 p-4"
                    value={
                      newProjectDeadline
                        ? newProjectDeadline.toISOString().slice(0, 16)
                        : new Date(projectDeadline).toISOString().slice(0, 16)
                    }
                    onChange={(e) => {
                      setNewProjectDeadline(new Date(e.target.value + "Z"));
                      console.log(
                        `newProjectDeadline changed to ${e.target.value}`
                      );
                    }}
                    readOnly={!editProjectDeadline}
                  />
                </div>
              </>
            )}
            {/* Sprint Section */}
            {sprints.length > 0 &&
              sprints.map((sprint) => (
                <>
                  <IndividualSprintInformation
                    sprint={sprint}
                    sprintBeingEdited={sprintBeingEdited}
                    onEdit={handleEditSprint}
                    projectID={projectID}
                    onDelete={handleChosenToDeleteSprint}
                  />
                </>
              ))}
            {/* Create New Sprint Button */}
            <div className="mb-8">
              <button
                className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
                onClick={() => setModalType("create")}
              >
                Create New Sprint
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
};

export default ProjectTimelinePage;
