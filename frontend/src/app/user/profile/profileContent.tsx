"use client";
import GetUserID from "@/src/helpers/getUserID";
import React, { useState } from "react";
import ProfileData from "../../components/userComponents/profile/profileData";
import ProjectContent from "./projectContent";

const ProfileContent = () => {
  const [chosenTab, setChosenTab] = useState<string>("profile");
  return (
    <div className="w-full flex flex-row h-screen pt-16">
      {/* Options */}
      <div className="w-1/5 border-r-[3px] border-black border-opacity-25">
        <div className="flex flex-col w-full h-full justify-center align-center -mt-16">
          <button
            className={`btn btn-ghost ${
              chosenTab === "profile"
                ? "text-blue-400 underline hover:bg-transparent"
                : "hover:text-blue-400 hover:underline"
            }`}
            onClick={() => {
              if (chosenTab !== "profile") {
                setChosenTab("profile");
              }
            }}
          >
            Profile
          </button>
          <button
            className={`btn btn-ghost ${
              chosenTab === "projects"
                ? "text-blue-400 underline hover:bg-transparent"
                : "hover:text-blue-400 hover:underline"
            }`}
            onClick={() => {
              if (chosenTab !== "projects") {
                setChosenTab("projects");
              }
            }}
          >
            Projects
          </button>
        </div>
      </div>
      <div className="w-4/5 px-60 overflow-y-auto">
        {chosenTab === "profile" && <ProfileData />}
        {chosenTab === 'projects' && <ProjectContent />}
      </div>
    </div>
  );
};

export default ProfileContent;
