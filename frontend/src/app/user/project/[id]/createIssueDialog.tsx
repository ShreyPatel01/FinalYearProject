"use client";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { ticketTypes } from "@/src/models/enums/ticketType";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ObjectId } from "mongoose";
import GetUserID from "@/src/helpers/getUserID";
import toast from "react-hot-toast";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AssignedTask {
  id: ObjectId;
  name: string;
}

interface CreateIssueDialogProps {
  projectID: string;
  onClose: () => void;
}

const CreateIssueDialog: React.FC<CreateIssueDialogProps> = ({ projectID, onClose }) => {
  const [disableInputs, setDisableInputs] = useState<boolean>(false);
  const [ticketType, setTicketType] = useState<string | null>(null);
  const [assignedTaskList, setAssignedTaskList] = useState<AssignedTask[]>([]);
  let [relatedTaskID, setRelatedTaskID] = useState<string | null>(null);
  const [issueName, setIssueName] = useState<string | null>(null);
  const [issueDesc, setIssueDesc] = useState<string | null>(null);
  const userID = GetUserID();

  //Fetching assigned tasks in project
  const fetchAssignedTasks = async () => {
    try {
      const response = await axios.get(
        `/api/projects/dashboard/tickets/getAssignedTasks`,
        { params: { projectID: projectID, userID: userID } }
      );
      if (response.data.success) {
        setAssignedTaskList(response.data.taskList);
        toast.success(`Fetched the assigned tasks`);
      }
    } catch (error: any) {
      toast.error(`Couldn't fetch assigned tasks`);
    }
  };

  useEffect(() => {
    if (ticketType === ticketTypes.BUG && assignedTaskList.length === 0) {
      setDisableInputs(true);
      fetchAssignedTasks();
      setDisableInputs(false);
    }
  }, [ticketType, assignedTaskList]);

  //Creating issue in database
  const createIssueTicket = async () => {
    try {
      let requestBody = {};
      if (ticketType === ticketTypes.SUGGEST) {
        requestBody = {
          name: issueName,
          desc: issueDesc,
          type: ticketType,
          projectID: projectID,
          userID: userID,
        };
      } else {
        requestBody = {
          name: issueName,
          desc: issueDesc,
          type: ticketType,
          projectID: projectID,
          relatedTaskID: relatedTaskID,
          userID: userID,
        };
      }
      console.log(requestBody)
      const response = await axios.post(
        `/api/projects/dashboard/tickets/createTicket`,
        requestBody
      );
      if (response.data.success) {
        toast.success(`Created the ticket`);
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unknown error occurred while creating the ticket.");
      }
      setDisableInputs(false);
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <p className="w-full text-center text-2xl font-semibold">
          Create An Issue Ticket
        </p>
      </AlertDialogHeader>
      <AlertDialogDescription className="w-full flex flex-col">
        {/* Select Issue Type */}
        <div className="label">
          <span className="label-text text-black text-opacity-60 font-semibold">
            Chosen Issue Type
          </span>
        </div>
        <Select
          onValueChange={(e) => {
            setTicketType(e);
            if (e === ticketTypes.SUGGEST) {
              setRelatedTaskID(null);
            }
          }}
          disabled={disableInputs}
        >
          <SelectTrigger className="text-black">
            <SelectValue
              placeholder="Select an issue type"
              className="text-black"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Issue Types</SelectLabel>
              <SelectItem value="Bug">{ticketTypes.BUG}</SelectItem>
              <SelectItem value="Suggestion">{ticketTypes.SUGGEST}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Select Related Task */}
        {ticketType === ticketTypes.BUG && assignedTaskList.length > 0 && (
          <div className="mt-4">
            <div className="label">
              <span className="text-black label-text text-opacity-60 font-semibold">
                Select Related Task
              </span>
            </div>
            <Select
              disabled={disableInputs}
              onValueChange={(e) => {
                setRelatedTaskID(e);
                console.log(`related task id is ${e}`);
              }}
            >
              <SelectTrigger className="text-black overflow-x-auto">
                <SelectValue
                  placeholder="Select the related task"
                  className="text-black"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Assigned Tasks</SelectLabel>
                  {assignedTaskList.length > 0 &&
                    assignedTaskList.map((task: AssignedTask) => (
                      <SelectItem
                        value={task.id.toString()}
                        className="text-black"
                      >
                        {task.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {(ticketType === ticketTypes.SUGGEST ||
          (ticketType === ticketTypes.BUG && relatedTaskID !== null)) && (
          <>
            {/* Issue Name Input Form */}
            <div className="label mt-4">
              <span className="label-text text-black text-opacity-60 font-semibold">
                New Issue Name
              </span>
            </div>
            <Input
              className="w-full text-black"
              placeholder="Enter your issue name"
              onChange={(e) => setIssueName(e.target.value)}
              value={issueName ? issueName : ""}
              disabled={disableInputs}
            />
            {/* Issue Description Input Form */}
            {issueName !== null && (
              <>
                <div className="label mt-4">
                  <span className="label-text text-black text-opacity-60 font-semibold">
                    New Issue Description
                  </span>
                </div>
                <Textarea
                  className="w-full text-black h-24"
                  placeholder="Enter your issue description here"
                  value={issueDesc ? issueDesc : ""}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  disabled={disableInputs}
                />
              </>
            )}
          </>
        )}
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel>
          <XCircleIcon className="w-4 h-4 text-black mr-2" />
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          className="bg-blue-600 hover:bg-blue-700"
          disabled={
            issueName === null ||
            issueDesc === null ||
            issueName === "" ||
            issueDesc === ""
          }
          onClick={(e) => {
            e.preventDefault();
            setDisableInputs(true);
            createIssueTicket();
          }}
        >
          <PlusCircleIcon className="w-4 h-4 text-white mr-2" />
          Create Ticket
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
};

export default CreateIssueDialog;
