"use client";
import React from "react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ObjectId } from "mongoose";
import ChannelMemberRow from "./channelMemberRow";
import axios from "axios";
import toast from "react-hot-toast";

interface ChannelMemberStructure {
  userFullName: string;
  userID: ObjectId;
  role: string;
}

interface ManageMembersProps {
  channelMembers: ChannelMemberStructure[];
  channelID: ObjectId;
  onChange: () => void;
  role: string
}

const ManageMembers: React.FC<ManageMembersProps> = ({ channelMembers, channelID, onChange, role }) => {
  //Updates the role of a member when the role is changed
  const updateUserRole = async (channelMemberID: string, role: string) => {
    try {
      const requestBody = {
        channelMemberID: channelMemberID,
        role: role,
        channelID: channelID,
      };
      const response = await axios.put(
        `/api/projects/chat/channels/settings/manageMembers`,
        requestBody
      );
      if (response.data.success) {
        toast.success(`Successfully updated the role of the channel member`);
        onChange();
      }
    } catch (error: any) {
      console.error(`Error while updating role: `, error);
    }
  };

  const removeUser = async (channeMemberID: string) => {
    try {
      const requestBody = {channelMemberID: channeMemberID, channelID: channelID}
      const response = await axios.put(`/api/projects/chat/channels/settings/kickChannelMember`, requestBody);
      if(response.data.success){
        toast.success(`Successfully removed channel member`)
        onChange();
      }
    } catch (error:any) {
      console.error(`Error while removing user from channel: `,error);
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
            <TableHead className="w-[100px] text-center">Role</TableHead>
            <TableHead className="w-[100px] text-center">Kick?</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channelMembers.length > 0 &&
            channelMembers.map((channelMember: ChannelMemberStructure) => (
              <>
                <ChannelMemberRow
                  channelMember={channelMember}
                  key={channelMember.userID.toString()}
                  onRoleChange={updateUserRole}
                  onKick={removeUser}
                  currentUserRole={role}
                />
              </>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManageMembers;
