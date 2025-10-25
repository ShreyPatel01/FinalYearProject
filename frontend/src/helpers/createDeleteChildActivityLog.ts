import ActivityLog from "../models/activityLogModel";
import Task from "../models/taskModel";
import { ActivityAction } from "../models/enums/activityActions";
import { ObjectId } from "mongoose";

export async function createDeleteChildActivityLog(
  parentTaskID: string,
  username: string,
  childTaskName: string,
  projectID: string | ObjectId
): Promise<InstanceType<typeof ActivityLog>> {
  const action = ActivityAction.DeleteChild;

  //Creating a new instance of ActivityLog
  const activityLog = new ActivityLog({
    task: parentTaskID,
    username: username,
    action: action,
    deletedChildTask: childTaskName,
    dateOfAction: new Date().getTime(),
    projectID: projectID
  });

  const savedActivityLog = await activityLog.save();

  await Task.findByIdAndUpdate(parentTaskID, {
    $push: { activities: savedActivityLog._id },
  });

  return savedActivityLog;
}
