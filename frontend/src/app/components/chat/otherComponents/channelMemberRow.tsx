"use client";
import { TableRow, TableCell } from "@/components/ui/table";
import { chatRoles } from "@/src/models/enums/userRoles";
import { UserMinusIcon } from "@heroicons/react/16/solid";
import { ObjectId } from "mongoose";
import React, { useState } from "react";

interface ChannelMemberStructure {
  userFullName: string;
  userID: ObjectId;
  role: string;
}

interface ChannelMemberRowProps {
  channelMember: ChannelMemberStructure;
  onRoleChange: (channelMemberID: string, role: string) => void;
  onKick: (channelMemberID: string) => void;
  currentUserRole: string;
}

const ChannelMemberRow: React.FC<ChannelMemberRowProps> = ({
  channelMember,
  onRoleChange,
  onKick,
  currentUserRole,
}) => {
  return (
    <TableRow>
      <TableCell className="w-[100px] text-center">
        {channelMember.userFullName}
      </TableCell>
      {currentUserRole === chatRoles.ADMIN && (
        <TableCell className="w-[100px]">
          <select
            className="select select-bordered w-full max-w-xs bg-slate-50 border-black focus:border-black text-center"
            value={channelMember.role}
            onChange={(e) => {
              onRoleChange(channelMember.userID.toString(), e.target.value);
            }}
          >
            {Object.values(chatRoles).map((role) => (
              <option key={role} value={role} className="text-center">
                {role}
              </option>
            ))}
          </select>
        </TableCell>
      )}
      <TableCell className="w-[100px] text-center">
        <button
          className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none hover:underline text-white"
          onClick={() => onKick(channelMember.userID.toString())}
        >
          <UserMinusIcon className="w-6 h-6 text-white" />
          Kick?
        </button>
      </TableCell>
    </TableRow>
  );
};

export default ChannelMemberRow;
