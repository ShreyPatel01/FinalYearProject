import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { ObjectId } from "mongoose";
import React from "react";
import { projectRoles } from "@/src/models/enums/userRoles";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/16/solid";

interface User {
  id: ObjectId;
  userFullName: string;
  username: string;
  role: string;
}

interface MemberTableRowProps {
  member: User;
  projectID: string;
  onChange: () => void;
}

const MemberTableRow: React.FC<MemberTableRowProps> = ({
  member,
  projectID,
  onChange,
}) => {
  const changeRole = async (role: string) => {
    try {
      const requestBody = {
        newRole: role,
        oldRole: member.role,
        projectID: projectID,
        userID: member.id,
      };
      const response = await axios.put(
        `/api/projects/settings/changeRole`,
        requestBody
      );
      if (response.data.success) {
        toast.success(`Successfully updated role`);
        onChange();
      }
    } catch (error: any) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(
          `An unexpected error occurred while trying to change the role`
        );
      }
    }
  };

  const removeUser = async () => {
    try {
      const response = await axios.delete(
        `/api/projects/settings/removeFromProject`,
        { params: { userID: member.id, projectID: projectID } }
      );
      if (response.data.success) {
        toast.success(`Successfully removed user`);
        onChange();
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(
          `An unknown error occurred while trying to remove the user`
        );
      }
    }
  };
  return (
    <TableRow>
      <TableCell className="w-[300px]">{member.userFullName}</TableCell>
      <TableCell className="w-[300px]">{member.username}</TableCell>
      <TableCell className="w-[300px]">
        <Select onValueChange={(e) => changeRole(e)} value={member.role}>
          <SelectTrigger className="w-[200px] justify-center">
            <SelectValue className="text-black" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-black">Roles</SelectLabel>
              <SelectItem value={projectRoles.MOD}>
                {projectRoles.MOD}
              </SelectItem>
              <SelectItem value={projectRoles.CLIENT}>
                {projectRoles.CLIENT}
              </SelectItem>
              <SelectItem value={projectRoles.USER}>
                {projectRoles.USER}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="w-[300px]">
        <Button
          className="bg-red-600 hover:bg-red-700 hover:underline border-none hover:border-none text-white"
          onClick={removeUser}
        >
          <TrashIcon className="w-4 h-4 text-white mr-2" />
          Kick Member
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default MemberTableRow;
