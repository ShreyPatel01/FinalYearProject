"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ObjectId } from "mongoose";
import axios from "axios";
import toast from "react-hot-toast";
import MemberTableRow from "./MemberTableRow";
import GetUserID from "@/src/helpers/getUserID";

interface User {
  id: ObjectId;
  userFullName: string;
  username: string;
  role: string;
}

interface MemberTableProps {
  projectID: string;
}
const MemberTable: React.FC<MemberTableProps> = ({ projectID }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [memberList, setMemberList] = useState<User[]>([]);
  const userID = GetUserID();

  //Gets all members of project and their roles
  const fetchOtherMembers = async () => {
    try {
      const response = await axios.get(
        `/api/projects/settings/getProjectMembers`,
        { params: { projectID: projectID, userID: userID } }
      );
      if (response.data.success) {
        setMemberList(response.data.memberList);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (projectID !== "nothing" && userID !== "nothing") {
      fetchOtherMembers();
      setLoading(false);
    }
  }, [projectID,userID]);

  return (
    <div className="w-full items-center justify-center h-full flex">
      {loading === false && (
        <>
          {memberList && (
            <div className="flex justify-center">
              <Table className="border-black border-2">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-black w-[300px]">
                      Name of User
                    </TableHead>
                    <TableHead className="font-semibold text-black w-[300px]">
                      Username
                    </TableHead>
                    <TableHead className="font-semibold text-black w-[300px]">
                      Role
                    </TableHead>
                    <TableHead className="font-semibold text-black w-[300px]">
                      Kick?
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberList.map((member: User) => (
                    <MemberTableRow
                      member={member}
                      projectID={projectID}
                      onChange={fetchOtherMembers}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberTable;
