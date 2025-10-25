import axios from "axios";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

interface DeleteSprintModalProps {
  sprintID: string;
  sprintNo: string;
  projectID: string;
  onClose: () => void;
}

const DeleteSprintModal: React.FC<DeleteSprintModalProps> = ({
  sprintID,
  sprintNo,
  projectID,
  onClose,
}) => {
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

  //Stops the user from being redirected when they press the "No" button
  const closeDialogForNo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const dialog = document.getElementById(
      "deleteSprintModal"
    ) as HTMLDialogElement;
    if (dialog) {
      setTimeout(() => {
        onClose();
      }, 50);
    }
  };

  const deleteSprint = async () => {
    try {
      const response = await axios.delete(
        `/api/projects/updateProjectAttributes/updateProjectTimeline`,
        { params: { sprintID: sprintID, projectID: projectID } }
      );
      if(response.data.success){
        toast.success(`Successfully deleted sprint ${sprintNo}`);
        onClose();
      }
    } catch (error: any) {
      toast.error(`Error deleting sprint ${sprintNo}`);
      console.error("Error deleting sprint: ", error);
    }
  };

  return (
    <>
      <dialog className="modal" id="deleteSprintModal">
        <div className="modal-box bg-slate-50">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-black"
              onClick={onClose}
            >
              ✕
            </button>
          </form>
          <p className="text-black pt-2">
            Are you sure you want to delete sprint {sprintNo}?
          </p>
          <div className="flex flex-row justify-evenly pt-4">
            <button
              className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white"
              onClick={deleteSprint}
            >
              Yes
            </button>
            <form method="dialog ml-4" onSubmit={closeDialogForNo}>
              <button className="btn btn-neutral text-white">No</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default DeleteSprintModal;
