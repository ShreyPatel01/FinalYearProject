"use client";
import axios from "axios";
import { ObjectId } from "mongoose";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface RenameChannelModalProps {
  onClose: () => void;
  onChildClose: () => void;
  originalName: string;
  channelID: ObjectId;
  userID: string;
}

const RenameChannelModal: React.FC<RenameChannelModalProps> = ({
  onClose,
  onChildClose,
  originalName,
  channelID,
  userID,
}) => {
  const [newChannelName, setNewChannelName] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onChildClose();
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
  }, [onClose, onChildClose]);

  const renameChannel = async () => {
    try {
      const requestBody = { newChannelName, channelID, userID };
      const response = await axios.put(
        `/api/projects/chat/channels/renameChannel`,
        requestBody
      );
      if (response.data.success) {
        onClose();
        onChildClose();
        toast.success(
          `Successfully renamed the project from ${originalName} to ${newChannelName}`
        );
      }
    } catch (error: any) {
      console.error(`Error while renaming the channel: `, error);
    }
  };

  return (
    <dialog id="renameChannelModal" className="modal">
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
        </form>
        <p className="text-2xl font-bold w-full text-center">Rename Channel</p>
        <div className="label mt-4">
          <span className="label-text text-black font-bold opacity-60">
            Channel Name
          </span>
        </div>
        <input
          type="text"
          className="input input-bordered bg-slate-50 border-black border-opacity-25 w-full"
          value={newChannelName !== null ? newChannelName : originalName}
          onChange={(e) => {
            setNewChannelName(e.target.value);
          }}
        />
        <div className="flex mt-4 w-full justify-evenly">
          <button
            className="btn bg-red-600 hover:bg-red-700 text-white hover:underline border-none hover:border-none"
            onClick={() => {
              onClose();
              onChildClose();
            }}
          >
            Cancel
          </button>
          <button
            className="btn bg-blue-600 hover:bg-blue-700 text-white hover:underline border-none hover:border-none"
            disabled={
              newChannelName === null || newChannelName.trim().length === 0
            }
            onClick={renameChannel}
          >
            Rename Channel
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default RenameChannelModal;
