import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import Task from "@/src/models/taskModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

interface AssignedTask {
  id: ObjectId;
  name: string;
}

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const userID = queryParams.get("userID");
    const assignedTasks: AssignedTask[] = [];

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        error: "Couldn't find user",
        status: 404,
        invalidUserID: userID,
      });
    }

    //Finding project in database
    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json({
        error: "Couldn't find project",
        status: 404,
        invalidProjectID: projectID,
      });
    }

    //Finding tasks with projectID and userID
    const tasks = await Task.find({
      projectID: project._id,
      taskMembers: { $in: [user._id] },
    });

    //Looping through tasks to create task object with name and id of task, and pushing to assignedTasks
    for (const task of tasks) {
      const taskName = task.taskName;
      const id = task._id;

      const taskObject = { id: id, name: taskName };
      assignedTasks.push(taskObject);
    }


    return NextResponse.json({success: true, taskList: assignedTasks});
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      error: error.message,
      message: "An unknown error occurred while fetching the assigned tasks",
      status: 500,
    });
  }
}
