import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { TaskStatus } from "@/src/models/enums/status";

interface TaskCardProps {
  taskID: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ taskID }) => {
  const [hasSetTask, setHasSetTask] = useState(false);
  const [projectID, setProjectID] = useState("");
  const [taskDetails, setTaskDetails] = useState({
    name: "",
    desc: "",
    status: "",
    members: [] as string[],
    comments: [],
    membersString: "",
    taskDeadline: "",
  });
  useEffect(() => {
    if (typeof window !== undefined) {
      setProjectID(window.location.pathname.split("/")[3]);
    }
    const getTaskDetails = async () => {
      try {
        const response = await axios.get(
          `/api/projects/showProjectAttributes/getTaskDetails?taskID=${taskID}`
        );
        setTaskDetails({
          ...taskDetails,
          name: response.data.taskName,
          desc: response.data.taskDesc,
          members: response.data.taskMembers,
          comments: Array.isArray(response.data.comments)
            ? response.data.comments
            : [],
          membersString: response.data.taskMembersString,
          taskDeadline: response.data.taskDeadline,
          status: response.data.status,
        });
      } catch (error: any) {
        console.error(
          "An error occurred while fetching the task details ",
          error
        );
      }
    };
    if (!hasSetTask) {
      getTaskDetails();
      setHasSetTask(true);
    }
  }, [taskID, projectID]);
  console.log("Task details from taskCard: ", taskDetails);
  return (
    <>
      <div
        className="flex card w-80 h-fit bg-white shadow-xl cursor-pointer transition-all duration-50 ease-in-out transform hover:scale-105"
        draggable="true"
      >
        <div className="flex card-body h-fit">
          <h2 className="flex card-title text-black text-center">
            <Link
              href={`/user/project/${projectID}/task/${taskID}`}
              className="hover:underline"
            >
              {taskDetails.name}
            </Link>
          </h2>
          <p
            className={`text-white p-2 rounded-lg text-center ${
              taskDetails.status === TaskStatus.NOTSTARTED ? "bg-gray-600" : ""
            } ${
              taskDetails.status === TaskStatus.STARTED ? "bg-orange-600" : ""
            } ${
              taskDetails.status === TaskStatus.TESTING ? "bg-blue-600" : ""
            } ${
              taskDetails.status === TaskStatus.FINISHED ? "bg-green-600" : ""
            } ${taskDetails.status === TaskStatus.OVERDUE ? "bg-red-600" : ""}`}
          >
            Status: {taskDetails.status}
          </p>
          <textarea
            className="textarea text-black bg-white text-sm h-56 overflow-auto max-w-80 -ml-4"
            readOnly
            value={taskDetails.desc}
          />
          <p className="flex text-black text-sm align-bottom justify-start">
            Assigned Members: {taskDetails.members}
          </p>
          <p className="flex text-black text-sm align-bottom justify-start">
            Deadline date: {taskDetails.taskDeadline}
          </p>
        </div>
      </div>
    </>
  );
};

export default TaskCard;
