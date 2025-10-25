import Project from "@/src/models/projectModel";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Sprint {
  _id: string;
  sprintNo: number;
  startDate: string;
  endDate: string;
  sprintLength: number;
}

interface CreateNewSprintModalProps {
  onClose: () => void;
  sprints: Sprint[];
  projectID: string;
  projectDeadline: Date;
}
const CreateNewSprintModal: React.FC<CreateNewSprintModalProps> = ({
  onClose,
  sprints,
  projectID,
  projectDeadline,
}) => {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [newSprintLength, setNewSprintLength] = useState<string | null>(null);
  const [newProjectDeadline, setNewProjectDeadline] = useState<Date | null>(
    null
  );

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

  //Calculating the new start and end dates and new sprint length
  const calculateDefaultValues = (selectedSprint: Sprint | null) => {
    if (selectedSprint !== null) {
      const sprintLength = 14;
      setNewSprintLength("14");
      //Calculate the new start date
      const startDate = new Date(selectedSprint.endDate);
      setNewStartDate(new Date(selectedSprint.endDate));
      //Calculate the end date
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + sprintLength);
      setNewEndDate(endDate);
      setNewProjectDeadline(
        new Date(projectDeadline.getTime() + sprintLength * 24 * 60 * 60 * 1000)
      );
    }
  };

  const updateSprintLength = (
    newStartDate: Date,
    newEndDate: Date,
    newSprintLength: string
  ) => {
    if (newStartDate && newEndDate) {
      const sprintLength = parseInt(newSprintLength);
      if (isNaN(sprintLength)) {
        // Handle invalid sprintLength here
        console.error("Invalid sprint length provided");
        return;
      }

      const diffInDays = Math.round(
        (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 3600 * 24)
      );
      if (diffInDays !== sprintLength) {
        setNewSprintLength(diffInDays.toString());
        setNewProjectDeadline(
          new Date(projectDeadline.getTime() + diffInDays * 24 * 60 * 60 * 1000)
        );
      }
    }
  };

  const updateSprintEndDate = (newSprintLength: string) => {
    if (newStartDate) {
      const sprintLength = parseInt(newSprintLength);
      const startDate = new Date(newStartDate + "Z");
      const endDate = new Date(startDate + "Z");
      endDate.setDate(startDate.getDate() + sprintLength);
      if (!newEndDate || endDate.getTime() !== newEndDate.getTime()) {
        setNewEndDate(endDate);
      }
      setNewProjectDeadline(
        new Date(projectDeadline.getTime() + sprintLength + "Z")
      );
    }
  };

  const createNewSprint = async () => {
    try {
      if (
        newStartDate !== null &&
        newEndDate !== null &&
        newSprintLength !== null &&
        newProjectDeadline !== null &&
        projectID !== null &&
        selectedSprint !== null
      ) {
        const requestBody = {
          newStartDate,
          newEndDate,
          newSprintLength,
          newProjectDeadline,
          projectID,
          selectedSprint,
        };
        const response = await axios.post(
          `/api/projects/updateProjectAttributes/updateProjectTimeline`,
          requestBody
        );
        if (response.data.success) {
          toast.success(`New Sprint has been created`);
          onClose();
        }
      }
    } catch (error: any) {
      console.error(error);
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

  return (
    <>
      <dialog className="modal" id="createNewSprintModal">
        <div className="modal-box bg-slate-50">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-black"
              onClick={onClose}
            >
              ✕
            </button>
          </form>
          <h1 className="text-2xl font-bold text-center w-full mb-1">
            Create A New Sprint
          </h1>
          <p className="text-center">Fill out the forms below to create a new sprint</p>
          {/* Sprint Select Form */}
          <div className="label">
            <span className="label-text font-semibold mt-4 text-black text-lg">
              Select the sprint that the new sprint will follow
            </span>
          </div>
          <select
            className="select select-bordered bg-slate-50 w-full"
            onChange={(e) => {
              const selectedSprintId = e.target.value;
              const selectedSprint = sprints.find(
                (sprint) => sprint._id === selectedSprintId
              );
              setSelectedSprint(selectedSprint || null);
              calculateDefaultValues(selectedSprint || null);
            }}
          >
            <option value="" disabled selected>
              Choose a sprint
            </option>
            {sprints.map((sprint, index) => (
              <option key={index} value={sprint._id}>
                Sprint {sprint.sprintNo}
              </option>
            ))}
          </select>
          {selectedSprint !== null && (
            <>
              {/* Start Date */}
              {newStartDate !== null && (
                <>
                  <div className="label">
                    <span className="label-text font-semibold mt-4 text-black text-lg">
                      New Start Date
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    className="input input-bordered bg-slate-50 w-full text-black"
                    value={new Date(newStartDate).toISOString().slice(0, 16)}
                    onChange={(e) => {
                      setNewStartDate(new Date(e.target.value + "Z"));
                      console.log(`newStartDate changed to ${e.target.value}`);
                      if (
                        newStartDate !== null &&
                        newEndDate !== null &&
                        newSprintLength !== null
                      ) {
                        if (!isNaN(parseInt(newSprintLength))) {
                          updateSprintLength(
                            new Date(e.target.value),
                            newEndDate,
                            newSprintLength
                          );
                        }
                      }
                    }}
                  />
                </>
              )}
              {/* End Date */}
              {newEndDate !== null && (
                <>
                  <div className="label">
                    <span className="label-text font-semibold mt-4 text-black text-lg">
                      New End Date
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    className="input input-bordered bg-slate-50 w-full text-black"
                    value={
                      newEndDate ? newEndDate.toISOString().slice(0, 16) : ""
                    }
                    onChange={(e) => {
                      setNewEndDate(new Date(e.target.value + "Z"));
                      console.log(`newEndDate changed to ${e.target.value}`);
                      if (
                        newStartDate !== null &&
                        newEndDate !== null &&
                        newSprintLength !== null
                      ) {
                        if (!isNaN(parseInt(newSprintLength))) {
                          updateSprintLength(
                            newStartDate,
                            new Date(e.target.value),
                            newSprintLength
                          );
                        }
                      }
                    }}
                  />
                </>
              )}
              {/* Sprint Length */}
              {newSprintLength !== null && (
                <>
                  <div className="label">
                    <span className="label-text font-semibold mt-4 text-black text-lg">
                      New Sprint Length (days)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="input input-bordered bg-slate-50 w-full text-black"
                    value={newSprintLength}
                    onChange={(e) => {
                      const newSprintLengthValue = e.target.value;
                      setNewSprintLength(newSprintLengthValue);
                      console.log(
                        `newSprintLength changed to ${newSprintLengthValue}`
                      );
                      if (!isNaN(parseInt(newSprintLengthValue))) {
                        updateSprintEndDate(newSprintLengthValue);
                        setNewProjectDeadline(
                          new Date(
                            projectDeadline.getTime() +
                              parseInt(newSprintLengthValue) *
                                24 *
                                60 *
                                60 *
                                1000
                          )
                        );
                      }
                    }}
                  />
                </>
              )}
              {/* New Project Deadline */}
              {newProjectDeadline !== null && (
                <>
                  <div className="label">
                    <span className="label-text font-semibold mt-4 text-black text-lg">
                      New Project Deadline
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    className="input input-bordered bg-slate-50 w-full"
                    value={
                      newProjectDeadline
                        ? newProjectDeadline.toISOString().slice(0, 16)
                        : ""
                    }
                    readOnly
                  />
                </>
              )}
              {/* Create New Sprint Button */}
              <div className="flex w-full justify-center">
                <button
                  className="btn bg-blue-600 hover:bg-blue-700 text-white border-none hover:border-none mt-4"
                  onClick={createNewSprint}
                >
                  Finalise Creation
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
      <Toaster position="bottom-right" />
    </>
  );
};

export default CreateNewSprintModal;
