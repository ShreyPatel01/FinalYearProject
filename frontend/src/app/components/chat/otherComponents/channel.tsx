"use client";
import { UserGroupIcon, EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import DeleteChannelModal from "../modals/deleteChannelModal";
import RenameChannelModal from "../modals/renameChannelModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { ObjectId } from "mongoose";
import React, { useEffect, useState } from "react";
import { chatRoles } from "@/src/models/enums/userRoles";

interface Channel {
  channelID: ObjectId;
  channelName: string;
  userInChannel: boolean;
  userRole: string;
}

interface ChannelProps {
  channel: Channel;
  selectedChannel: ObjectId | null;
  userID: string;
  projectID: string;
  onClose: () => void;
}

const Channel: React.FC<ChannelProps> = ({
  channel,
  selectedChannel,
  userID,
  projectID,
  onClose,
}) => {
  const [openChannelOptions, setOpenChannelOptions] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string | null>(null);

  useEffect(() => {
    if (modalType === "renameChannel") {
      const element = document.getElementById(
        "renameChannelModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    } else if (modalType === "deleteChannel") {
      const element = document.getElementById(
        "deleteChannelModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    }
  }, [modalType]);

  const closeChildModal = () => {
    setModalType("");
  };

  return (
    <>
      {modalType === "renameChannel" && (
        <RenameChannelModal
          onClose={onClose}
          onChildClose={closeChildModal}
          originalName={channel.channelName}
          channelID={channel.channelID}
          userID={userID}
        />
      )}
      {modalType === "deleteChannel" && (
        <DeleteChannelModal
          onClose={onClose}
          onChildClose={closeChildModal}
          channelID={channel.channelID}
          userID={userID}
          projectID={projectID}
        />
      )}
      <div
        className={
          selectedChannel !== channel.channelID
            ? "btn-ghost rounded-l-xl flex flex-row mb-2 w-full justify-evenly ml-4"
            : "flex flex-row mb-2 w-full justify-evenly ml-4"
        }
      >
        <p>
          <UserGroupIcon className="w-7 h-7 text-black mt-3.5" />
        </p>
        <p className="ml-3 mt-3.5 text-lg">{channel.channelName}</p>
        {channel.userRole === chatRoles.ADMIN && (
          <DropdownMenu
            open={openChannelOptions}
            onOpenChange={() => setOpenChannelOptions(!openChannelOptions)}
          >
            <DropdownMenuTrigger className="btn btn-ghost">
              <EllipsisVerticalIcon className="w-5 h-5 text-black mt-2.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-50 rounded-md p-2 mt-2 z-10">
              <DropdownMenuItem
                className="hover:bg-gray-200 hover:cursor-pointer hover:rounded-md p-2 hover:text-blue-400 hover:underline"
                onClick={() => setModalType("renameChannel")}
              >
                Rename Channel
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-200 hover:cursor-pointer hover:rounded-md p-2 hover:text-blue-400 hover:underline"
                onClick={() => {
                  setModalType("deleteChannel");
                }}
              >
                Delete Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );
};

export default Channel;
