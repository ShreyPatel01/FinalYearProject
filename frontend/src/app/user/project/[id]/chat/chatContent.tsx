"use client";
import { Button } from "@/components/ui/button";
import ChatInput from "@/src/app/components/chat/otherComponents/chatInput";
import Message from "@/src/app/components/chat/otherComponents/message";
import { chatRoles } from "@/src/models/enums/userRoles";
import { ArrowPathIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import { ObjectId } from "mongoose";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ChatContentProps {
  channelID: ObjectId;
  userID: string;
  projectID: string;
}

interface MessageStructure {
  messageID: ObjectId;
  messageContent: string;
  sentByID: ObjectId;
  sentBy: string;
  dateSent: Date;
  dateString: string;
  edited: boolean;
}

const ChatContent: React.FC<ChatContentProps> = ({
  channelID,
  userID,
  projectID,
}) => {
  const [messagesList, setMessagesList] = useState<MessageStructure[]>([]);
  const [role, setRole] = useState<string>(chatRoles.MEMBER);
  const [loading, setLoading] = useState<boolean>(true);

  //Getting the messages linked to the channel
  const retrieveChannelMessages = async () => {
    try {
      const response = await axios.get(
        `/api/projects/chat/messages/getMessages`,
        { params: { channelID: channelID } }
      );
      if (response.data.success) {
        console.log(response.data.messagesList);
        setMessagesList(response.data.messagesList);
        setRole(response.data.role);
      }
    } catch (error: any) {
      toast.error(`Couldn't fetch messages`);
      console.error(error);
    }
  };

  //Fetches the channel's messages whenever channelID changes
  useEffect(() => {
    retrieveChannelMessages();
    setLoading(false);
  }, [channelID]);

  //Retrieves the messages whenever a message is edited, deleted or sent
  const reloadContent = () => {
    setLoading(true);
    retrieveChannelMessages();
    setLoading(false);
  };

  return (
    <>
      {loading === false && (
        <div className="w-full h-screen bg-slate-50 flex flex-col">
          {/* Refresh messages section */}
          <div className="w-full flex h-fit align-top justify-end">
            <Button
              variant={"default"}
              className="mr-4 mt-4"
              onClick={() => retrieveChannelMessages()}
            >
              <ArrowPathIcon className="w-4 h-4 text-white" />
            </Button>
          </div>
          {/* Past Messages Section */}
          <div className="w-full h-screen flex align-top mt-4 flex-col overflow-y-auto">
            <div className="mr-4 ml-4">
              {messagesList.length !== 0 &&
                messagesList.map((messageObject: MessageStructure) => (
                  <Message
                    message={messageObject}
                    key={messageObject.messageID.toString()}
                    onEdit={reloadContent}
                    channelID={channelID}
                    role={role}
                  />
                ))}
            </div>
          </div>
          <div className="w-full align-bottom mb-6 flex justify-center">
            <ChatInput
              userID={userID}
              channelID={channelID}
              onSend={reloadContent}
              projectID={projectID}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatContent;
