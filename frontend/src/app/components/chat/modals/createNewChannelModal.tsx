"use client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { ObjectId } from "mongoose";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CreateNewChannelModalProps {
  onClose: () => void;
  projectID: string;
  userID: string;
}

interface ProjectMember {
  userID: string;
  username: string;
  userFullName: string;
}

const CreateNewChannelModal: React.FC<CreateNewChannelModalProps> = ({
  onClose,
  projectID,
  userID,
}) => {
  const [newChannelName, setNewChannelName] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<number>(1);
  const [privateChannel, setPrivateChannel] = useState<boolean>(false);
  const [selectedMemberOptions, setSelectedMemberOptions] = useState<string[]>(
    []
  );
  const [projectMembers, setProjectMembers] = useState<[]>([]);
  const [selectedRoleOptions, setSelectedRoleOptions] = useState<string[]>([]);

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

  //Gets all the other members in the project
  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        `/api/projects/chat/channels/createChannel`,
        { params: { projectID: projectID, userID: userID } }
      );
      if (response.data.success) {
        console.log(response.data.memberList);
        setProjectMembers(response.data.memberList);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  //Runs on modal load
  useEffect(() => {
    fetchMembers();
  }, []);

  //Creates new channel
  const createNewChannel = async () => {
    try {
      const requestBody = {
        selectedMemberOptions,
        projectID,
        userID,
        newChannelName,
        privateChannel,
      };
      const response = await axios.post(
        `/api/projects/chat/channels/createChannel`,
        requestBody
      );
      if (response.data.success) {
        onClose();
        toast.success(`Successfully created the channel ${newChannelName}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`An error occurred while trying to create the channel`);
    }
  };

  const handleMemberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMembers = Array.from(
      event.target.selectedOptions,
      (option: any) => option.value
    );
    console.log(selectedMembers);
    setSelectedMemberOptions(selectedMembers);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoles = Array.from(
      event.target.selectedOptions,
      (option: any) => option.value
    );

    console.log(selectedRoles);
    setSelectedRoleOptions(selectedRoles);
  };

  return (
    <dialog id="createNewChannelModal" className="modal">
      <div className="modal-box bg-slate-50 max-w-xl">
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
        {/* Step 1 Content */}
        {modalStep === 1 && (
          <>
            <p className="font-bold text-2xl w-full text-center">
              Create New Channel
            </p>
            <div className="label mt-8">
              <span className="label-text text-black font-bold opacity-60">
                Channel Name
              </span>
            </div>
            <input
              type="text"
              className="input input-bordered bg-slate-50 text-black w-full border-black border-opacity-25"
              onChange={(e) => {
                setNewChannelName(e.target.value);
              }}
            />
            {/* Private Channel Switch */}
            <div className="flex flex-row w-full justify-between mt-8">
              <div className="flex flex-col">
                <Label
                  htmlFor="privateChannel"
                  className="ml-1 font-bold opacity-60"
                >
                  Private Channel
                </Label>
                <span className="label-text text-black pt-2">
                  Only selected members and roles will be able to access this
                  channel
                </span>
              </div>
              <Switch
                id="privateChannel"
                onClick={() => {
                  setPrivateChannel(!privateChannel);
                }}
              />
            </div>
            {/* Submit / Cancel Buttons */}
            <div className="w-full flex flex-row justify-evenly mt-8">
              {/* Cancel Button */}
              <button
                className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white"
                onClick={onClose}
              >
                Cancel
              </button>
              {/* Submit / Next Button */}
              <button
                className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none text-white"
                disabled={
                  newChannelName === null || newChannelName.trim().length === 0
                }
                onClick={() => {
                  if (privateChannel) {
                    setModalStep(2);
                  } else {
                    createNewChannel();
                  }
                }}
              >
                {privateChannel ? "Next" : "Create Channel"}
              </button>
            </div>
          </>
        )}
        {/* Step 2 Content */}
        {modalStep === 2 && (
          <>
            <p className="w-full text-2xl font-bold text-center">
              Add members or roles
            </p>
            <p className="w-full opacity-60 mt-2 text-center">
              Hold CTRL to select multiple options
            </p>
            {/* Accordion of all members */}
            <div className="collapse collapse-arrow bg-slate-200 mt-8">
              <input type="checkbox" name="memberAccordion" defaultChecked />
              <div className="collapse-title text-lg text-start">Members</div>
              <div className="collapse-content">
                <select
                  multiple
                  className="w-full bg-slate-50 p-2 text-start"
                  onChange={handleMemberChange}
                  value={selectedMemberOptions}
                >
                  {projectMembers.length > 0 &&
                    projectMembers.map((member: ProjectMember) => (
                      <option
                        key={member.userID}
                        value={member.userID}
                        className="p-2 text-lg"
                      >
                        {member.userFullName} ({member.username})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            {/* Submit / Back Buttons */}
            <div className="flex flex-row justify-evenly mt-8">
              <button
                className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white"
                onClick={() => {
                  setModalStep(1);
                  setPrivateChannel(false);
                }}
              >
                Back
              </button>
              <button
                className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none text-white"
                disabled={
                  selectedRoleOptions.length === 0 &&
                  selectedMemberOptions.length === 0
                }
                onClick={createNewChannel}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};

export default CreateNewChannelModal;
