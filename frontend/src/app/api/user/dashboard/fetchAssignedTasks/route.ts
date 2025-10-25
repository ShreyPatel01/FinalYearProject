import User from "@/src/models/userModels";
import Task from "@/src/models/taskModel";
import Project from "@/src/models/projectModel";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { ObjectId } from "mongoose";
import { TaskStatus } from "@/src/models/enums/status";

connect();

interface Task {
  taskID: ObjectId;
  taskName: string;
  taskStatus: string;
  taskDeadline: Date;
  taskDeadlineString: string
  projectID: ObjectId;
  projectName: string;
}

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const userID = queryParams.get("userID");
    let TaskList: Task[] = [];

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        message: "User not found",
        status: 404,
        invalidUserID: userID,
      });
    }

    //Retrieving the tasks assigned to the user
    const userTasks = user.userTasks;

    for (const taskID of userTasks) {
      //Finding task in database
      const dbTaskInstance = await Task.findOne({ _id: taskID });
      if (!dbTaskInstance) {
        return NextResponse.json({
          message: "Task not found",
          status: 404,
          invalidTaskID: taskID,
        });
      }

      const status = dbTaskInstance.status;
      if (status !== TaskStatus.FINISHED) {
        //Fetching details needed for assigned task list and pushing to taskObject
        const id = dbTaskInstance._id;
        const name = dbTaskInstance.taskName;
        const deadline = dbTaskInstance.taskDeadline;

        //Converting deadline to formatted string
        const formattedDeadline = format(
          deadline,
          "dd/MM/yyyy HH:mm"
        ).toString();
        const idOfProject = dbTaskInstance.projectID;
        const nameOfProject = (await Project.findOne({_id: idOfProject})).projectName;
        

        const taskObject = {
          taskID: id,
          taskName: name,
          taskStatus: status,
          taskDeadline: deadline,
          taskDeadlineString: formattedDeadline,
          projectID: idOfProject,
          projectName: nameOfProject,
        };

        //Pushing taskObject to TaskList
        TaskList.push(taskObject);
      }
    }

    TaskList.sort((a, b) => {
      const dateA = new Date(a.taskDeadline);
      const dateB = new Date(b.taskDeadline);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json({
      success: true,
      message: "Fetched all assigned tasks that aren't completed",
      taskList: TaskList,
    });
  } catch (error: any) {
    console.error(`Error fetching assigned tasks: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
