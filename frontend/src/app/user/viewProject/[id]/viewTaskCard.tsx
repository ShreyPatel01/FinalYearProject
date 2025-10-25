"use client";
import { TaskStatus } from "@/src/models/enums/status";
import axios from "axios";
import { ObjectId } from "mongoose";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ViewTaskCardProps {
  taskID: ObjectId;
  projectID: string;
}

const ViewTaskCard: React.FC<ViewTaskCardProps> = ({ taskID, projectID }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string | null>(null);
  const [taskDesc, setTaskDesc] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null)
  const [assignedMemberNames, setAssignedMemberNames] = useState<string | null>(
    null
  );
  const [taskDeadlineString, setTaskDeadlineString] = useState<string | null>(
    null
  );

  const fetchTaskCardDetails = async () => {
    try {
      const response = await axios.get(
        `/api/viewProjects/getIssueBoardDetails/getTaskDetails`,
        { params: { projectID: projectID, taskID: taskID } }
      );
      if (response.data.success) {
        toast.success(`fetched task card details`);
        setTaskName(response.data.name);
        setTaskDesc(response.data.desc);
        setAssignedMemberNames(response.data.members);
        setTaskDeadlineString(response.data.date);
        setTaskStatus(response.data.status);
      }
    } catch (error) {
      console.error(error);
      toast.error(`couldn't fetch task card details`);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTaskCardDetails();
    setLoading(false);
  }, []);

  return (
    <>
      {loading === false && (
        <div className="flex card w-80 h-fit bg-white shadow-xl cursor-pointer transition-all duration-50 ease-in-out transform hover:scale-105">
          <div className="flex card-body h-fit">
            <h2 className="flex card-title text-black text-center">
              <Link
                href={`/user/viewProject/${projectID}/task/${taskID}`}
                className="hover:underline"
              >
                {taskName}
              </Link>
            </h2>
            <p className={`text-white p-2 rounded-lg text-center ${
              taskStatus === TaskStatus.NOTSTARTED ? "bg-gray-600" : ""
            } ${
              taskStatus === TaskStatus.STARTED ? "bg-orange-600" : ""
            } ${
              taskStatus === TaskStatus.TESTING ? "bg-blue-600" : ""
            } ${
              taskStatus === TaskStatus.FINISHED ? "bg-green-600" : ""
            } ${taskStatus === TaskStatus.OVERDUE ? "bg-red-600" : ""}`}>
              Status: {taskStatus}
            </p>
            <textarea
              className="textarea text-black bg-white text-sm h-56 overflow-auto max-w-80 -ml-4"
              readOnly
              value={taskDesc ? taskDesc : ""}
            />
            <p className="flex text-black text-sm align-bottom justify-start">
              Assigned Members: {assignedMemberNames}
            </p>
            <p className="flex text-black text-sm align-bottom justify-start">
              Deadline date: {taskDeadlineString}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewTaskCard;
