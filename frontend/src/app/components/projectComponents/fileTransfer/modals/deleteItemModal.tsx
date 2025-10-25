import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
interface DeleteItemModalProps {
  itemType: string;
  itemID: string;
  onClose: () => void;
  itemName: string;
  itemDirectory: string;
}

const DeleteItemModal: React.FC<DeleteItemModalProps> = ({
  itemType,
  itemID,
  itemName,
  itemDirectory,
  onClose,
}) => {
  const deleteItem = async () => {
    try {
      const requestBody = {
        itemName,
        itemID,
        itemDirectory,
        itemType,
      };
      const response = await axios.put(
        `/api/projects/fileTransfer/deleteItem`,
        requestBody
      );
      if (response.data.success) {
        toast.success(
          `Successfully deleted the ${
            itemType === "Folder" ? "folder" : "file"
          } ${itemName}`
        );
        setTimeout(() => {
          onClose();
        }, 50);
      }
    } catch (error: any) {
      toast.error(
        `An error occurred while trying to delete the ${
          itemType === "Folder" ? "folder" : "file"
        } ${itemName}`
      );
    }
  };
  return (
    <>
      {ReactDOM.createPortal(
        <dialog id="deleteItemModal" className="modal">
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
              Delete {itemName}
            </h1>
            <p className="w-full text-center mt-4">
              Would you like to delete the{" "}
              {itemType === "Folder" ? "folder" : "file"} "{itemName}" ?
            </p>
            <div className="flex w-full justify-evenly mt-4">
              <button
                className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
                onClick={deleteItem}
              >
                <CheckCircleIcon className="w-4 h-4 text-white" />
                Yes
              </button>
              <button
                className="btn bg-red-600 border-none hover:bg-red-600 hover:border-none text-white"
                onClick={() => {
                  setTimeout(() => {
                    onClose();
                  }, 50);
                }}
              >
                <XCircleIcon className="w-4 h-4 text-white" />
                No
              </button>
            </div>
          </div>
        </dialog>,
        document.body
      )}
    </>
  );
};

export default DeleteItemModal;
