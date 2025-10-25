import React from "react";
import { Toaster } from "react-hot-toast";
import ChatMembers from "./chatMembers";
import ChatPage from "./chatPage";

const ChatSystemPage = () => {
  return (
    <main className="min-w-screen min-h-screen bg-white flex flex-row">
      <div className="w-full">
        <ChatPage />
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default ChatSystemPage;
