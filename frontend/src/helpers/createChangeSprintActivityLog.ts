import ActivityLog from "../models/activityLogModel";
import Task from "../models/taskModel";
import { ActivityAction } from "../models/enums/activityActions";
import { ObjectId } from "mongoose";

export async function createChangeSprintActivityLog(
  taskID: ObjectId,
  username: string,
  oldSprintNo: number,
  newSprintNo: number,
  projectID: string
): Promise<InstanceType<typeof ActivityLog>> {
  const action = ActivityAction.ChangeSprint;
  

  const activityLog = new ActivityLog({
    username: username,
    action: action,
    oldSprintNo: oldSprintNo,
    newSprintNo: newSprintNo,
    projectID: projectID,
    dateOfAction: new Date().getTime(),
  });

  const savedActivityLog = await activityLog.save();

  await Task.findByIdAndUpdate(taskID, {
    $push: { activities: savedActivityLog._id },
  });

  return savedActivityLog;
}
