"use client";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
} from "@/components/ui/table";
import { ObjectId } from "mongoose";
import React from "react";
import ProjectMemberRow from "./projectMemberRow";
import axios from "axios";
import toast from "react-hot-toast";

interface ProjectMemberStructure {
  userFullName: string;
  userID: ObjectId;
}

interface InviteMembersProps {
  projectMembers: ProjectMemberStructure[];
  channelID: ObjectId;
  onChange: () => void;
}

const InviteMembers: React.FC<InviteMembersProps> = ({
  projectMembers,
  channelID,
  onChange,
}) => {

  const addProjectMember = async(projectMemberID: string) => {
    try {
        const requestBody = {channelID: channelID, projectMemberID: projectMemberID}
        const response = await axios.put(`/api/projects/chat/channels/settings/inviteMembers`, requestBody);
        if(response.data.success){
            toast.success(`Successfully added member to project`);
            onChange();
        }
    } catch (error:any) {
        console.error(`Error while adding project member to project`);
    }
  }
  return (
    <div className="overflow-y-auto max-h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">
              Name of User
            </TableHead>
            <TableHead className="w-[100px] text-center">Add</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectMembers.length > 0 &&
            projectMembers.map((projectMember: ProjectMemberStructure) => (
              <>
                <ProjectMemberRow
                  key={projectMember.userID.toString()}
                  projectMember={projectMember}
                  onAdd={addProjectMember}
                />
              </>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InviteMembers;
