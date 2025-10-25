"use client";
import ChildTaskCard from "@/src/app/components/taskPageComponents/childTaskCard";
import CreateChildTaskModal from "@/src/app/components/taskPageComponents/createChildTaskModal";
import ViewChildTaskModal from "@/src/app/components/taskPageComponents/viewChildTaskModal";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  CheckCircleIcon,
  PencilSquareIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { TrashIcon } from "@heroicons/react/16/solid";
import GetUsername from "@/src/helpers/getUsername";
import GetUserID from "@/src/helpers/getUserID";
import ProjectNavbar from "@/src/app/components/userComponents/navbar/projectNavbar";
import { useRouter } from "next/navigation";
import { TaskStatus } from "@/src/models/enums/status";
import ChangeSprintModal from "./changeSprintModal";
import Link from "next/link";

const TaskPage = () => {
  const [specifiedChildTaskID, setSpecifiedChildTaskID] = useState("");
  const [modalType, setModalType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempOldValues, setTempOldValues] = useState<string[]>([]);
  const [isTempOldValuesSet, setIsTempOldValuesSet] = useState(false);
  const [categoryIDs, setCategoryIDs] = useState<string[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [projectID, setProjectID] = useState("");
  const [taskID, setTaskID] = useState("");
  const [areCategoryDetailsSet, setAreCategoryDetailsSet] = useState(false);
  const [projectMembers, setProjectMembers] = useState<string[]>([]);
  const [hasFetchedMembers, setHasFetchedMembers] = useState(false);
  const [checkDelete, setCheckDelete] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [role, setRole] = useState("");
  const [taskDetails, setTaskDetails] = useState({
    name: "",
    desc: "",
    creationDate: "",
    creator: "",
    creatorName: "",
    deadline: "",
    members: [] as string[],
    comments: [] as string[],
    categoryID: "",
    categoryName: "",
    categoryColour: "",
    childTasks: [] as string[],
    childTaskNames: [] as string[],
    activityLogs: [] as string[],
    status: "",
  });

  //created for activity log
  const username = GetUsername();
  const userID = GetUserID();
  //setting up variables for comparison
  const editableAttributes = [
    "taskName",
    "taskDesc",
    "category",
    "taskMembers",
    "taskDeadline",
    "status",
  ];
  let changedAttributes: string[] = [];
  let oldValues: string[] = [];
  let newValues: string[] = [];
  //Setting up variable for redirect
  const router = useRouter();
  //Setting up for select status form
  const taskStatusList = [
    TaskStatus.NOTSTARTED,
    TaskStatus.STARTED,
    TaskStatus.TESTING,
    TaskStatus.FINISHED,
    TaskStatus.OVERDUE,
  ];
  const loadTaskDetails = async () => {
    const response = await axios.get(
      `/api/projects/showProjectAttributes/getTaskDetails?taskID=${taskID}`
    );
    setTaskDetails({
      ...taskDetails,
      name: response.data.taskName,
      desc: response.data.taskDesc,
      creationDate: response.data.creationDate,
      creator: response.data.taskCreator,
      creatorName: response.data.taskCreatorName,
      deadline: response.data.taskDeadline,
      members: response.data.taskMembers,
      comments: response.data.taskComments,
      categoryID: response.data.categoryID,
      categoryName: response.data.categoryName,
      categoryColour: response.data.taskBGColour,
      childTasks: Array.isArray(response.data.childTaskIDs)
        ? response.data.childTaskIDs
        : [],
      childTaskNames: Array.isArray(response.data.childTasks)
        ? response.data.childTasks
        : [],
      activityLogs: response.data.activityLog,
      status: response.data.status,
    });
    setRole(response.data.role);
  };
  //UseEffect for fetching everything needed on page load
  useEffect(() => {
    //Getting details from URL

    if (typeof window !== undefined) {
      setProjectID(window.location.pathname.split("/")[3]);
      setTaskID(window.location.pathname.split("/")[5]);
    }
    //Fetching task details based off taskID in URL
    if (taskID !== "") {
      loadTaskDetails();
    }

    //Retrieving sprint category names and colours for select category form when editing
    if (taskID !== "" && !areCategoryDetailsSet) {
      const loadCategories = async () => {
        try {
          const response = await axios.get(
            `/api/projects/tasks/originalTask/getCategoryDetails?taskID=${taskID}`
          );
          setCategoryNames(response.data.names);
          setCategoryIDs(response.data.ids);
        } catch (error: any) {
          toast.error(
            "An error occurred while retrieving the categories, please see the console"
          );
          console.error(
            "An error occured while retrieving the categories ",
            error
          );
        }
      };
      loadCategories();
      setAreCategoryDetailsSet(true);
    }

    if (!hasFetchedMembers && projectID !== "") {
      //Retrieving list of project members
      const getProjectMembers = async () => {
        const response = await axios.get(
          `/api/projects/showProjectAttributes/getMembers?id=${projectID}`
        );
        if (response.data.success) {
          setProjectMembers(response.data.usernames);
          setHasFetchedMembers(true);
        }
      };
      getProjectMembers();
    }

    //Checking for modalType and displaying different modals
    if (modalType === "createChild") {
      const element = document.getElementById(
        "createChildTaskModal"
      ) as HTMLDialogElement;
      if (element && !element.open) {
        // Check if the dialog is not already open
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    } else if (modalType === "viewChild") {
      const element = document.getElementById(
        "viewChildTaskModal"
      ) as HTMLDialogElement;
      if (element && !element.open) {
        // Check if the dialog is not already open
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    } else if (modalType === "changeSprint") {
      const element = document.getElementById(
        "changeSprintModal"
      ) as HTMLDialogElement;
      if (element && !element.open) {
        // Check if the dialog is not already open
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    }
  }, [modalType, taskID, projectID, hasFetchedMembers, role]);

  console.log(`Task role: ${role}`);

  //Formatting Deadline to dd/mm/yyyy, hh:mm am/pm
  const formatDeadline = () => {
    const newDeadline = taskDetails.deadline;
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

  //Setting up old values for comparison when editing values
  if (!isTempOldValuesSet && taskDetails.name !== "") {
    console.log("Setting up temp values...");
    setTempOldValues([
      taskDetails.name,
      taskDetails.desc,
      taskDetails.categoryID,
      taskDetails.members.join(", "),
      formatDeadline(),
      taskDetails.status,
    ]);
    console.log(
      "Temp old Values: ",
      taskDetails.name,
      taskDetails.desc,
      taskDetails.categoryID,
      taskDetails.members.join(", "),
      formatDeadline(),
      taskDetails.status
    );
    setIsTempOldValuesSet(true);
  }

  //Creating new comment
  const createComment = async () => {
    try {
      const requestBody = {
        commentContent,
        userID,
        taskID,
        projectID,
      };
      const response = await axios.post(
        `/api/projects/updateKanbanBoardAttributes/updateComment`,
        { requestBody }
      );
      if (response.data.success) {
        toast.success(`Successfully added a comment to ${taskDetails.name}`);
        setCommentContent("");
      }
    } catch (error: any) {
      toast.error("An error occurred while creating a comment");
      console.error(error);
    }
  };

  //Checks if the values have changed
  const handleSave = () => {
    const formattedDeadline = formatDeadline();
    let tempNewValues = [
      taskDetails.name,
      taskDetails.desc,
      taskDetails.categoryID,
      taskDetails.members.join(", "),
      formattedDeadline,
      taskDetails.status,
    ];
    console.log(`temp new values: ${tempNewValues}`);
    console.log(`temp old values: ${tempOldValues}`);
    for (let i = 0; i < editableAttributes.length; i++) {
      if (tempOldValues[i] !== tempNewValues[i]) {
        if (tempNewValues[i] !== "Invalid Date") {
          changedAttributes.push(editableAttributes[i]);
          oldValues.push(tempOldValues[i]);
          newValues.push(tempNewValues[i]);
        }
      }
    }
    setIsEditing(false);
    updateTaskDetails();
  };

  //Updating Task Details
  const updateTaskDetails = async () => {
    try {
      const requestBody = {
        taskID: taskID,
        username: username,
        changedAttributes: changedAttributes,
        oldAttributeValues: oldValues,
        newAttributeValues: newValues,
        action: "updateAnyAttributes",
        projectID: projectID,
      };
      const response = await axios.put(
        `/api/projects/updateKanbanBoardAttributes/updateTask`,
        requestBody
      );
      if (response.data.success) {
        toast.success(`Successfully updated ${taskDetails.name}`);
        loadTaskDetails();
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

  //Handles task member selection and changing taskDetails.members
  const handleMembersChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMembers = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setTaskDetails((prevDetails) => ({
      ...prevDetails,
      members: selectedMembers,
    }));
  };

  //close the modal and reset modaltype and specifiedchildtaskid states
  const closeModal = () => {
    setModalType("");
    setSpecifiedChildTaskID("");
    setIsEditing(false);
    loadTaskDetails();
  };

  //Deleting the task
  const deleteTask = async () => {
    if (taskID) {
      try {
        const response = await axios.delete(
          `/api/projects/tasks/originalTask/deleteTask`,
          { params: { taskID: taskID } }
        );
        if (response.data.success) {
          toast.success(`Successfully deleted the task`);
          router.replace(`/user/project/${projectID}`);
        }
      } catch (error: any) {
        console.error("Error deleting project: ", error);
        toast.error("An error occurred while trying to delete the task");
      }
    }
  };

  return (
    <>
      <ProjectNavbar />
      {modalType === "createChild" && projectID !== null && (
        <CreateChildTaskModal
          projectID={projectID}
          parentTaskID={taskID}
          categoryID={taskDetails.categoryID}
          onClose={closeModal}
        />
      )}
      {specifiedChildTaskID &&
        modalType === "viewChild" &&
        projectID !== null && (
          <ViewChildTaskModal
            projectID={projectID}
            taskID={specifiedChildTaskID}
            parentTaskName={taskDetails.name}
            onClose={closeModal}
            role={role}
          />
        )}
      {isEditing &&
        taskID !== null &&
        modalType === "changeSprint" &&
        projectID !== null &&
        userID !== "nothing" && (
          <ChangeSprintModal
            taskID={taskID}
            onClose={closeModal}
            projectID={projectID}
            userID={userID}
          />
        )}
      <div className="flex flex-row pt-20 px-20 h-full min-h-screen w-full bg-white text-black">
        <div className="flex flex-col h-full justify-start w-2/3">
          <div className="flex flex-row w-full justify-between">
            {/* Back to Dashboard button */}
            <Link href={`/user/project/${projectID}`}>
              <button className="btn btn-info text-white">
                Back to Project Dashboard
              </button>
            </Link>
            {role === "CREATOR" && (
              <>
                {/* Option buttons */}
                <div>
                  {/* Delete Task Button */}
                  {!isEditing &&
                    (checkDelete ? (
                      <>
                        <button
                          className="btn bg-red-600 text-white justify-end mr-3 hover:bg-red-400 border-none"
                          onClick={deleteTask}
                        >
                          <TrashIcon className="w-4 h-4 text-white" /> Confirm
                          Delete
                        </button>
                        <button
                          className="btn btn-neutral text-white justify-end mr-3"
                          onClick={() => {
                            setCheckDelete(false);
                          }}
                        >
                          <XCircleIcon className="w-4 h-4 text-white" /> Cancel
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn border-none bg-red-600 text-white justify-end mr-3 hover:bg-red-400"
                        onClick={() => {
                          setCheckDelete(true);
                        }}
                      >
                        <TrashIcon className="w-4 h-4 text-white" /> Delete Task
                      </button>
                    ))}
                  {/* Edit Task button */}
                  {!isEditing ? (
                    <>
                      {!checkDelete && (
                        <button
                          className="btn btn-neutral text-white justify-end mr-3"
                          onClick={() => {
                            setIsEditing(true);
                          }}
                        >
                          <PencilSquareIcon className="w-4 h-4 text-white" />{" "}
                          Edit Task
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-info text-white justify-end mr-3"
                        onClick={handleSave}
                      >
                        <CheckCircleIcon className="w-4 h-4 text-white" />
                        Save Task
                      </button>
                      {/* Cancel Edit Task */}
                      <button
                        className="btn btn-neutral text-white justify-end mr-3"
                        onClick={() => setIsEditing(false)}
                      >
                        <XCircleIcon className="w-4 h-4 text-white" />
                        Cancel Edit
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Task Name */}
          {isEditing ? (
            <>
              <div className="label">
                <span className="label-text text-black text-opacity-60 font-semibold mt-6">
                  New Task Name
                </span>
              </div>
              <input
                type="text"
                className="input input-bordered border-black text-black bg-slate-50"
                value={taskDetails.name}
                onChange={(e) =>
                  setTaskDetails({
                    ...taskDetails,
                    name: e.target.value,
                  })
                }
              />
            </>
          ) : (
            <h1 className="font-bold text-3xl text-start mt-4">
              {taskDetails.name}
            </h1>
          )}

          <div className="flex flex-row w-full mt-6">
            {isEditing ? (
              <label className="form-control w-full flex flex-row max-w-xs">
                {/* Task Category - Editing*/}
                <div className="flex flex-col">
                  <div className="label">
                    <span className="label-text text-black text-opacity-60 font-semibold">
                      Pick a new category
                    </span>
                  </div>
                  <select
                    className="select select-bordered text-black bg-slate-50"
                    onChange={(e) => {
                      const target = e.target as HTMLSelectElement;
                      setTaskDetails({
                        ...taskDetails,
                        categoryID: target.value,
                      });
                    }}
                  >
                    <option disabled selected>
                      Choose a category
                    </option>
                    {categoryNames.map((categoryName, index) => (
                      <option
                        key={categoryIDs[index]}
                        value={categoryIDs[index]}
                      >
                        {categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Task Status - Editing */}
                <div className="flex flex-col">
                  <div className="label">
                    <span className="label-text text-black text-opacity-60 font-semibold ml-8">
                      Pick a new status
                    </span>
                  </div>
                  <select
                    className="select select-bordered text-black bg-slate-50 ml-8"
                    onChange={(e) => {
                      const target = e.target as HTMLSelectElement;
                      setTaskDetails({
                        ...taskDetails,
                        status: target.value,
                      });
                    }}
                  >
                    <option disabled selected>
                      Choose a status
                    </option>
                    {taskStatusList.map((statusOfTask: string) => (
                      <option key={statusOfTask} value={statusOfTask}>
                        {statusOfTask}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Change Sprint Button to open modal*/}
                <button
                  className="btn btn-neutral ml-8 text-white hover:underline mt-9"
                  onClick={() => setModalType("changeSprint")}
                >
                  Change Sprint
                </button>
              </label>
            ) : (
              <>
                {/* Task Category */}
                <p
                  className="font-lg text-white text-start rounded-md p-2"
                  style={{ backgroundColor: taskDetails.categoryColour }}
                >
                  {taskDetails.categoryName}
                </p>
                {/* Task Status */}
                <p
                  className={`font-lg text-white font-semibold text-start ml-4 p-3 rounded-xl ${
                    taskDetails.status === TaskStatus.NOTSTARTED
                      ? "bg-gray-600"
                      : ""
                  } ${
                    taskDetails.status === TaskStatus.STARTED
                      ? "bg-orange-600"
                      : ""
                  } ${
                    taskDetails.status === TaskStatus.TESTING
                      ? "bg-blue-600"
                      : ""
                  } ${
                    taskDetails.status === TaskStatus.FINISHED
                      ? "bg-green-600"
                      : ""
                  } ${
                    taskDetails.status === TaskStatus.OVERDUE
                      ? "bg-red-600"
                      : ""
                  }`}
                >
                  {taskDetails.status}
                </p>
              </>
            )}
          </div>
          {/* Task Description */}
          <div className="collapse bg-slate-400 mt-6">
            <input type="checkbox" name="my-accordion-1" />
            <div className="collapse-title text-xl font-medium text-white text-start">
              Task Description
            </div>
            <div className="collapse-content text-start text-white">
              {isEditing ? (
                <textarea
                  value={taskDetails.desc}
                  className="textarea textarea-bordered border-white w-full h-36 text-sm"
                  onChange={(e) =>
                    setTaskDetails({
                      ...taskDetails,
                      desc: e.target.value,
                    })
                  }
                />
              ) : (
                <p>{taskDetails.desc}</p>
              )}
            </div>
          </div>
          {/* Child Tasks */}
          <div className="collapse bg-slate-400 mt-6">
            <input type="checkbox" name="my-accordion-1" />
            <div className="collapse-title text-xl font-medium text-white text-start">
              Child Tasks
            </div>
            <div className="collapse-content text-start text-white pb-2 overflow-x-auto max-w-[1600px]">
              {(role === "CREATOR" || role === "ASSIGNEE") && (
                <button
                  className="btn btn-info w-full text-white"
                  onClick={() => {
                    setModalType("createChild");
                  }}
                >
                  Create a new child task
                </button>
              )}
              {taskDetails.childTasks.length > 0 && (
                <p className="mt-3 text-center w-full">
                  Click one of the cards below to view more details
                </p>
              )}
              {/* Displays when there are child tasks stored */}
              <div className="flex flex-row justify-start bg-slate-400 rounded-lg overflow-x-auto max-w-[1700px]">
                {taskDetails.childTasks.length > 0 &&
                  taskDetails.childTasks.map((childTasks) => (
                    <div className="mt-3 mx-2" key={childTasks}>
                      <button
                        className="cursor-pointer transition-all duration-50 ease-in-out transform hover:scale-105"
                        onClick={() => {
                          setSpecifiedChildTaskID(childTasks);
                          setModalType("viewChild");
                          console.log("specified child task id: ", childTasks);
                        }}
                      >
                        <ChildTaskCard
                          taskID={childTasks}
                          projectID={projectID}
                        />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {/* Activity Log Section */}
          <div className="flex justify-start mt-6">
            <h2 className="font-bold text-2xl">Activity Log</h2>
          </div>
          <div className="mt-3 ">
            {taskDetails.activityLogs.length > 0 &&
              taskDetails.activityLogs.map((log, index) => (
                <p className="text-black w-full text-start text-lg" key={index}>
                  {log}
                </p>
              ))}
          </div>
          {(role === "CREATOR" || role === "ASSIGNEE") && (
            <>
              {/* Comment form */}
              <div className="bg-white pb-8">
                <div className="collapse collapse-arrow bg-slate-400 mt-6">
                  <input type="checkbox" name="my-accordion-2" />
                  <div className="collapse-title text-xl font-medium text-white text-start">
                    Add Comment
                  </div>
                  <div className="collapse-content p-4">
                    <label className="form-control">
                      <div className="label">
                        <span className="label-text text-white text-lg">
                          Comment
                        </span>
                      </div>
                      <textarea
                        className="textarea textarea-bordered border-white border-2 text-lg h-24 text-white bg-base-100"
                        placeholder="Comment"
                        value={commentContent}
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
                      className="btn btn-info text-white mt-4 w-full "
                      onClick={createComment}
                    >
                      Submit Comment
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Other Details Section */}
        <div className="flex flex-col justify-start h-full w-1/3 ml-6">
          <div className="collapse bg-slate-400">
            <input type="checkbox" name="my-accordion-1" defaultChecked />
            <div className="collapse-title text-2xl font-medium text-white text-start">
              Other Details
            </div>
            <div className="collapse-content text-center text-white">
              {/* Task Creator */}
              <div className="mt-4">
                <p className="text-xl">
                  Task Creator: {taskDetails.creatorName}
                </p>
              </div>
              {/* Task Creation Date */}
              <div className="mt-4">
                <p className="text-xl">
                  Task Creation Date: {taskDetails.creationDate}
                </p>
              </div>
              {/* Task Members */}
              <div className="mt-4">
                <h3 className="underline text-white text-center text-xl mb-2">
                  List of Members Assigned
                </h3>
                {isEditing ? (
                  <label className="form-control w-full">
                    <div className="label flex flex-col">
                      <span className="label-text text-white text-xl">
                        Select Project Members to assign
                      </span>
                      <span className="label-text text-white text-xl">
                        Hold CTRL to select multiple members
                      </span>
                    </div>
                    <select
                      className="select select-bordered text-white text-lg"
                      multiple
                      value={taskDetails.members}
                      onChange={handleMembersChange}
                    >
                      {projectMembers.map((member, index) => (
                        <option
                          key={index}
                          value={member}
                          className="text-white"
                        >
                          {member}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <ul>
                    {taskDetails.members.map((member, index) => (
                      <li
                        key={index}
                        className="text-xl text-white text-center"
                      >
                        {member}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Task Deadline */}
              <div className="mt-4">
                {isEditing ? (
                  <input
                    type="datetime-local"
                    className="input input-lg text-white rounded-md p-3 w-full justify-center text-xl"
                    value={taskDetails.deadline}
                    onChange={(e) =>
                      setTaskDetails({
                        ...taskDetails,
                        deadline: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="w-full justify-center text-xl text-white p-3">
                    Task Deadline: {taskDetails.deadline}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
};

export default TaskPage;
