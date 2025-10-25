"use client";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ticketStatus, ticketTypes } from "@/src/models/enums/ticketType";
import { projectRoles } from "@/src/models/enums/userRoles";
import {
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import axios from "axios";
import { ObjectId } from "mongoose";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";

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

interface ViewIssueDialogProps {
  role: string;
  issue: Issue;
  onClose: () => void;
  projectID: string;
}

const ViewIssueDialog: React.FC<ViewIssueDialogProps> = ({
  role,
  issue,
  onClose,
  projectID,
}) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [editedIssueName, setEditedIssueName] = useState<string | null>(null);
  const [editedIssueDesc, setEditedIssueDesc] = useState<string | null>(null);
  const [editedIssueStatus, setEditedIssueStatus] = useState<string | null>(
    null
  );

  const updateTicket = async () => {
    try {
      const requestBody = {
        newIssueName: editedIssueName,
        newIssueDesc: editedIssueDesc,
        newIssueStatus: editedIssueStatus,
        issueID: issue.id,
      };
      const response = await axios.put(
        `/api/projects/dashboard/tickets/updateTicket`,
        requestBody
      );
      if (response.data.success) {
        toast.success(`Updated Ticket`);
        onClose();
      }
    } catch (error: any) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unknown error occurred while updating the ticket");
      }
    }
  };

  const deleteTicket = async () => {
    try {
      const response = await axios.delete(
        `/api/projects/dashboard/tickets/deleteTicket`,
        { params: { issueID: issue.id } }
      );
      if (response.data.success) {
        toast.success(`Deleted the issue`);
        onClose();
      }
    } catch (error: any) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unknown error occurred while deleting the ticket");
      }
    }
  };

  return (
    <>
      <AlertDialogHeader className="flex flex-row justify-between">
        {edit === true ? (
          <Input
            className="text-black mt-2"
            value={editedIssueName ? editedIssueName : issue.name}
            onChange={(e) => setEditedIssueName(e.target.value)}
          />
        ) : (
          <p className="text-black font-semibold mt-4 text-lg">{issue.name}</p>
        )}
        {role === projectRoles.ADMIN && edit === true && (
          <Button
            variant={"default"}
            className="ml-2"
            onClick={() => {
              setEdit(false);
              setEditedIssueDesc(null);
              setEditedIssueName(null);
            }}
          >
            <XCircleIcon className="w-4 h-4 text-white mr-2" />
            Cancel Edit
          </Button>
        )}
        {role === projectRoles.ADMIN && edit === false && (
          <div className="flex flex-row">
            <Button variant={"destructive"} onClick={() => deleteTicket()}>
              <TrashIcon className="w-4 h-4 text-white mr-2" />
              Delete Issue
            </Button>
            <Button
              variant={"default"}
              className="ml-2"
              onClick={() => setEdit(true)}
            >
              <PencilSquareIcon className="w-4 h-4 text-white mr-2" />
              Edit Issue
            </Button>
          </div>
        )}
      </AlertDialogHeader>
      <AlertDialogDescription className="flex flex-col w-full">
        {/* Issue Status */}
        <div className="w-full flex flex-row">
          <p className="p-2 rounded-lg text-white bg-gray-600 mr-2 font-semibold">
            Created By:{issue.createdBy}
          </p>
          <p className="p-2 rounded-lg text-white bg-gray-600 mr-2 font-semibold">
            Type: {issue.type}
          </p>
          {edit === false ? (
            <p
              className={`text-white p-2 rounded-lg w-fit font-semibold ${
                issue.status === ticketStatus.ONGOING ? "bg-orange-600" : ""
              } ${
                issue.status === ticketStatus.FINISHED ? "bg-green-600" : ""
              }`}
            >
              Status: {issue.status}
            </p>
          ) : (
            <Select onValueChange={(e) => setEditedIssueStatus(e)}>
              <SelectTrigger className="w-[250px] bg-slate-50 text-black">
                <SelectValue
                  placeholder="Select a ticket status"
                  className="text-black"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Ticket Statuses</SelectLabel>
                  <SelectItem value={ticketStatus.ONGOING}>
                    {ticketStatus.ONGOING}
                  </SelectItem>
                  <SelectItem value={ticketStatus.FINISHED}>
                    {ticketStatus.FINISHED}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
        {/* Related Task if issue is a bug */}
        {issue.type === ticketTypes.BUG && (
          <>
            <div className="label mt-4">
              <span className="label-text text-black font-semibold text-opacity-60 text-lg">
                Related Task
              </span>
            </div>
            <Link
              href={`/user/project/${projectID}/task/${issue.relatedTaskID.toString()}`}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    <Textarea
                      value={issue.relatedTaskName}
                      readOnly
                      className="text-black hover:underline hover:text-blue-400 w-full h-fit cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-white font-semibold">
                    View Task Details
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          </>
        )}
        {/* Issue Description */}
        <div className="label mt-4">
          <span className="text-black text-opacity-60 label-text text-lg font-semibold">
            Issue Description
          </span>
        </div>
        <Textarea
          className="text-black h-fit w-full"
          value={editedIssueDesc ? editedIssueDesc : issue.desc}
          disabled={edit === false}
          onChange={(e) => setEditedIssueDesc(e.target.value)}
        />
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>
          <XCircleIcon className="w-4 h-4 text-black mr-2" />
          Close
        </AlertDialogCancel>
        {edit === true && (
          <AlertDialogAction
            className="bg-blue-600 hover:bg-blue-700 hover:underline text-white"
            disabled={
              (editedIssueName === null || editedIssueName === "") &&
              (editedIssueDesc === null || editedIssueDesc === "") &&
              editedIssueStatus === null
            }
            onClick={() => {
              updateTicket();
            }}
          >
            <CheckCircleIcon className="w-4 h-4 text-white mr-2" />
            Submit Edit
          </AlertDialogAction>
        )}
      </AlertDialogFooter>
    </>
  );
};

export default ViewIssueDialog;
