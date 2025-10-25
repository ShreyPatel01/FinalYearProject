import ActivityLog from "../models/activityLogModel";
import Task from "../models/taskModel";
import { ActivityAction } from "../models/enums/activityActions";
import { ObjectId } from "mongoose";

export async function createChildTaskActivityLog(
  childTaskID: string,
  username: string,
  parentTaskID: string,
  projectID: string | ObjectId,
): Promise<InstanceType<typeof ActivityLog>> {
  const action = ActivityAction.CreateChild;
  const childTask = await Task.findOne({_id: childTaskID});
  const childTaskName = childTask.taskName;

  const activityLog = new ActivityLog({
    username: username,
    action: action,
    childTaskName: childTaskName,
    dateOfAction: new Date().getTime(),
    projectID: projectID
  });

  const savedActivityLog = await activityLog.save();

  await Task.findByIdAndUpdate(parentTaskID, {
    $push: { activities: savedActivityLog._id },
  });

  return savedActivityLog;
}
