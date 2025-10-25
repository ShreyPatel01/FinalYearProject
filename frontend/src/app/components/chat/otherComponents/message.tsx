"use client";
import { Badge } from "@/components/ui/badge";
import {
  PencilSquareIcon,
  UserIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useEffect, useRef, useState } from "react";
import { ObjectId } from "mongoose";
import axios from "axios";
import toast from "react-hot-toast";
import GetUserID from "@/src/helpers/getUserID";
import { chatRoles } from "@/src/models/enums/userRoles";

interface MessageStructure {
  messageID: ObjectId;
  messageContent: string;
  sentByID: ObjectId;
  sentBy: string;
  dateSent: Date;
  dateString: string;
  edited: boolean;
}

interface MessageProps {
  message: MessageStructure;
  onEdit: () => void;
  channelID: ObjectId;
  role: string;
}

const Message: React.FC<MessageProps> = ({
  message,
  onEdit,
  channelID,
  role,
}) => {
  const [editMessage, setEditMessage] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentUserID = GetUserID();
  let originalHeight = `auto`;

  const handleTextareaHeight = () => {
    if (editMessage) {
      const textarea = textareaRef.current!;
      if (textarea) {
        // Check if the textarea is empty
        if (textarea.value.trim() === "") {
          // If so, reset the height to the original size
          textarea.style.height = originalHeight;
        } else if (textarea.scrollHeight > textarea.clientHeight) {
          // If not, and the content overflows, expand the textarea
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      }
    }
  };

  useEffect(() => {
    if (editMessage) {
      const textarea = textareaRef.current!;
      if (textarea) {
        // Store the original height of the textarea
        originalHeight = `${textarea.clientHeight}px`;
        // Initially set the height to fit the content
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [editMessage]);

  //Removes message from database
  const deleteMessage = async () => {
    try {
      const response = await axios.delete(
        `/api/projects/chat/messages/deleteMessage`,
        { params: { channelID: channelID, messageID: message.messageID } }
      );
      if (response.data.success) {
        toast.success(`Successfully deleted the message`);
        onEdit();
      }
    } catch (error: any) {
      console.error("Error while deleting message: ", error);
    }
  };

  //Edits message in database
  const EditMessage = async () => {
    try {
      const requestBody = {
        messageID: message.messageID,
        newMessage: newMessage,
      };
      const response = await axios.put(
        `/api/projects/chat/messages/editMessage`,
        requestBody
      );
      if (response.data.success) {
        toast.success("Successfully edited the message");
        setEditMessage(false);
        onEdit();
      }
    } catch (error: any) {
      console.error("Error while editing message: ", error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Prevents form submission and instead calls EditMessage
      event.preventDefault();
      EditMessage();
    }
  };

  return (
    <div className="group w-full btn-ghost p-2 flex flex-row mb-2">
      <div className="flex items-center relative">
        <div className="avatar placeholder">
          <div className="ml-4 w-16 rounded-full justify-start border-2 border-gray-300">
            <UserIcon className="text-black rounded-full" />
          </div>
        </div>
      </div>
      {/* Message Stuff */}
      <div className="flex flex-col ml-4 w-full">
        {/* Message Time and Person who sent it */}
        <div className="flex-row flex">
          <p className="font-semibold text-xl">{message.sentBy}</p>
          <p className="opacity-60 ml-4 mt-0.5">{message.dateString}</p>
          {message.edited === true && (
            <p className="opacity-60 ml-4 mt-0.5">(edited)</p>
          )}
        </div>
        {/* Message Content */}
        <div className="flex flex-row w-full">
          {editMessage ? (
            <>
              <textarea
                ref={textareaRef}
                className="flex-grow m-2 input input-bordered bg-transparent border-black textarea text-lg w-fit"
                defaultValue={message.messageContent}
                onInput={handleTextareaHeight}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none hover:underline text-white mt-2"
                disabled={
                  newMessage === null ||
                  newMessage.trim().length === 0 ||
                  newMessage === message.messageContent
                }
                onClick={EditMessage}
              >
                Submit Edit
              </button>
              <button
                className="btn btn-neutral text-white hover:underline ml-2 mt-2"
                onClick={() => {
                  setEditMessage(false);
                  setNewMessage(null);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <p className="pt-1 text-lg break-words max-w-full w-full">
              {message.messageContent}
            </p>
          )}
        </div>
      </div>
      {/* Badge with Option Buttons */}
      {!editMessage && (
        <div className="flex align-top justify-end h-fit w-full invisible group-hover:visible">
          <Badge variant={"secondary"}>
            {currentUserID !== "nothing" &&
              currentUserID.toString() === message.sentByID.toString() && (
                <>
                  <button
                    className="p-1 btn-ghost rounded-md w-full"
                    onClick={() => setEditMessage(true)}
                  >
                    <PencilSquareIcon className="text-black w-4 h-4 ml-1" />
                  </button>
                  <div className="divider divider-horizontal text-white" />
                </>
              )}
            {(role === chatRoles.ADMIN ||
              role === chatRoles.MODERATOR ||
              currentUserID.toString() === message.sentByID.toString()) && (
              <Popover
                open={isPopoverOpen}
                onOpenChange={() => {
                  setIsPopoverOpen(!isPopoverOpen);
                }}
              >
                <PopoverTrigger asChild className="btn-ghost rounded-md w-full">
                  <TrashIcon className="text-black w-4 h-4 ml-1" />
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="flex flex-row p-1 justify-evenly">
                    <button
                      className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none hover:underline text-white"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        deleteMessage();
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-neutral hover:underline text-white"
                      onClick={() => {
                        setIsPopoverOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default Message;
