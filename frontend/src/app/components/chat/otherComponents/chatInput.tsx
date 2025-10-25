"use client";
import React, { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { ObjectId } from "mongoose";
import axios from "axios";
import toast from "react-hot-toast";

interface ChatInputProps {
  userID: string;
  channelID: ObjectId;
  onSend: () => void;
  projectID: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ userID, channelID, onSend, projectID }) => {
  const [message, setMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  let originalHeight = "auto";

  const handleTextareaHeight = () => {
    const textarea = textareaRef.current!;
    // Check if the textarea is empty and set textarea height to original height
    if (textarea.value.trim() === "") {
      textarea.style.height = originalHeight;
      //Expands the textarea height to scrollHeight when the input overflows
    } else if (textarea.scrollHeight > textarea.clientHeight) {
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current!;
    // Store the original height of the textarea
    originalHeight = `${textarea.clientHeight}px`;
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // Prevents form submission and instead calls createTextMessage
      event.preventDefault(); 
      createTextMessage();
    }
 };

  //Needs to be reworked for sockets
  const createTextMessage = async () => {
    try {
      const requestBody = {message, userID, channelID, projectID};
      const response = await axios.post(`/api/projects/chat/messages/sendMessage`, requestBody);
      if(response.data.success){
        setMessage(null);
        toast.success('sent a message');
        onSend();
      }
    } catch (error: any) {
      toast.error(`Couldn't send a message`)
    }
  };

  return (
    <div className="w-full bg-slate-50 border border-black border-opacity-60 rounded-md p-2 ml-4 mr-4">
      <div className="flex items-center">
        <textarea
          ref={textareaRef}
          className="w-full ml-2 input input-bordered bg-transparent border-none textarea text-lg"
          value={message || ''}
          placeholder={message ? '' : 'Type your message here...'}
          onInput={handleTextareaHeight}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="hover:bg-gray-200 hover:bg-opacity-60 p-2 hover:rounded-md text-gray-400 hover:text-black transition-all 0.2s"
          disabled={message === null || message.trim().length === 0}
          onClick={createTextMessage}
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
