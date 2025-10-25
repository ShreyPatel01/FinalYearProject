import User from "@/src/models/userModels";
import Task from "@/src/models/taskModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { TaskStatus } from "@/src/models/enums/status";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const taskID = queryParams.get("taskID");
    let assignedMemberNames = "";

    const task = await Task.findOne({ _id: taskID, projectID: projectID });
    if (!task) {
      return NextResponse.json({
        message: "task not found",
        status: 404,
        invalidTaskID: taskID,
        invalidProjectID: projectID,
      });
    }

    const taskName = task.taskName;
    const taskDesc = task.taskDesc;
    const dateDeadline = task.taskDeadline;
    const formattedDeadline = dateDeadline.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    //Finding out what the task status is
    let taskStatus;
    const currentDate = new Date();
    if (task.taskDeadline.getTime() < currentDate) {
      taskStatus = TaskStatus.OVERDUE;
      //Updating task status in task
      await Task.updateOne(
        { _id: task._id },
        { $set: { status: TaskStatus.OVERDUE } }
      );
    } else {
      taskStatus = task.status;
    }

    const assignedMemberIDs = task.taskMembers;
    for (let i = 0; i < assignedMemberIDs.length; i++) {
      const user = await User.findOne({ _id: assignedMemberIDs[i] });
      if (!user) {
        return NextResponse.json({
          message: "user not found",
          status: 404,
          invalidUserID: assignedMemberIDs[i],
        });
      }
      let userFullName = "";
      if (i === assignedMemberIDs.length - 1) {
        userFullName = `${user.firstName} ${user.lastName}`;
      } else {
        userFullName = `${user.firstName} ${user.lastName}, `;
      }
      assignedMemberNames += userFullName;
    }

    return NextResponse.json({
      success: true,
      name: taskName,
      desc: taskDesc,
      date: formattedDeadline,
      status: taskStatus,
      members: assignedMemberNames,
      message: "got task card details",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
