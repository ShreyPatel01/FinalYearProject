import {
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Sprint {
  _id: string;
  sprintNo: number;
  startDate: string;
  endDate: string;
  sprintLength: number;
}

interface IndividualSprintInformationProps {
  sprint: Sprint;
  sprintBeingEdited: String | null;
  onEdit: (id: string | null, sprintNo: number | null) => void;
  projectID: string;
  onDelete: (id: string | null, sprintNo: number | null) => void;
}

const IndividualSprintInformation: React.FC<
  IndividualSprintInformationProps
> = ({ sprint, sprintBeingEdited, onEdit, projectID, onDelete }) => {
  //State to check whether sprint is in view mode or edit mode
  const [editingSprint, setEditingSprint] = useState(false);
  //States to store original sprint values
  const [originalStartDate, setOriginalStartDate] = useState<Date | null>(null);
  const [originalEndDate, setOriginalEndDate] = useState<Date | null>(null);
  const [originalSprintLength, setOriginalSprintLength] = useState<
    string | null
  >(null);
  //States to store new sprint values
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [newSprintLength, setNewSprintLength] = useState<string | null>(null);

  //Sets all states required for edit mode for sprint
  const handleEditSprint = (
    originalStartDate: Date,
    originalEndDate: Date,
    originalSprintLength: number,
    sprintID: string,
    sprintNo: number
  ) => {
    setEditingSprint(true);
    setOriginalStartDate(originalStartDate);
    setOriginalEndDate(originalEndDate);
    setOriginalSprintLength(originalSprintLength.toString());
    onEdit(sprintID, sprintNo);
  };

  //Updates newSprintLength to make sure it matches the difference in days between newStartDate and newEndDate
  const updateSprintLength = (
    startDate: any,
    endDate: any,
    lengthOfSprint: any
  ) => {
    if (startDate && endDate) {
      const sprintLength = parseInt(lengthOfSprint);
      if (isNaN(sprintLength)) {
        console.log("Invalid sprint length provided");
        return;
      }

      const diffInDays = Math.round(
        (endDate.getTime() - startDate.getTime()) / (24 * 3600000)
      );
      if (diffInDays !== sprintLength) {
        setNewSprintLength(diffInDays.toString());
      }
    }
  };

  //Updates newEndDate to make sure the difference in days between the start date and end date matches newSprintLength
  const updateSprintEndDate = (startDate: any, newSprintLength: string) => {
    const sprintLength = parseInt(newSprintLength);
    const updatedStartDate = new Date(startDate + "Z");
    const updatedEndDate = new Date(updatedStartDate + "Z");
    updatedEndDate.setDate(updatedStartDate.getDate() + sprintLength);
    if (!newEndDate || updatedEndDate.getTime() !== newEndDate.getTime()) {
      setNewEndDate(updatedEndDate);
    }
  };

  //Saves all changes made to sprint in database
  const updateSprints = async () => {
    try {
      let requestBody: Record<string, any> = {};
      //Creating an array for variables to add to requestBody that could be null
      const variablesToAddToRequestBody: Record<
        string,
        { newValue: any; originalValue: any }
      > = {
        startDate: {
          newValue: newStartDate,
          originalValue: originalStartDate,
        },
        endDate: { newValue: newEndDate, originalValue: originalEndDate },
        sprintLength: {
          newValue: newSprintLength,
          originalValue: originalSprintLength,
        },
      };
      for (const key in variablesToAddToRequestBody) {
        const { newValue, originalValue } = variablesToAddToRequestBody[key];
        requestBody[key] = newValue === null ? originalValue : newValue;
      }
      //Check if all values of requestBody[key].newValue were null and display toast error
      const allNewValuesNull = Object.values(variablesToAddToRequestBody).every(
        (item) => item.newValue === null
      );

      if (allNewValuesNull) {
        toast.error(
          `You have to change something in the sprint before saving the changes.`
        );
        return;
      }

      requestBody["selectedSprintID"] = sprintBeingEdited;
      requestBody["projectID"] = projectID;
      requestBody["action"] = "updateSprints";
      const response = await axios.put(
        `/api/projects/updateProjectAttributes/updateProjectTimeline`,
        requestBody
      );
      if (response.data.success) {
        setOriginalStartDate(null);
        setOriginalEndDate(null);
        setOriginalSprintLength(null);
        onEdit(null, null);
        toast.success("The sprints have successfully been updated");
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

  //Clears all states to return to view mode for sprint
  const handleCancelEdit = () => {
    setEditingSprint(false);
    setOriginalStartDate(null);
    setOriginalEndDate(null);
    setOriginalSprintLength(null);
    setNewStartDate(null);
    setNewEndDate(null);
    setNewSprintLength(null);
    onEdit(null, null);
  };

  return (
    <div key={sprint._id} className="w-1/2 ">
      <div className="flex flex-row justify-between">
        <p className="justify-start w-1/2 text-2xl font-bold mt-4">
          Sprint {sprint.sprintNo}
        </p>
        {/* Sprint Options */}
        <div>
          {sprint._id === sprintBeingEdited ? (
            <>
              <button
                className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
                onClick={() => {
                  setEditingSprint(false);
                  updateSprints();
                }}
              >
                <CheckCircleIcon className="w-5 h-5 text-white" /> Save
              </button>
              <button
                className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white -mt-[3.5px] ml-4"
                onClick={() => {
                  handleCancelEdit();
                }}
              >
                <XCircleIcon className="w-5 h-5 text-white" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
                onClick={() =>
                  handleEditSprint(
                    new Date(sprint.startDate),
                    new Date(sprint.endDate),
                    sprint.sprintLength,
                    sprint._id,
                    sprint.sprintNo
                  )
                }
              >
                <PencilSquareIcon className="w-5 h-5 text-white" /> Edit
              </button>
              <button className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white -mt-[3.5px] ml-4"
              onClick={() => onDelete(sprint._id, sprint.sprintNo)}>
                <TrashIcon className="w-5 h-5 text-white" /> Delete
              </button>
            </>
          )}
        </div>
      </div>
      {/* Divider */}
      <div className="flex flex-col w-full -mt-3">
        <div className="divider" />
      </div>
      {/* Sprint Start Date Section */}
      <div className="flex flex-col w-full mb-2">
        {/* Start Date Label */}
        <div className="label">
          <span className="label-text text-black font-bold text-lg">
            Start Date
          </span>
        </div>
        {/* Start Date Input Form */}
        <input
          type="datetime-local"
          className="input input-bordered bg-slate-50 p-4 w-full"
          value={
            newStartDate
              ? newStartDate.toISOString().slice(0, 16)
              : new Date(sprint.startDate).toISOString().slice(0, 16)
          }
          readOnly={sprint._id !== sprintBeingEdited || !editingSprint}
          onChange={(e) => {
            setNewStartDate(new Date(e.target.value + "Z"));
            let endDate =
              newEndDate !== null ? newEndDate : new Date(sprint.endDate);
            let sprintLength =
              newSprintLength !== null
                ? newSprintLength
                : sprint.sprintLength.toString();
            updateSprintLength(new Date(e.target.value), endDate, sprintLength);
          }}
        />
      </div>
      {/* Sprint End Date Section */}
      <div>
        {/* End Date Label */}
        <div className="label">
          <span className="label-text text-black font-bold text-lg">
            End Date
          </span>
        </div>
        {/* End Date Input Form */}
        <input
          type="datetime-local"
          className="input input-bordered bg-slate-50 p-4 w-full"
          value={
            newEndDate
              ? newEndDate.toISOString().slice(0, 16)
              : new Date(sprint.endDate).toISOString().slice(0, 16)
          }
          readOnly={sprint._id !== sprintBeingEdited || !editingSprint}
          onChange={(e) => {
            setNewEndDate(new Date(e.target.value + "Z"));
            let startDate =
              newStartDate !== null ? newStartDate : new Date(sprint.startDate);
            let sprintLength =
              newSprintLength !== null
                ? newSprintLength
                : sprint.sprintLength.toString();
            updateSprintLength(
              startDate,
              new Date(e.target.value),
              sprintLength
            );
          }}
        />
      </div>
      {/* Sprint Length Section */}
      <div>
        {/* Sprint Length Label */}
        <div className="label">
          <span className="label-text text-black font-bold text-lg">
            Sprint Length (days)
          </span>
        </div>
        {/* Sprint Length Input Form */}
        <input
          type="text"
          className="input input-bordered bg-slate-50 p-4 mb-8 w-full"
          value={
            newSprintLength ? newSprintLength : sprint.sprintLength.toString()
          }
          onChange={(e) => {
            if(e.target.value) {
                setNewSprintLength(e.target.value);
                let startDate =
                  newStartDate !== null ? newStartDate : new Date(sprint.startDate);
                updateSprintEndDate(startDate, e.target.value);
            } else {
                setNewSprintLength("0");
                let startDate =
                  newStartDate !== null ? newStartDate : new Date(sprint.startDate);
                updateSprintEndDate(startDate, "0");
            }
          }}
          readOnly={sprint._id !== sprintBeingEdited || !editingSprint}
        />
      </div>
    </div>
  );
};

export default IndividualSprintInformation;
