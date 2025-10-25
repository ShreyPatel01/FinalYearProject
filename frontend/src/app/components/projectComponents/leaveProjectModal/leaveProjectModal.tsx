import GetUserID from "@/src/helpers/getUserID";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

interface LeaveProjectModalProps {
  id: string;
}

const LeaveProjectModal: React.FC<LeaveProjectModalProps> = ({ id }) => {
  const router = useRouter();
  const userID = GetUserID();
  const leaveProject = async () => {
    try {
      const response = await axios.delete(
        `/api/projects/leaveProject?projectID=${id}&member=${userID}`
      );
      console.log("Successfully left project", response);
      toast.success("Successfully left the project");
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 150);
    } catch (error: any) {
      console.error("An error occurred when trying to leave ",error);
    }
  };
  //Stops the user from being redirected when they press the "No" button
  const closeDialogForNo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const dialog = document.getElementById(
      "leaveProjectModal"
    ) as HTMLDialogElement;
    if (dialog) {
      dialog.close();
    }
  };

  return (
    <main>
      <dialog id="leaveProjectModal" className="modal">
        <div className="modal-box bg-slate-50">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-black">
              ✕
            </button>
          </form>
          <p className="text-black pt-2">
            Are you sure you want to leave the project?
          </p>
          <div className="flex flex-row justify-evenly pt-4">
            <button className="btn bg-red-600 text-white" onClick={leaveProject}>
              Yes
            </button>
            <form method="dialog ml-4" onSubmit={closeDialogForNo}>
              <button className="btn btn-neutral text-white">No</button>
            </form>
          </div>
        </div>
      </dialog>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default LeaveProjectModal;
