"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { ObjectId } from "mongoose";
import React, { useState } from "react";
import ViewIssueDialog from "./viewIssueDialog";

interface Issue {
  id: ObjectId;
  type: string;
  name: string;
  desc: string;
  dateCreated: string;
  createdBy: string;
  relatedTaskName: string;
  relatedTaskID: ObjectId;
  status: string;
}
interface IssueRowProps {
  issue: Issue;
  role: string;
  projectID: string;
  onClose: () => void;
}

const IssueRow: React.FC<IssueRowProps> = ({
  issue,
  role,
  projectID,
  onClose,
}) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleClose = () => {
    onClose();
  };
  return (
    <TableRow>
      {/* Issue Type */}
      <TableCell className="text-center">{issue.type}</TableCell>
      {/* Issue Name - Also Dialog Trigger to view more details about issue */}
      <TableCell className='text-center'>
        <AlertDialog
          open={openDialog}
          onOpenChange={() => setOpenDialog(!openDialog)}
        >
          <AlertDialogTrigger className="hover:underline hover:text-blue-400">
            {issue.name}
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-5xl">
            <ViewIssueDialog
              role={role}
              issue={issue}
              projectID={projectID}
              onClose={() => {
                setOpenDialog(false);
                handleClose();
              }}
            />
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
      {/* Date Created */}
      <TableCell className="text-center">{issue.dateCreated}</TableCell>
      {/* Created By */}
      <TableCell className="text-center">{issue.createdBy}</TableCell>
      {/* Related Task */}
      <AlertDialog>
        <AlertDialogTrigger>
          <TableCell className="text-center">{issue.relatedTaskName}</TableCell>
        </AlertDialogTrigger>
      </AlertDialog>
      {/* Issue Status */}
      <TableCell className="text-center">{issue.status}</TableCell>
    </TableRow>
  );
};

export default IssueRow;
