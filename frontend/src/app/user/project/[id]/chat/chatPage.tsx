"use client";
import CreateNewChannelModal from "@/src/app/components/chat/modals/createNewChannelModal";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from "@heroicons/react/16/solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import React, { useEffect, useState } from "react";
import Channel from "@/src/app/components/chat/otherComponents/channel";
import GetUserID from "@/src/helpers/getUserID";
import axios from "axios";
import { ObjectId } from "mongoose";
import ChatContent from "./chatContent";
import ChatMembers from "./chatMembers";
import Link from "next/link";

interface ChannelStructure {
  channelID: ObjectId;
  channelName: string;
  userInChannel: boolean;
}

const ChatPage = () => {
  const [projectID, setProjectID] = useState<string | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [openProjectChatOptions, setOpenProjectChatOptions] =
    useState<boolean>(false);
  const [openChannelList, setOpenChannelList] = useState<boolean>(true);
  const [channelList, setChannelList] = useState<[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ObjectId | null>(null);
  const userID = GetUserID();

  //Fetching list of channels from project
  const fetchChannelList = async () => {
    if (userID && projectID) {
      try {
        const response = await axios.get(
          `/api/projects/chat/channels/getChannels`,
          {
            params: {
              projectID: projectID,
              userID: userID,
            },
          }
        );
        if (response.data.success) {
          console.log(response.data.arrayOfChannels);
          setChannelList(response.data.arrayOfChannels);
        }
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  //Fetching projectID from URL
  useEffect(() => {
    if (typeof window !== undefined) {
      const idFromURL = window.location.pathname.split("/")[3];
      setProjectID(idFromURL);
    }
  });

  useEffect(() => {
    fetchChannelList();

    //Changing modalType depending on which button has been pressed
    if (modalType === "createChannel") {
      const element = document.getElementById(
        "createNewChannelModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    }
  }, [userID, modalType]);

  //Makes sure other modals can be opened after a modal is closed
  const closeModal = () => {
    setModalType("");
    fetchChannelList();
    setSelectedChannel(null);
  };

  return (
    <>
      <div className="flex flex-row w-full min-h-screen">
        {/* Sidebar */}
        <div className="w-1/6 bg-gray-200 min-h-screen">
          <>
            {modalType === "createChannel" && projectID !== null && (
              <CreateNewChannelModal
                onClose={closeModal}
                projectID={projectID}
                userID={userID}
              />
            )}
            <div className="flex flex-col w-full pt-2 h-screen bg-gray-200">
              {/* Project Name Section */}
              <div className="justify-center flex flex-col w-full">
                {/* Chat Options Dropdown Form */}
                <DropdownMenu
                  open={openProjectChatOptions}
                  onOpenChange={() =>
                    setOpenProjectChatOptions(!openProjectChatOptions)
                  }
                >
                  <DropdownMenuTrigger className="flex flex-row p-1 btn btn-ghost">
                    <p className="text-xl font-bold text-start">Project Name</p>
                    <p className="text-end ml-2">
                      {openProjectChatOptions ? (
                        <>
                          <ChevronUpIcon className="w-6 h-6 text-black mt-0.5" />
                        </>
                      ) : (
                        <ChevronDownIcon className="w-6 h-6 text-black mt-0.5" />
                      )}
                    </p>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-50 rounded-md p-2 mt-2 z-10">
                    <DropdownMenuItem
                      className="hover:bg-gray-200 hover:cursor-pointer hover:rounded-md p-2 hover:text-blue-400 hover:underline"
                      onClick={() => {
                        setModalType("createChannel");
                      }}
                    >
                      Create Channel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Divider */}
                <div className="divider -mt-1 -mb-2" />
              </div>
              {/* Channel Label */}
              <div className="w-full p-1 pl-3 flex flex-row justify-between">
                <div>
                  <button
                    className="btn btn-ghost -ml-1 justify-center"
                    onClick={() => setOpenChannelList(!openChannelList)}
                  >
                    {openChannelList ? (
                      <ChevronUpIcon className="w-4 h-4 text-black opacity-60 font-bold" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-black opacity-60 font-bold" />
                    )}
                  </button>
                </div>
                <div className="label justify-start">
                  <span className="label-text text-lg text-black font-bold opacity-60">
                    Channels
                  </span>
                </div>
                <div className="justify-end">
                  <button
                    className="btn btn-ghost ml-2"
                    onClick={() => {
                      setModalType("createChannel");
                    }}
                  >
                    <PlusIcon className="w-4 h-4 text-black opacity-60 font-bold" />
                  </button>
                </div>
              </div>
              {channelList.length !== 0 && openChannelList && (
                <>
                  {channelList.map((channel: ChannelStructure) => {
                    return (
                      <>
                        {projectID && (
                          <div
                            onClick={() => {
                              if (channel.userInChannel === true) {
                                setSelectedChannel(channel.channelID);
                              }
                              console.log(
                                `selectedChannel changed to ${channel.channelID}`
                              );
                            }}
                            className={`${
                              selectedChannel === channel.channelID
                                ? `bg-gray-400 bg-opacity-40`
                                : "bg-transparent"
                            } ${
                              channel.userInChannel === true
                                ? "text-black"
                                : "text-black text-opacity-50"
                            }`}
                          >
                            <Channel
                              key={channel.channelID.toString()}
                              channel={channel}
                              selectedChannel={selectedChannel}
                              userID={userID}
                              projectID={projectID}
                              onClose={closeModal}
                            />
                          </div>
                        )}
                      </>
                    );
                  })}
                </>
              )}
              {/* Button for "Back to Project" */}
              <div className="flex h-screen items-end justify-center mb-6">
                <button className="btn btn-ghost hover:underline hover:text-blue-400">
                  <Link href={`/user/project/${projectID}`} className="text-lg">
                    Back To Project
                  </Link>
                </button>
              </div>
            </div>
          </>
        </div>
        {/* Content */}
        <div className="w-4/6 bg-slate-50 min-h-screen">
          {selectedChannel !== null && projectID !== null && (
            <ChatContent
              channelID={selectedChannel}
              userID={userID}
              projectID={projectID}
            />
          )}
        </div>
        {/* Members */}
        <div className="w-1/6 bg-gray-200 min-h-screen">
          {selectedChannel !== null && projectID !== null && (
            <ChatMembers channelID={selectedChannel} userID={userID} />
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
