import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface CreateTaskModalProps {
  catID: string;
  creatorID: string;
  projectID: string;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  catID,
  creatorID,
  projectID,
  onClose,
}) => {
  const [projectMembers, setProjectMembers] = useState<string[]>([]);

  useEffect(() => {
    const getProjectMembers = async () => {
      const response = await axios.get(
        `/api/projects/updateKanbanBoardAttributes/updateTask/getMembers?projectID=${projectID}`
      );
      setProjectMembers(response.data.members);
    };
    getProjectMembers();
  }, []);

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

  const memberOptions = [
    <option key="assignLater" value="Not yet assigned">
      Assign at a later date
    </option>,
    <option key="default" value="">
      Assign a member/members
    </option>,
    ...projectMembers.map((option, index) => (
      <option key={index} value={option.toString()}>
        {option}
      </option>
    )),
  ];

  //console.log("members from createtaskmodal frontend: "+projectMembers)
  const [taskDetails, setTaskDetails] = useState({
    category: "",
    taskName: "",
    taskDesc: "",
    taskCreator: "",
    taskDeadline: "",
    taskMembers: [] as string[],
  });
  const createNewTask = async () => {
    try {
      const requestBody = {
        category: catID,
        taskName: taskDetails.taskName,
        taskDesc: taskDetails.taskDesc,
        taskCreator: creatorID,
        taskDeadline: taskDetails.taskDeadline,
        taskMembers: taskDetails.taskMembers,
        projectID: projectID,
      };
      console.log("requestBody from frontend: ", requestBody);
      const response = await axios.post(
        `/api/projects/updateKanbanBoardAttributes/updateTask`,
        { requestBody }
      );
      if (response.data.success) {
        toast.success(`Successfully created task ${requestBody.taskName}`);
        closeDialogOnCreation();
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
  //For when the task is created
  const closeDialogOnCreation = () => {
    const dialog = document.getElementById(
      "createTaskModal"
    ) as HTMLDialogElement;
    if (dialog) {
      onClose();
    }
  };

  return (
    <dialog id="createTaskModal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <h1 className="font-bold text-2xl text-center text-white">
          Create A New Task
        </h1>
        <p className="text-lg text-white text-center mt-2">
          Fill out the form below to create a new task.
        </p>
        {/* Task Name input form */}
        <div className="label">
          <span className="label-text mt-3 text-white font-bold">
            Task Name
          </span>
        </div>
        <input
          type="text"
          placeholder="New task name"
          className="input w-full rounded-md border-2 border-white text-white p-3"
          onChange={(e) => {
            console.log("Task Name Input Changed:", e.target.value);
            setTaskDetails({ ...taskDetails, taskName: e.target.value });
          }}
        />
        {/* Task Description input form */}
        <div className="label">
          <span className="label-text mt-3 text-white font-bold">
            Task Description
          </span>
        </div>
        <textarea
          placeholder="A brief description of the task"
          className="textarea textarea-bordered textarea-lg border-white border-2 w-full h-36 text-white text-sm"
          onChange={(e) => {
            console.log("Task Description Input Changed:", e.target.value);
            setTaskDetails({ ...taskDetails, taskDesc: e.target.value });
          }}
        />
        {/* Task Deadline input form */}
        <div className="label">
          <span className="label-text mt-3  text-white font-bold">
            Task Deadline
          </span>
        </div>
        <input
          type="datetime-local"
          className="input input-bordered border-2 border-white input-lg text-white w-full"
          onChange={(e) => {
            console.log("Task Deadline Input Changed:", e.target.value);
            setTaskDetails({ ...taskDetails, taskDeadline: e.target.value });
          }}
        />
        {/* Assigning Member input form */}
        <div className="label">
          <span className="label-text mt-3 text-white font-bold">
            Assign a member to this task
          </span>
        </div>
        <div className="label -mt-2">
          <span className="label-text text-start text-sm text-white">
            To select multiple members, hold ctrl and click on the members you
            want to assign
          </span>
        </div>
        <select
          className="select select-bordered border-2 border-white w-full text-white"
          multiple
          onChange={(e) => {
            const selectedOptions = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );
            setTaskDetails({ ...taskDetails, taskMembers: selectedOptions });
          }}
        >
          {memberOptions}
        </select>
        {/* Create Task Button */}
        <div className="flex justify-center mt-3">
          <button className="btn btn-info text-white" onClick={createNewTask}>
            Create Task
          </button>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </dialog>
  );
};

export default CreateTaskModal;
