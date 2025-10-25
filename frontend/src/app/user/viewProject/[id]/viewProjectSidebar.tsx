"use client";
import GetAccountRole from "@/src/helpers/getAccountRole";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { userRoles } from "@/src/models/enums/userRoles";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ObjectId } from "mongoose";
import Link from "next/link";

interface Member {
  id: ObjectId;
  memberFullName: string;
}

const ViewProjectSidebar = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const role = GetAccountRole();
  const router = useRouter();
  const URL = usePathname();
  const URLParts = URL.split("/");
  const projectID = URLParts[URLParts.length - 1];

  const getMembers = async () => {
    try {
      const response = await axios.get(`/api/viewProjects/getMembers`, {
        params: { projectID: projectID },
      });
      if (response.data.success) {
        setMembers(response.data.members);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Couldn't fetch members`);
    }
  };

  useEffect(() => {
    setLoading(true);
    getMembers();
    setLoading(false);
  }, []);

  return (
    <>
      {loading === false && (
        <>
          <div className="flex justify-start h-full flex-col">
            <div className="min-w-72 px-4 mt-20 bg-slate-200 flex flex-col h-5/6 rounded-lg">
              <div className="pt-4 font-bold text-2xl w-full text-center">
                Members
              </div>
              <div className="flex flex-col pl-4 pt-4 h-full align-top">
                {members.map((member: Member, index) => (
                  <div
                    className="flex flex-col mt-4 w-full text-center"
                    key={index}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            className='w-full'
                            href={`/user/viewProfile/${member.id.toString()}`}
                          >
                            <button className="btn btn-ghost w-full">
                              {member.memberFullName}
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
                <button
                  className="btn bg-blue-600 text-white hover:bg-blue-700 border-none hover:border-none hover:underline w-full"
                  onClick={() => {
                    router.replace(
                      `/${
                        role === userRoles.CLIENT ? "client" : "user"
                      }/dashboard`
                    );
                  }}
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ViewProjectSidebar;
