"use client";
import axios from "axios";
import { ObjectId } from "mongoose";
import React, { useEffect, useState } from "react";
import ManageMembers from "../otherComponents/manageMembers";
import toast from "react-hot-toast";
import InviteMembers from "../otherComponents/inviteMembers";

interface ChannelSettingsModalProps {
  onClose: () => void;
  channelID: ObjectId;
  userID: string;
  role: string;
}

const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({
  onClose,
  channelID,
  userID,
  role
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<string>("manage");
  const [channelMembers, setChannelMembers] = useState<[]>([]);
  const [otherProjectMembers, setOtherProjectMembers] = useState<[]>([]);

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

  //Calls methods whenever channelID changes or when settings changes
  useEffect(() => {
    if (settings === "manage") {
      setLoading(true);
      getChannelMembers();
      setLoading(false);
    } else if (settings === "invite") {
      setLoading(true);
      getMembersNotInChannel();
      setLoading(false);
    }
  }, [settings, channelID]);

  //Retrieves channel members and their current roles from database
  const getChannelMembers = async () => {
    try {
      const response = await axios.get(
        `/api/projects/chat/channels/settings/getChannelMembers`,
        { params: { channelID: channelID, userID: userID } }
      );
      if (response.data.success) {
        console.log(response.data.channelMembers);
        setChannelMembers(response.data.channelMembers);
      }
    } catch (error: any) {
      console.error(`Error while fetching channel members: `, error);
    }
  };

  //Gets everyone that isn't in the channel
  const getMembersNotInChannel = async () => {
    try {
      const response = await axios.get(
        `/api/projects/chat/channels/settings/getProjectMembers`,
        { params: { channelID: channelID } }
      );
      if (response.data.success) {
        console.log(response.data.projectMembers);
        setOtherProjectMembers(response.data.projectMembers);
      }
    } catch (error: any) {
      console.error(`Error while fetching project members: `, error);
    }
  };

  const managementChange = () => {
    setLoading(true);
    getChannelMembers();
    setLoading(false);
  };

  const listOfMemberChange = () => {
    setLoading(true);
    getMembersNotInChannel();
    setLoading(false);
  };

  return (
    <dialog id="channelSettingsModal" className="modal">
      <div className="bg-slate-50 modal-box max-w-7xl">
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
        <p className="w-full text-center text-2xl font-bold">
          Channel Settings
        </p>
        <div className="divider -mt-0.5" />
        <div className="flex flex-row w-full min-h-96">
          <div className="w-1/4 border-r-2 border-black flex flex-col items-center justify-center">
            <button
              className={`btn btn-ghost -mt-16 ${
                settings === "manage"
                  ? "text-blue-300 underline hover:bg-transparent"
                  : "text-black hover:underline hover:text-blue-300"
              }`}
              onClick={() => {
                if (settings !== "manage") {
                  setSettings("manage");
                }
                console.log(`settings changed to manage`);
              }}
            >
              Manage Channel Members
            </button>
            <button
              className={`btn btn-ghost ${
                settings === "invite"
                  ? "text-blue-300 underline hover:bg-transparent"
                  : "text-black hover:underline hover:text-blue-300"
              }`}
              onClick={() => {
                if (settings !== "invite") {
                  setSettings("invite");
                }
                console.log(`settings changed to invite`);
              }}
            >
              Invite Project Members
            </button>
          </div>
          <div className="w-3/4 border-l-2 border-black">
            <div className="h-full w-full justify-items-center">
              {loading === false && (
                <>
                  {settings === "manage" && (
                    <>
                      <ManageMembers
                        channelMembers={channelMembers}
                        channelID={channelID}
                        onChange={managementChange}
                        role={role}
                      />
                    </>
                  )}
                  {settings === "invite" && (
                    <>
                      <InviteMembers
                        projectMembers={otherProjectMembers}
                        channelID={channelID}
                        onChange={listOfMemberChange}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ChannelSettingsModal;
