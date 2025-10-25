"use client";
import GetUserID from "@/src/helpers/getUserID";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CreateFolderModalProps {
  onClose: () => void;
  projectID: string;
  currentDirectory: string;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ onClose, projectID, currentDirectory }) => {
  const [folderName, setFolderName] = useState<string | null>(null);
  const userID = GetUserID();

  //Creating folder in s3 bucket and creating instance of folder in mongoDB
  const createFolder = async () => {
    if (projectID !== null) {
      try {
        const requestBody = { folderName, projectID, userID, currentDirectory };
        const response = await axios.post(
          `/api/projects/fileTransfer/createFolder`,
          requestBody
        );
        if (response.data.success) {
          closeDialogOnCreation();
          toast.success(`${folderName} has been created`);
        }
      } catch (error: any) {
        console.error(error);
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

  //For when the folder is created
  const closeDialogOnCreation = () => {
    const dialog = document.getElementById(
      "createFolderModal"
    ) as HTMLDialogElement;
    if (dialog) {
      dialog.close();
    }
  };
  
  return (
    <main>
      <dialog id="createFolderModal" className="modal">
        <div className="modal-box bg-slate-50">
          <form method="dialog">
            <button
              className="btn btn-sm btn-ghost absolute right-2 top-2 text-black"
              onClick={() => {
                setTimeout(() => {
                  onClose();
                }, 50);
              }}
            >
              ✕
            </button>
          </form>
          <h1 className="w-full text-center text-2xl font-bold">
            Create A New Folder
          </h1>
          <p className="w-full text-center mt-2 px-14">
            Fill in the input form below to create a new folder.
          </p>
          {/* Folder Name Input Form */}
          <div className="mt-6">
            <div className="label">
              <span className="label-text text-black font-bold">
                Folder Name
              </span>
            </div>
            <input
              type="text"
              placeholder="Folder name"
              className="input input-bordered border-black bg-slate-50 text-black w-full"
              onChange={(e) => {
                setFolderName(e.target.value);
                console.log(`folder name was set to ${e.target.value}`);
              }}
            />
          </div>
          {/* Submit / Cancel Buttons */}
          <div className="w-full flex flex-row justify-evenly mt-4">
            <button
              className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
              onClick={createFolder}
            >
              <PlusCircleIcon className="w-4 h-4 text-white" />
              Create Folder
            </button>
            <button
              className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white"
              onClick={() => {
                setTimeout(() => {
                  onClose();
                }, 50);
              }}
            >
              <XCircleIcon className="w-4 h-4 text-white" />
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
};

export default CreateFolderModal;
