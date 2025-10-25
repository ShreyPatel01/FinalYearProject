import ActivityLog from "../models/activityLogModel";
import Task from "../models/taskModel";
import { ActivityAction } from "../models/enums/activityActions";
import { ObjectId } from "mongoose";

export async function createAddAcommentActivityLog(
    taskID: string,
    username: string,
    commentID: string,
    projectID: string | ObjectId
): Promise<InstanceType<typeof ActivityLog>> {
    const action = ActivityAction.AddComment;

    //Creating new instance of ActivityLog
    const activityLog = new ActivityLog({
        task: taskID,
        username: username,
        action: action,
        commentID: commentID,
        dateOfAction: new Date().getTime(),
        projectID: projectID
    });

    const savedActivityLog = await activityLog.save();

    await Task.findByIdAndUpdate(taskID, {
        $push: {activities: savedActivityLog._id}
    });

    return savedActivityLog;
}