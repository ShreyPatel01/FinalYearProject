import axios from "axios";
import React, { useEffect, useState } from "react";

interface ChildTaskCardProps {
  taskID: string;
  projectID: string;
}

const ChildTaskCard: React.FC<ChildTaskCardProps> = ({ taskID, projectID }) => {
  const [hasSetTask, setHasSetTask] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    name: "",
    members: [] as string[],
    comments: [],
    taskDeadline: "",
  });
  useEffect(() => {
    const getTaskDetails = async () => {
      try {
        const response = await axios.get(
          `/api/projects/showProjectAttributes/getTaskDetails?taskID=${taskID}`
        );
        setTaskDetails({
          ...taskDetails,
          name: response.data.taskName,
          members: response.data.taskMembers,
          comments: Array.isArray(response.data.comments)
            ? response.data.comments
            : [],
          taskDeadline: response.data.taskDeadline,
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
      <div className="flex card w-80 h-44 bg-white shadow-xl">
        <div className="flex card-body">
          <h2 className="flex card-title text-black text-center">
              {taskDetails.name}
          </h2>
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

export default ChildTaskCard;
