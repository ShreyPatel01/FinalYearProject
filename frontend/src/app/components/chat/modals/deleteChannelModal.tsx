"use client";
import axios from "axios";
import { ObjectId } from "mongoose";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

interface DeleteChannelModalProps {
  onClose: () => void;
  channelID: ObjectId;
  userID: string;
  projectID: string;
  onChildClose: () => void;
}

const DeleteChannelModal: React.FC<DeleteChannelModalProps> = ({
  onClose,
  channelID,
  userID,
  projectID,
  onChildClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        onChildClose();
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
  }, [onClose, onChildClose]);

  const deleteChannel = async () => {
    try {
      const response = await axios.delete(
        `/api/projects/chat/channels/deleteChannel`,
        {
          params: {
            channelID: channelID,
            userID: userID,
            projectID: projectID,
          },
        }
      );
      if (response.data.success) {
        onClose();
        onChildClose();
        toast.success(`Successfully deleted the channel`);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <dialog id="deleteChannelModal" className="modal">
      <div className="modal-box bg-slate-50">
        <form method="dialog">
          <button
            className="btn btn-sm btn-ghost absolute right-2 top-2 text-black"
            onClick={() => {
              setTimeout(() => {
                onClose();
                onChildClose();
              }, 50);
            }}
          >
            ✕
          </button>
          <p className="text-2xl font-bold text-center w-full">
            Delete Channel
          </p>
          <p className="mt-4 opacity-60 text-black text-center">
            This action is irreversible and cannot be undone.
          </p>
          <div className="flex flex-row justify-evenly w-full mt-4">
            <button
              className="btn btn-neutral hover:underline text-white"
              onClick={() => {
                onClose();
                onChildClose();
              }}
            >
              Cancel
            </button>
            <button
              className="btn bg-red-600 hover:bg-red-700 hover:underline text-white border-none hover:border-none"
              onClick={deleteChannel}
            >
              Delete Channel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default DeleteChannelModal;
