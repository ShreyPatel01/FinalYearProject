import { ObjectId } from "mongoose";
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/src/models/enums/status";
import Link from "next/link";

interface Task {
  taskID: ObjectId;
  taskName: string;
  taskStatus: string;
  taskDeadline: Date;
  taskDeadlineString: string;
  projectID: ObjectId;
  projectName: string;
}

interface AssignedTaskRowProps {
  task: Task;
}

const AssignedTaskRow: React.FC<AssignedTaskRowProps> = ({ task }) => {
  return (
    <TableRow>
      {/* Task Status */}
      <TableCell>
        <Badge
          className={`text-white w-fit h-full 
          ${task.taskStatus === TaskStatus.STARTED ? "bg-orange-600" : ""}
          ${task.taskStatus === TaskStatus.TESTING ? "bg-blue-600" : ""}
          ${task.taskStatus === TaskStatus.FINISHED ? "bg-green-600" : ""}
          ${task.taskStatus === TaskStatus.OVERDUE ? "bg-red-600" : ""}
          ${task.taskStatus === TaskStatus.NOTSTARTED ? "bg-gray-600" : ""}
          `}
        >
          {task.taskStatus}
        </Badge>
      </TableCell>
      {/* Task Name - Link to task page */}
      <TableCell>
        <>
          <Link
            href={`/user/project/${task.projectID.toString()}/task/${task.taskID.toString()}`}
            className="hover:underline hover:text-blue-400"
          >
            {task.taskName}
          </Link>
        </>
      </TableCell>
      {/* Project Name - Link to project dashboard */}
      <TableCell>
        <>
          <Link
            href={`/user/project/${task.projectID.toString()}`}
            className="hover:underline hover:text-blue-400"
          >
            {task.projectName}
          </Link>
        </>
      </TableCell>
      {/* Task Deadline */}
      <TableCell>{task.taskDeadlineString}</TableCell>
    </TableRow>
  );
};

export default AssignedTaskRow;
