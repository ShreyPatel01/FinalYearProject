"use client";
import axios from "axios";
import { ObjectId } from "mongoose";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AssignedTaskRow from "./assignedTaskRow";
import GetUserID from "@/src/helpers/getUserID";
import { Badge } from "@/components/ui/badge";

interface Task {
  taskID: ObjectId;
  taskName: string;
  taskStatus: string;
  taskDeadline: Date;
  taskDeadlineString: string
  projectID: ObjectId;
  projectName: string;
}

const AssignedTaskList = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const userID = GetUserID();

  const fetchUserTasks = async () => {
    try {
      const response = await axios.get(
        `/api/user/dashboard/fetchAssignedTasks`,
        { params: { userID: userID } }
      );
      if (response.data.success) {
        console.log(response.data.taskList);
        setTaskList(response.data.taskList);
      }
    } catch (error) {
      toast.error(`Couldn't fetch the assigned tasks`);
      console.error(`Couldn't fetch assigned tasks: `, error);
    }
  };

  //Will fetch the assigned tasks on component load
  useEffect(() => {
    if (userID !== "nothing") {
      setLoading(true);
      fetchUserTasks();
      setLoading(false);
    }
  }, [userID]);

  return (
    <>
      {loading === false && (
        <>
          <Card className="h-[860px]">
            <CardHeader>
              <CardTitle>Assigned Tasks</CardTitle>
              <Badge className="w-fit p-1">
                Number of tasks: {taskList.length}
              </Badge>
            </CardHeader>
            <CardContent className="h-[710px] overflow-auto">
              <Table className='w-full'>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">Status</TableHead>
                    <TableHead className="w-[200px]">Task Name</TableHead>
                    <TableHead className="w-[200px]">From Project</TableHead>
                    <TableHead className="w-[200px]">Task Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskList.length > 0 && (
                    <>
                      {taskList.map((task: Task) => (
                        <AssignedTaskRow
                          task={task}
                          key={task.taskID.toString()}
                        />
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default AssignedTaskList;
