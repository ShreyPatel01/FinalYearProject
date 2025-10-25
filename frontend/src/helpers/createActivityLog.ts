import ActivityLog from "../models/activityLogModel";
import Task from "../models/taskModel";
import { ActivityAction } from "../models/enums/activityActions";
import { ObjectId } from "mongoose";

export async function createActivityLog(
  taskID: string,
  username: string,
  projectID: ObjectId | string
): Promise<InstanceType<typeof ActivityLog>> {
  const action = ActivityAction.TaskCreation;

  //Creating new instance of ActivityLog 
  const activityLog = new ActivityLog({
    task: taskID,
    username: username,
    action: action,
    dateOfAction: new Date().getTime(),
    projectID: projectID
  });

  //Saving new instance to DB
  const savedActivityLog = await activityLog.save();

  //Updating Task with savedActivityLog
  await Task.findByIdAndUpdate(taskID, {
    $push: {activities: savedActivityLog._id}
  });

  return savedActivityLog;
}
