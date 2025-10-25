"use client";
import GetUserID from "@/src/helpers/getUserID";
import { PencilSquareIcon, XCircleIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";

interface RenameItemModalProps {
  onClose: () => void;
  originalName: string;
  itemID: string;
  type: string;
  originalDirectory: string;
}

const RenameItemModal: React.FC<RenameItemModalProps> = ({
  onClose,
  originalName,
  itemID,
  type,
  originalDirectory,
}) => {
  const [newName, setNewName] = useState<string | null>(null);
  const userID = GetUserID();

  const renameItem = async () => {
    try {
      let requestBody = {}
      if(type === "Folder") {
        requestBody = {
          newName,
          itemID,
          type,
          userID,
          originalName,
          originalDirectory,
        };
      } else {
        const newFileName = `${newName}.${type}`
        requestBody = {
          newName: newFileName,
          itemID,
          type,
          userID,
          originalName,
          originalDirectory,
        };
      }
      const response = await axios.put(
        `/api/projects/fileTransfer/renameItem`,
        requestBody
      );
      if (response.data.success) {
        toast.success(
          ` The ${type === "Folder" ? "folder" : "file"} ${
            response.data.originalItemName
          } was renamed to ${response.data.newItemName}`
        );
        setTimeout(() => {
          onClose();
        }, 50);
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
      {ReactDOM.createPortal(
        <dialog id="renameItemModal" className="modal">
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
              Rename The {type === "Folder" ? "Folder" : "File"} {originalName}
            </h1>
            {/* New Folder Name Input Form */}
            <div className="mt-8">
              <div className="label">
                <span className="label-text text-black font-bold">
                  New {type === "Folder" ? "Folder" : "File"} Name
                </span>
              </div>
              <input
                type="text"
                defaultValue={originalName}
                className="input input-bordered border-black bg-slate-50 text-black w-full"
                onChange={(e) => {
                  setNewName(e.target.value);
                }}
              />
            </div>
            {/* Submit / Cancel Buttons */}
            <div className="w-full flex flex-row justify-evenly mt-4">
              <button
                className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
                onClick={renameItem}
              >
                <PencilSquareIcon className="w-4 h-4 text-white" />
                Rename Item
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
        </dialog>,
        document.body
      )}
    </>
  );
};

export default RenameItemModal;
