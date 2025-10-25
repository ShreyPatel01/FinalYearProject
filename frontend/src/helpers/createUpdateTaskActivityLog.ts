import ActivityLog from "../models/activityLogModel";
import Task from "../models/taskModel";
import { ActivityAction } from "../models/enums/activityActions";
import Category from "../models/categoryModel";
import { ObjectId } from "mongoose";

export async function createUpdateTaskActivityLog(
    taskID: string,
    username: string,
    updatedAttributes: string[],
    oldValues: string[],
    newValues: string[],
    projectID: string | ObjectId
): Promise<InstanceType<typeof ActivityLog>> {
    const action = ActivityAction.UpdateTaskValue;
    let changedAttributes = [];
    let oldAttributeValues = [];
    let newAttributeValues = [];

    for (let i = 0; i< updatedAttributes.length; i++){
        changedAttributes.push(updatedAttributes[i]);
        oldAttributeValues.push(oldValues[i]);
        newAttributeValues.push(newValues[i]);
    }

    //Creating new instance of ActivityLog
    const activityLog = new ActivityLog({
        task: taskID,
        username: username,
        updatedAttributes: changedAttributes,
        action: action,
        oldAttributeValues: oldAttributeValues,
        newAttributeValues: newAttributeValues,
        dateOfAction: new Date().getTime(),
        projectID: projectID
    });

    const savedActivityLog = await activityLog.save();

    await Task.findByIdAndUpdate(taskID, {
        $push: {activities: savedActivityLog._id}
    });

    return savedActivityLog;
}