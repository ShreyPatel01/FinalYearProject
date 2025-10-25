import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Task from "@/src/models/taskModel";
import Category from "@/src/models/categoryModel";
import User from "@/src/models/userModels";
import ActivityLog from "@/src/models/activityLogModel";
import Comment from "@/src/models/taskCommentModel";
import { formatDistanceToNow } from "date-fns";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";
import { taskRoles } from "@/src/models/enums/userRoles";
import { TaskStatus } from "@/src/models/enums/status";

connect();

export async function GET(request: NextRequest) {
  const URLParams = new URLSearchParams(new URL(request.url).search);
  const taskID = URLParams.get("taskID");
  console.log("task id  from backend: " + taskID);

  const task = await Task.findOne({ _id: taskID });
  if (!task) {
    return NextResponse.json({ message: "Task not found", success: false });
  }
  console.log("task from backend: " + task);

  //Getting task creator
  const taskCreator = task.taskCreator;

  //Converting task creator to user's first and last name
  const user = await User.findOne({ _id: taskCreator });
  const creatorName = user.firstName + " " + user.lastName;
  //Fetching comments from task
  const taskComments = task.taskComments;

  //Fetching child tasks and parent tasks from task
  const childTaskIDs = task.childTasks;
  let childTaskNames = [];
  if (childTaskIDs !== undefined) {
    for (
      let childTaskCount = 0;
      childTaskCount < childTaskIDs.length;
      childTaskCount++
    ) {
      const childTask = await Task.findOne({
        _id: childTaskIDs[childTaskCount],
      });
      childTaskNames.push(childTask.taskName);
    }
  }
  console.log("childTaskNames from backend: ", childTaskNames);
  const parentTaskID = task.parentTaskID;
  const parentTaskName = task.parentTaskName;

  //Finding out what the task status is
  let taskStatus;
  const currentDate = new Date();
  if (task.taskDeadline.getTime() < currentDate && task.status !== TaskStatus.FINISHED) {
    taskStatus = TaskStatus.OVERDUE;
    //Updating task status in task
    await Task.updateOne(
      { _id: task._id },
      { $set: { status: TaskStatus.OVERDUE } }
    );
  } else {
    taskStatus = task.status;
  }

  //Converting task.taskCreationDate to understandable string
  const taskCreationDate = new Date(task.taskCreationDate);
  const formattedCreation = taskCreationDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  //Converting task.taskDeadline to understandable string
  const taskDeadlineDate = new Date(task.taskDeadline);
  const formattedDeadline = taskDeadlineDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  //Getting category details from task
  const category = await Category.findOne({ _id: task.category });
  const categoryName = category.categoryName;
  const categoryColour = category.colour;

  //Fetching activity logs from task
  const activityLogIDs = task.activities;
  let activityLogs = [];
  if (activityLogIDs !== null || activityLogIDs.length === 0) {
    for (
      let activityLogCount = 0;
      activityLogCount < activityLogIDs.length;
      activityLogCount++
    ) {
      //Retrieving activityLog from DB
      const activityLog = await ActivityLog.findOne({
        _id: activityLogIDs[activityLogCount],
      });
      //Getting attributes of
      const action = activityLog.action;
      const dateOfAction = activityLog.dateOfAction;
      const humanisedTimeDifference = formatDistanceToNow(dateOfAction, {
        addSuffix: true,
      });
      const taskName = task ? task.taskName : null;
      let activityLogString = "";
      switch (action) {
        case "CREATED":
          activityLogString = `${activityLog.username} created the task "${taskName}" ${humanisedTimeDifference}`;
          activityLogs.push(activityLogString);
          break;
        case "UPDATED TASK":
          const updatedAttributes = activityLog.updatedAttributes;
          const oldAttributeValues = activityLog.oldAttributeValues;
          const newAttributeValues = activityLog.newAttributeValues;
          for (
            let taskUpdateCount = 0;
            taskUpdateCount < updatedAttributes.length;
            taskUpdateCount++
          ) {
            activityLogString = `${activityLog.username} changed "${updatedAttributes[taskUpdateCount]}" from "${oldAttributeValues[taskUpdateCount]}" to "${newAttributeValues[taskUpdateCount]}" ${humanisedTimeDifference} `;
            activityLogs.push(activityLogString);
          }
          break;
        case "ADDED COMMENT":
          //Getting the comment content before adding the comment to the string
          const comment = await Comment.findOne({ _id: activityLog.commentID });
          const commentContent = comment.comment;
          activityLogString += `${activityLog.username} added a comment ${humanisedTimeDifference}: "${commentContent}"`;
          activityLogs.push(activityLogString);
          break;
        case "CREATED CHILD TASK":
          //Getting the childTaskName from the activityLog
          const childTaskName = activityLog.childTaskName;
          activityLogString = `${activityLog.username} created a child task ${humanisedTimeDifference}: ${childTaskName}`;
          activityLogs.push(activityLogString);
          break;
        case "DELETED CHILD TASK":
          const deletedChild = activityLog.deletedChildTask;
          activityLogString = `${activityLog.username} deleted the child task "${deletedChild}" ${humanisedTimeDifference}`;
          activityLogs.push(activityLogString);
          break;
        case "CHANGED TASK SPRINT":
          const newSprintNo = activityLog.newSprintNo;
          const oldSprintNo = activityLog.oldSprintNo;
          activityLogString = `${activityLog.username} moved the task from sprint ${oldSprintNo} to sprint ${newSprintNo} ${humanisedTimeDifference}`;
          activityLogs.push(activityLogString);
        case "UPDATED CATEGORY":
          const oldCategoryName = activityLog.oldCategoryName;
          const newCategoryName = activityLog.newCategoryName;
          activityLogString = `${activityLog.username} changed the category from ${oldCategoryName} to ${newCategoryName} ${humanisedTimeDifference}`;
          activityLogs.push(activityLogString);
        default:
          break;
      }
    }
  }

  //Converting task member IDs to usernames
  const memberIDs = task.taskMembers;
  let usernames = [];
  for (let i = 0; i < memberIDs.length; i++) {
    const user = await User.findOne({ _id: memberIDs[i] });
    if (user) {
      if (memberIDs.length === 1) {
        usernames.push(user.username);
      } else {
        if (i !== memberIDs.length - 1) {
          usernames.push(`${user.username}, `);
        } else {
          usernames.push(user.username);
        }
      }
    }
  }

  //Checking the user's role and sending it to the frontend
  let role = "";
  const userIDFromToken = await RetrieveIDFromToken(request);
  const userFromToken = await User.findOne({ _id: userIDFromToken });
  if (userFromToken) {
    if (userIDFromToken.toString() === task.taskCreator.toString()) {
      role = taskRoles.CREATOR;
    } else if (memberIDs.includes(userIDFromToken.toString())) {
      role = taskRoles.ASSIGNEE;
    }
  }

  return NextResponse.json({
    message: "Task found",
    success: true,
    taskName: task.taskName,
    taskDesc: task.taskDesc,
    taskMembers: usernames,
    taskDeadline: formattedDeadline,
    taskComments: taskComments,
    taskCreator: taskCreator,
    categoryID: task.category,
    categoryName: categoryName,
    creationDate: formattedCreation,
    taskCreatorName: creatorName,
    taskBGColour: categoryColour,
    childTaskIDs: childTaskIDs,
    childTasks: childTaskNames,
    parentTaskID: parentTaskID,
    parentTaskName: parentTaskName,
    activityLog: activityLogs,
    role: role,
    status: taskStatus,
  });
}
