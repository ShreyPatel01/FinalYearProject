import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Task from "@/src/models/taskModel";
import User from "@/src/models/userModels";
import ActivityLog from "@/src/models/activityLogModel";
import Comment from "@/src/models/taskCommentModel";
import { createActivityLog } from "@/src/helpers/createActivityLog";
import { createDeleteChildActivityLog } from "@/src/helpers/createDeleteChildActivityLog";
import { createChildTaskActivityLog } from "@/src/helpers/createChildTaskActivityLog";
import { createUpdateTaskActivityLog } from "@/src/helpers/createUpdateTaskActivityLog";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";
import { taskRoles } from "@/src/models/enums/userRoles";
import { TaskStatus } from "@/src/models/enums/status";

connect();

export async function POST(request: NextRequest) {
  try {
    let errors = [];
    const requestBody = await request.json();
    const {
      category,
      taskName,
      taskDesc,
      taskCreator,
      taskMembers,
      parentTask,
      projectID,
    } = requestBody.requestBody;

    console.log(requestBody.requestBody);

    const userInputtedChildTaskDetails = [taskName, taskDesc];

    userInputtedChildTaskDetails.forEach((element: string, index: number) => {
      const labelMessages = [
        "provide the child task name",
        "provide the child task description",
      ];
      if (element == null || element === "" || element.trim().length === 0) {
        const labelMessage = labelMessages[index];
        errors.push(`Please ${labelMessage}`);
      }
    });

    if (taskMembers.length === 0) {
      errors.push("Frontend requestBody error - taskMember not present");
    }

    //Sending errors if they exist
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    errors = [];

    //Gettting parent task deadline
    const originalTask = await Task.findOne({ _id: parentTask });
    const originalTaskDeadline = originalTask.taskDeadline;

    //Getting current date
    const currentDate = new Date().getTime();

    //Creating new instance of childTask
    const newChildTask = new Task({
      category: category,
      taskName: taskName,
      taskDesc: taskDesc,
      taskCreationDate: currentDate,
      taskCreator: taskCreator,
      taskDeadline: originalTaskDeadline,
      taskMembers: taskMembers,
      parentTaskID: parentTask,
      projectID: projectID,
      status: TaskStatus.STARTED
    });

    await newChildTask.save();

    await Task.findByIdAndUpdate(parentTask, {
      $push: { childTasks: newChildTask._id },
    });

    //Updating User with newChildTask id
    await User.findByIdAndUpdate(taskCreator, {
      $push: { userTasks: newChildTask._id },
    });

    //Getting username of taskCreator
    const creator = await User.findOne({ _id: taskCreator });
    const creatorUsername = creator.username;

    //Creating Activity Log for newChildTask and saving to DB
    const savedActivityLog = await createActivityLog(
      newChildTask._id,
      creatorUsername,
      projectID
    );
    console.log("New activity log for child task: ", savedActivityLog);

    //Creating Activity Log for parent task and saving to db
    const parentSavedActivityLog = await createChildTaskActivityLog(
      newChildTask._id,
      creatorUsername,
      parentTask,
      projectID
    );
    console.log(parentSavedActivityLog);

    //Getting role and sending to frontend
    let role = ''
    const userIDFromToken = await RetrieveIDFromToken(request);
    const user = await User.findOne({_id: userIDFromToken});
    if(user){
      if(newChildTask.taskCreator.toString() === userIDFromToken){
        role = taskRoles.CREATOR
      } else if(newChildTask.taskMember.includes(userIDFromToken)){
        role = taskRoles.ASSIGNEE
      }
    }

    return NextResponse.json({
      message: "Child Task has been created",
      success: true,
      newChildTask: newChildTask,
      newChildTaskID: newChildTask._id,
      role: role
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { childTaskID, username, projectID } = requestBody;
    console.log("childtaskid: ", childTaskID);
    const childTask = await Task.findOne({ _id: childTaskID });
    console.log("child Task from backend: ", childTask);

    //Deleting activities related to child task
    const childActivityIDs = childTask.activities;
    console.log("childactivityids: ", childActivityIDs);
    for (let i = 0; i < childActivityIDs.length; i++) {
      await ActivityLog.deleteOne({ _id: childActivityIDs[i] });
    }

    //Deleting comments related to child task in DB
    const childComments = childTask.taskComments;
    if (childComments !== null) {
      for (let i = 0; i < childComments.length; i++) {
        await Comment.deleteOne({ _id: childComments });
      }
    }

    //Removing child task from parent task
    const parentTask = childTask.parentTaskID;
    await Task.findByIdAndUpdate(parentTask, {
      $pull: { childTasks: childTaskID },
    });

    //Create activity log for parent task before deleting child task
    const childTaskName = childTask.taskName;
    createDeleteChildActivityLog(parentTask, username, childTaskName, projectID);

    //Removing child task from db
    await Task.deleteOne({ _id: childTaskID });

    return NextResponse.json({
      message: "successfuly deleted child task",
      success: true,
    });
  } catch (error: any) {
    console.error("error from backend: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();

    const {
      taskID,
      username,
      changedAttributes,
      oldAttributeValues,
      newAttributeValues,
      projectID,
    } = requestBody.requestBody;

    const convertDateFormat = (input: any) => {
      // Split the input string into date and time parts
      const [datePart, timePart] = input.split(", ");
      // Split the date part into day, month, and year
      const [day, month, year] = datePart.split("/");
      // Split the time part into hours, minutes, and period (am/pm)
      const [time, period] = timePart.split(" ");
      const [hours, minutes] = time.split(":");

      // Convert the month from 1-based to 0-based (since JavaScript's Date uses 0-based months)
      const monthIndex = parseInt(month, 10) - 1;

      // Ensure hours and minutes are parsed as numbers
      const hours24 = parseInt(hours, 10);
      const minutes24 = parseInt(minutes, 10);

      // Adjust hours for PM
      const adjustedHours = period === "pm" ? hours24 + 12 : hours24;

      // Construct a Date object
      const date = new Date(year, monthIndex, day, adjustedHours, minutes24);

      // Convert the Date object to ISO string format
      const isoString = date.toISOString();

      return isoString;
    };

    console.log("requestbody from backend: ", requestBody.requestBody);

    //Updating the task details
    let update: { [key: string]: any } = {};
    for (let i = 0; i < changedAttributes.length; i++) {
      if (changedAttributes[i] === "taskDeadline") {
        const dateToFormat = newAttributeValues[i];
        const formattedDate = convertDateFormat(dateToFormat);
        update[changedAttributes[i]] = formattedDate;
      } else {
        update[changedAttributes[i]] = newAttributeValues[i];
      }
    }
    const updatedTask = await Task.findByIdAndUpdate(taskID, update);

    //Creating Activity Log for the update
    const savedActivityLog = createUpdateTaskActivityLog(
      taskID,
      username,
      changedAttributes,
      oldAttributeValues,
      newAttributeValues,
      projectID
    );

    return NextResponse.json({
      message: "Task has been updated and activity log created",
      success: true,
      updatedTask: updatedTask,
      activityLog: savedActivityLog,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
