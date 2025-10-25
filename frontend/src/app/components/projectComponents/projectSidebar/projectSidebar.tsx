"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import InviteToProjectModal from "../inviteToProjectModal/inviteToProjectModal";
import LeaveProjectModal from "../leaveProjectModal/leaveProjectModal";
import GetUserID from "@/src/helpers/getUserID";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Member {
  _id: string;
  username: string;
}

const ProjectSidebar = () => {
  //Setting up variables
  const [projectID, setProjectID] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [admin, setAdmin] = useState("");
  const [mods, setMods] = useState<string[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const userID = GetUserID();
  const router = useRouter();

  //Fetching project ID from URL
  useEffect(() => {
    if (typeof window !== undefined) {
      const idFromURL = window.location.pathname.split("/")[3];
      setProjectID(idFromURL);
    }
  }, []);

  const getMembers = async () => {
    try {
      const response = await axios.get(
        `/api/projects/showProjectAttributes/getMembers?id=${projectID}`
      );
      const listOfMembers = response.data.data;
      const adminID = response.data.admin;
      const modList = response.data.modList;
      const clientList = response.data.clientList;
      setMembers(listOfMembers);
      setAdmin(adminID);
      setMods(modList);
      setClients(clientList);
      setIsAdmin(adminID.toString() === userID);
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (projectID !== null && userID !== "nothing") {
      getMembers();
    }
  }, [projectID, userID]);

  return (
    <main>
      {projectID !== null && <InviteToProjectModal id={projectID} />}
      {projectID !== null && <LeaveProjectModal id={projectID} />}
      <div className="flex justify-start h-full flex-col">
        <div className="min-w-72 px-4 mt-20 bg-slate-200 flex flex-col h-5/6 rounded-lg">
          <div className="pt-4 font-bold text-2xl flex-grow text-center">
            Members
          </div>
          <div className="flex flex-col pl-4 pt-4 h-full align-top">
            {members.map((member, index) => (
              <div className="flex flex-col pt-4" key={index}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/user/viewProfile/${member._id.toString()}`}
                        className="w-full"
                      >
                        <button className="btn btn-outline text-black w-full">
                          {admin !== "" && admin === member._id.toString()
                            ? "Project Admin: "
                            : ""}
                          {clients.length > 0 &&
                          clients.includes(member._id.toString())
                            ? "Project Client: "
                            : ""}
                          {mods.length > 0 &&
                          mods.includes(member._id.toString())
                            ? "Project mod: "
                            : ""}
                          {member.username}
                        </button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
          <div className="flex justify-center pb-4 items-center">
            {isAdmin && (
              <button
                className="btn btn-info text-white"
                onClick={() => {
                  const element = document.getElementById(
                    "inviteToProjectModal"
                  ) as HTMLDialogElement;
                  if (element) {
                    element.showModal();
                  }
                }}
              >
                Invite to Project
              </button>
            )}
            {!isAdmin && (
              <>
                <button className="btn btn-info text-white w-fit">
                  <Link href="/user/dashboard">Dashboard</Link>
                </button>
                <button
                  className="btn bg-red-600 text-white ml-2"
                  onClick={() => {
                    const element = document.getElementById(
                      "leaveProjectModal"
                    ) as HTMLDialogElement;
                    if (element) {
                      element.showModal();
                    }
                  }}
                >
                  Leave Project
                </button>
              </>
            )}
            {isAdmin && (
              <>
                <button className="btn btn-neutral text-white ml-2">
                  <Link
                    href={`/user/project/${projectID}/projectSettings/details`}
                  >
                    Project Settings
                  </Link>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProjectSidebar;
