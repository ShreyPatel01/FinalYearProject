import GetUserID from "@/src/helpers/getUserID";
import GetUsername from "@/src/helpers/getUsername";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface CreateChildTaskModalProps {
  parentTaskID: string;
  categoryID: string;
  onClose: () => void;
  projectID: string;
}

const CreateChildTaskModal: React.FC<CreateChildTaskModalProps> = ({
  parentTaskID,
  categoryID,
  onClose,
  projectID
}) => {
  const userID = GetUserID();
  const [childTaskDetails, setChildTaskDetails] = useState({
    parentTaskID: "",
    childTaskName: "",
    childTaskDesc: "",
    members: [] as string[],
    comments: [] as string[],
  });

  const createChildTask = async () => {
    try {
      const requestBody = {
        category: categoryID,
        taskName: childTaskDetails.childTaskName,
        taskDesc: childTaskDetails.childTaskDesc,
        taskCreator: userID,
        taskMembers: userID,
        parentTask: parentTaskID,
        projectID: projectID
      };
      const response = await axios.post(`/api/projects/tasks/childTask`, {
        requestBody,
      });
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

  const handleClose = () => {
    setChildTaskDetails({
      parentTaskID: "",
      childTaskName: "",
      childTaskDesc: "",
      members: [] as string[],
      comments: [] as string[],
    });
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
    <dialog id="createChildTaskModal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white"
            onClick={handleClose}
          >
            ✕
          </button>
        </form>
        <h1 className="font-bold text-2xl text-center text-white">
          Create A Child Task
        </h1>
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
            setChildTaskDetails({
              ...childTaskDetails,
              childTaskName: e.target.value,
            });
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
            setChildTaskDetails({
              ...childTaskDetails,
              childTaskDesc: e.target.value,
            });
          }}
        />
        {/* Create Child Task Button */}
        <div className="flex justify-center mt-3">
          <button className="btn btn-info text-white" onClick={createChildTask}>
            Create Child Task
          </button>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </dialog>
  );
};

export default CreateChildTaskModal;
