import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse, NextRequest } from "next/server";
import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import Task from "@/src/models/taskModel";

connect();

export async function DELETE(request: NextRequest) {
  try {
    const URLObject = new URL(request.url);
    const URLParams = new URLSearchParams(URLObject.search);
    const projectID = URLParams.get("projectID");
    const userID = URLParams.get("member");
    const user = await User.findOne({ _id: userID });
    console.log("user from leave project ", user);
    const username = user.username;
    console.log("username from user in leaveproject backend: ", username);
    const userTasks = user.userTasks;

    const project = await Project.findOne({ _id: projectID });
    console.log("project from leaveproject backend: ", project);
    if (project) {
      for (let taskCount = 0; taskCount < userTasks.length; taskCount++) {
        const task = await Task.findOne({ _id: userTasks[taskCount] });
        const taskID = task._id;
        const taskMembers = task.taskMembers.length;
        if (taskMembers == 1) {
          task.taskMembers[0] = "Not yet assigned";
        } else {
          task.taskMembers = task.taskMembers.filter(
            (member: any) => member !== username
          );
        }
        await task.save();
        const removeTaskFromUser = await User.findOneAndUpdate(
          {_id: userID},
          {$pull: {userTasks: taskID}}
        );
        await removeTaskFromUser.save();
      }
      await Project.updateOne(
        { _id: projectID },
        { $pull: { members: userID } }
      );
    } else {
      return NextResponse.json(
        { message: "project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
