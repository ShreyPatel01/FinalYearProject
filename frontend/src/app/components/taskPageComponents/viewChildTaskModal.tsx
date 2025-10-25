import GetUserID from "@/src/helpers/getUserID";
import GetUsername from "@/src/helpers/getUsername";
import axios from "axios";
import React, { KeyboardEvent, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { PencilSquareIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { TrashIcon } from "@heroicons/react/16/solid";

interface ViewChildTaskModalProps {
  taskID: string;
  parentTaskName: string;
  onClose: () => void;
  role: string;
  projectID: string
}

const ViewChildTaskModal: React.FC<ViewChildTaskModalProps> = ({
  taskID,
  parentTaskName,
  onClose,
  role,
  projectID
}) => {
  //Creating States
  const [isEditing, setIsEditing] = useState(false);
  const [tempOldValues, setTempOldValues] = useState<string[]>([]);
  const [isTempOldValuesSet, setIsTempOldValuesSet] = useState(false);
  const [childTaskDetails, setChildTaskDetails] = useState({
    name: "",
    desc: "",
    creationDate: "",
    creator: "",
    creatorName: "",
    deadline: "",
    members: [] as string[],
    comments: [] as string[],
    categoryName: "",
    categoryColour: "",
    parentTaskID: "",
    parentTaskName: "",
    activityLog: [] as string[],
    status: ""
  });
  const [commentContent, setCommentContent] = useState("");
  const [checkDelete, setCheckDelete] = useState(false);
  //Creating variables to log changes made
  const allAttributes = ["taskName", "taskDesc", "taskDeadline"];
  let changedAttributes: string[] = [];
  let oldValues: string[] = [];
  let newValues: string[] = [];

  //Creating variables for user attributes
  const username = GetUsername();
  const userID = GetUserID();

  //Calling onClose so the modal can be reopened without having to click another card
  const handleClose = () => {
    setIsEditing(false);
    setCheckDelete(false);
    onClose();
  };

  //Stops dialog from closing and enables editing mode
  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    preventDefault(event);
    setIsEditing(true);
  };
  //Stops dialog from closing when button is pressed and checks for attribute
  //changes and saves changes to DB
  const handleSaveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    preventDefault(event);
    const formattedDeadline = formatDate();
    let tempNewValues = [
      childTaskDetails.name,
      childTaskDetails.desc,
      formattedDeadline,
    ];
    for (let index = 0; index < allAttributes.length; index++) {
      if (tempOldValues[index] !== tempNewValues[index]) {
        if (tempNewValues[index] !== "Invalid Date") {
          changedAttributes.push(allAttributes[index]);
          oldValues.push(tempOldValues[index]);
          newValues.push(tempNewValues[index]);
        }
      }
    }
    setIsEditing(false);
    for (let i = 0; i < changedAttributes.length; i++) {
      console.log(
        `The changed attribute is ${changedAttributes[i]}. The value was changed from "${oldValues[i]}" to "${newValues[i]}"`
      );
    }
    updateTaskDetails();
  };

  //Formatting Deadline to format dd/mm/yyyy, hh:mm am/pm
  const formatDate = () => {
    const newDeadline = childTaskDetails.deadline;
    const date = new Date(newDeadline);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return formattedDate;
  };

  //Loading the task details when the modal is opened
  useEffect(() => {
    const loadTaskDetails = async () => {
      const response = await axios.get(
        `/api/projects/showProjectAttributes/getTaskDetails?taskID=${taskID}`
      );
      setChildTaskDetails({
        ...childTaskDetails,
        name: response.data.taskName,
        desc: response.data.taskDesc,
        creationDate: response.data.creationDate,
        creator: response.data.taskCreator,
        creatorName: response.data.taskCreatorName,
        deadline: response.data.taskDeadline,
        members: response.data.taskMembers,
        comments: response.data.taskComments,
        categoryName: response.data.categoryName,
        categoryColour: response.data.taskBGColour,
        parentTaskID: response.data.parentTaskID,
        activityLog: response.data.activityLog,
        status: response.data.status
      });
    };
    loadTaskDetails();
  }, [taskID]);

  //Setting the old values for comparison when editing
  useEffect(() => {
    if (
      !isTempOldValuesSet &&
      childTaskDetails.name !== "" &&
      childTaskDetails.desc !== ""
    ) {
      setTempOldValues([
        childTaskDetails.name,
        childTaskDetails.desc,
        formatDate(),
      ]);
      setIsTempOldValuesSet(true);
    }
  }, [childTaskDetails, isTempOldValuesSet]);

  //Updating task with new values
  const updateTaskDetails = async () => {
    try {
      const requestBody = {
        taskID: taskID,
        username: username,
        changedAttributes: changedAttributes,
        oldAttributeValues: oldValues,
        newAttributeValues: newValues,
      };
      const response = await axios.put(`/api/projects/tasks/childTask`, {
        requestBody,
      });
      if (response.data.success) {
        toast.success(`Successfully updated ${childTaskDetails.name}`);
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

  //Creating new comment
  const createComment = async () => {
    try {
      const requestBody = {
        commentContent,
        userID,
        taskID,
        projectID
      };
      const response = await axios.post(
        `/api/projects/updateKanbanBoardAttributes/updateComment`,
        { requestBody }
      );
      if (response.data.success) {
        toast.success(
          `Successfully added a comment to ${childTaskDetails.name}`
        );
      }
    } catch (error: any) {
      toast.error("An error occurred while creating a comment");
      console.error(error);
    }
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

  //Prevents modal from closing when user presses delete button
  const preventDefault = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  //Deletes the child task
  const deleteChildTask = async () => {
    try {
      const nameOfOldTask = childTaskDetails.name;
      const requestBody = { childTaskID: taskID, username: username };
      const response = await axios.delete(`/api/projects/tasks/childTask`, {
        data: requestBody,
      });
      if (response.data.success) {
        toast.success(`Successfully deleted ${nameOfOldTask}`);
        closeDialogOnDeletion();
      }
    } catch (error: any) {
      toast.error(
        "An error occurred while deleting the child task, please check the console"
      );
      console.error(error);
    }
  };
  //For when the task is deleted
  const closeDialogOnDeletion = () => {
    const dialog = document.getElementById(
      "viewChildTaskModal"
    ) as HTMLDialogElement;
    if (dialog) {
      dialog.close();
    }
  };

  return (
    <dialog id="viewChildTaskModal" className="modal">
      <div className="flex modal-box bg-stone-100 w-11/12 max-w-7xl">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-black"
            onClick={handleClose}
          >
            ✕
          </button>
          {/* Modal Content */}
          <div className="flex flex-row w-[1386px] align-center justify-center">
            <div className="flex flex-col mt-3 w-full">
              <div className="flex flex-row w-full justify-between">
                <div className="flex flex-col justify-start">
                  {/* Task Name */}
                  {isEditing ? (
                    <input
                      type="text"
                      className="input input-bordered border-white text-white"
                      value={childTaskDetails.name}
                      onChange={(e) =>
                        setChildTaskDetails({
                          ...childTaskDetails,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-3xl font-bold mt-1.5 w-full">
                      {childTaskDetails.name}
                    </p>
                  )}
                  {/* Task Category */}
                  <p
                    className="text-white mt-4 p-3 rounded-md w-fit"
                    style={{ backgroundColor: childTaskDetails.categoryColour }}
                  >
                    {childTaskDetails.categoryName}
                  </p>
                </div>
                <div className="flex flex-col justify-end">
                  {(role === "CREATOR" || role === "ASSIGNEE") && (
                    <div className="flex flex-row justify-end mb-6">
                      {/* Delete Task Button */}
                      {!isEditing &&
                        (checkDelete ? (
                          <>
                            <button
                              className="btn bg-red-600 text-white justify-end mr-3 hover:bg-red-400 border-none"
                              onClick={deleteChildTask}
                            >
                              <TrashIcon className="w-4 h-4 text-white"/> Confirm Delete
                            </button>
                            <button
                              className="btn btn-neutral text-white justify-end mr-3"
                              onClick={() => {
                                setCheckDelete(false);
                              }}
                            >
                              <XCircleIcon className="w-4 h-4 text-white"/> Cancel Delete
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn border-none bg-red-600 text-white justify-end mr-3 hover:bg-red-400"
                            onClick={(e) => {
                              preventDefault(e);
                              setCheckDelete(true);
                            }}
                          >
                            <TrashIcon className="w-4 h-4 text-white" /> Delete
                            Child Task
                          </button>
                        ))}
                      {/* Edit Task Button */}
                      {!isEditing ? (
                        <>
                          {!checkDelete && (
                            <button
                              className="btn btn-neutral text-white justify-end mr-3"
                              onClick={handleEditClick}
                            >
                              <PencilSquareIcon className="w-4 h-4 text-white" />{" "}
                              Edit Child Task
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-info text-white justify-end mr-3"
                            onClick={handleSaveClick}
                          >
                            Save Task
                          </button>
                          {/* Cancel Edit Task */}
                          <button
                            className="btn btn-neutral text-white justify-end mr-3"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel Edit
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {/* Parent Task */}
                  <button className="p-2 bg-stone-200 justify-end rounded-md -mt-1">
                    Parent Task: {parentTaskName}
                  </button>
                </div>
              </div>
              {/* Task Description Accordion */}
              <div className="collapse bg-slate-400 mt-6">
                <input type="checkbox" name="my-accordion-1" />
                <div className="collapse-title text-xl font-medium text-white text-start">
                  Task Description
                </div>
                <div className="collapse-content text-start text-white">
                  {isEditing ? (
                    <textarea
                      value={childTaskDetails.desc}
                      className="textarea textarea-bordered border-white w-full h-36 text-sm"
                      onChange={(e) =>
                        setChildTaskDetails({
                          ...childTaskDetails,
                          desc: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p>{childTaskDetails.desc}</p>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto max-h-[700px] pb-4">
                {/* Activity Section */}
                <div className="flex justify-start mt-6">
                  <h2 className="font-bold text-2xl">Activity Log</h2>
                </div>
                <div className="mt-3 ">
                  {childTaskDetails.activityLog.length > 0 &&
                    childTaskDetails.activityLog.map((log, index) => (
                      <p
                        className="text-black w-full text-start text-lg"
                        key={index}
                      >
                        {log}
                      </p>
                    ))}
                </div>
                {/* Comment form */}
                {(role === "CREATOR" || role === "ASSIGNEE") && (
                  <div>
                    <div className="collapse collapse-arrow bg-slate-400 mt-6">
                      <input type="checkbox" name="my-accordion-2" />
                      <div className="collapse-title text-xl font-medium text-white text-start">
                        Add Comment
                      </div>
                      <div className="collapse-content">
                        <label className="form-control">
                          <div className="label">
                            <span className="label-text text-white text-lg">
                              Comment
                            </span>
                          </div>
                          <textarea
                            className="textarea textarea-bordered border-white border-2 text-lg h-24 text-white bg-base-100"
                            placeholder="Comment"
                            onChange={(e) => {
                              setCommentContent(e.target.value);
                              console.log(
                                "Comment content changed to: ",
                                e.target.value
                              );
                            }}
                          />
                        </label>
                        {/* Submit Comment button */}
                        <button
                          className="btn btn-info text-white mt-3 w-full"
                          onClick={createComment}
                        >
                          Submit Comment
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Other Details */}
            <div className="flex flex-col min-h-[440px] w-1/3 bg-slate-800 items-center justify-center mt-3 ml-3 rounded-md min-w-[300px]">
              <h1 className="font-bold text-2xl text-white text-center">Other Details</h1>
              {/* Creation Date */}
              <p className="flex text-white text-xl p-3 rounded-md justify-center w-full text-center">
                Creation Date: {childTaskDetails.creationDate}
              </p>
              {/* Task Creator */}
              <p className="text-white text-xl p-3 rounded-md w-full justify-center text-center">
                Task Creator: {childTaskDetails.creatorName}
              </p>
              {/* List of Members */}
              <div className="rounded-md w-full p-3 justify-center text-center">
                <h3 className="underline text-white text-xl mb-2">
                  List of Members Assigned
                </h3>
                <ul>
                  {childTaskDetails.members.map((member, index) => (
                    <li key={index} className="text-xl text-white">
                      {member}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Task Deadline */}
              {isEditing ? (
                <input
                  type="datetime-local"
                  className="input input-lg text-white rounded-md p-3 w-full justify-center text-xl text-center"
                  value={childTaskDetails.deadline}
                  onChange={(e) =>
                    setChildTaskDetails({
                      ...childTaskDetails,
                      deadline: e.target.value,
                    })
                  }
                />
              ) : (
                <p className="w-full justify-center text-xl text-white p-3 text-center">
                  Task Deadline: {childTaskDetails.deadline}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
      <Toaster position="bottom-right" />
    </dialog>
  );
};

export default ViewChildTaskModal;
