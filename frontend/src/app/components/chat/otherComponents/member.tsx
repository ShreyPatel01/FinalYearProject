"use client";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ObjectId } from "mongoose";
import React from "react";
import Link from "next/link";

interface MemberProps {
  userID: ObjectId;
  userFullName: string;
  userInitials: string;
}

const Member: React.FC<MemberProps> = ({
  userFullName,
  userInitials,
  userID,
}) => {
  return (
    <div className="mt-2 ml-1 flex flex-row">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`/user/viewProfile/${userID.toString()}`}
              className="w-full"
            >
              <button className="w-full flex flex-row hover:bg-gray-400 p-2 rounded-xl hover:bg-opacity-40 transition-all ease-in-out">
                {/* Avatar */}
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-12">
                    <span>{userInitials}</span>
                  </div>
                </div>
                <div className="ml-3 mt-3">{userFullName}</div>
              </button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Profle</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Member;
