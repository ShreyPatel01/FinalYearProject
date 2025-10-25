"use client";
import React, { useState, useEffect } from "react";
import ViewProjectData from "./viewProjectData";
import ViewProfileData from "./viewProfileData";

const ViewProfileContent = () => {
  const [chosenTab, setChosenTab] = useState<string>("profile");
  const [profileID, setProfileID] = useState<string | null>(null);

  useEffect(() => {
    if(typeof window !== undefined){
      const idFromURL = window.location.pathname.split("/")[3];
      setProfileID(idFromURL);
    }
  }, [])

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
        {chosenTab === "profile" && profileID !== null && (
          <ViewProfileData profileID={profileID} />
        )}
        {chosenTab === "projects" && profileID !== null && (
          <ViewProjectData profileID={profileID} />
        )}
      </div>
    </div>
  );
};

export default ViewProfileContent;
