import ActivityLog from "../models/activityLogModel";
import Task from "../models/taskModel";
import { ActivityAction } from "../models/enums/activityActions";
import { ObjectId } from "mongoose";

export async function createChangeCategoryActivityLog(
  taskID: ObjectId,
  username: string,
  oldCategoryName: string,
  newCategoryName: string,
  projectID: string
): Promise<InstanceType<typeof ActivityLog>> {
  const action = ActivityAction.UpdateCategory;


  const activityLog = new ActivityLog({
    username: username,
    action: action,
    oldCategoryName: oldCategoryName,
    newCategoryName: newCategoryName,
    projectID: projectID,
    dateOfAction:new Date().getTime(), 
  });

  const savedActivityLog = await activityLog.save();

  await Task.findByIdAndUpdate(taskID, {
    $push: { activities: savedActivityLog._id },
  });

  return savedActivityLog;
}
