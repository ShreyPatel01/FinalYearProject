import { TableCell, TableRow } from "@/components/ui/table";
import { UserPlusIcon } from "@heroicons/react/16/solid";
import { ObjectId } from "mongoose";
import React from "react";

interface ProjectMemberStructure {
  userFullName: string;
  userID: ObjectId;
}

interface ProjectMemberRowProps {
  projectMember: ProjectMemberStructure;
  onAdd: (userID: string) => void;
}

const ProjectMemberRow: React.FC<ProjectMemberRowProps> = ({
  projectMember,
  onAdd,
}) => {
  return (
    <TableRow>
      <TableCell className="w-[100px] text-center">
        {projectMember.userFullName}
      </TableCell>
      <TableCell className="w-[100px] text-center">
        <button
          className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none hover:underline text-white"
          onClick={() => onAdd(projectMember.userID.toString())}
        >
          <UserPlusIcon className="w-6 h-6 text-white" />
          Add
        </button>
      </TableCell>
    </TableRow>
  );
};

export default ProjectMemberRow;
