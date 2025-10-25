import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import KanbanBoard from "@/src/models/kanbanBoardModel";
import Sprint from "@/src/models/sprintModel";
import Category from "@/src/models/categoryModel";
import Task from "@/src/models/taskModel";
import Comment from "@/src/models/taskCommentModel";
import ProjectFolder from "@/src/models/folderModel";
import ProjectFile from "@/src/models/filesModel";
import Channel from "@/src/models/channelModel";
import ChannelMessage from "@/src/models/messageModel";
import ActivityLog from "@/src/models/activityLogModel";
import { S3 } from "aws-sdk";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import TicketIssue from "@/src/models/issueModel";

connect();

const s3Bucket = new S3({
  region: process.env.AWS_BUCKET_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

export async function DELETE(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const userID = queryParams.get("userID");

    //Finding project in database
    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json({
        message: "project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }

    //Deleting project folder in s3 bucket
    const directory = `projectFiles/${project._id}/`;
    const s3DeleteProjectFolderParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: directory,
    };
    await s3Bucket.deleteObject(s3DeleteProjectFolderParams).promise();

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        message: "user not found",
        status: 404,
        invalidUserID: userID,
      });
    }

    //Deleting kanbanboard in the database related to the project
    await KanbanBoard.findOneAndDelete({ _id: project.kanbanBoard });

    //Deleting sprints in the database related to the project
    const sprints = await Sprint.find({ projectID: project._id });
    console.log("sprints");
    console.log(sprints);
    console.log("=====================================");
    sprints.forEach(async (sprint: typeof Sprint) => {
      await Sprint.deleteOne({ _id: sprint._id });
    });

    //Deleting categories in the database related to the project
    const categories = await Category.find({ projectID: project._id });
    console.log("categories");
    console.log(categories);
    console.log("=====================================");
    categories.forEach(async (category: typeof Category) => {
      await Category.deleteOne({ _id: category._id });
    });

    //Deleting tickets in the database related to the project
    const tickets = await TicketIssue.find({ projectID: project._id });
    tickets.forEaceh(async (ticket: typeof TicketIssue) => {
      await TicketIssue.deleteOne({ _id: ticket._id });
    });

    //Deleting tasks in the database related to the project
    const tasks = await Task.find({ projectID: project._id });
    console.log("tasks");
    console.log(tasks);
    console.log("=====================================");
    tasks.forEach(async (task: typeof Task) => {
      //Removing task from userTasks before deleting task
      const usersWithTask = await User.find({ userTasks: { $in: [task._id] } });
      console.log("usersWithTask");
      console.log(usersWithTask);
      console.log("=====================================");
      usersWithTask.forEach(async (userWithTask: typeof User) => {
        await User.updateOne(
          { _id: userWithTask._id },
          { $pull: { userTasks: task._id } }
        );
      });
      await Task.deleteOne({ _id: task._id });
    });

    //Deleting comments in the database related to the project
    const comments = await Comment.find({ projectID: project._id });
    console.log("comments");
    console.log(comments);
    console.log("=====================================");
    comments.forEach(async (comment: typeof Comment) => {
      await Comment.deleteOne({ _id: comment._id });
    });

    //Deleting acitivityLogs in database related to project
    const activityLogs = await ActivityLog.find({ projectID: project._id });
    console.log("activityLogs");
    console.log(activityLogs);
    console.log("=====================================");
    activityLogs.forEach(async (activityLog: typeof ActivityLog) => {
      await ActivityLog.deleteOne({ _id: activityLog._id });
    });

    //Deleting messages in database related to project
    const messages = await ChannelMessage.find({ projectID: projectID });
    console.log("messages");
    console.log(messages);
    console.log("=====================================");
    messages.forEach(async (message: typeof ChannelMessage) => {
      await ChannelMessage.deleteOne({ _id: message._id });
    });

    //Deleting channels in database related to project
    const channels = await Channel.find({ projectID: project._id });
    console.log("channels");
    console.log(channels);
    console.log("=====================================");
    channels.forEach(async (channel: typeof Channel) => {
      //Removing channel from all userTasks before deleting
      const usersInChannel = await User.find({
        channel: { $in: [channel._id] },
      });
      console.log("usersInChannel");
      console.log(usersInChannel);
      console.log("=====================================");
      usersInChannel.forEach(async (userInChannel: typeof User) => {
        await User.UpdateOne(
          { _id: userInChannel._id },
          { $pull: { channel: channel._id } }
        );
      });
      await Channel.deleteOne({ _id: channel._id });
    });

    //Deleting projectFolders related to project
    const folders = await ProjectFolder.find({ projectID: projectID });
    console.log("folders");
    console.log(folders);
    console.log("=====================================");
    folders.forEach(async (folder: typeof ProjectFolder) => {
      await ProjectFolder.deleteOne({ _id: folder._id });
    });
    //Deleting projectFiles related to project
    const files = await ProjectFile.find({ projectID: projectID });
    console.log("files");
    console.log(files);
    console.log("=====================================");
    files.forEach(async (folder: typeof ProjectFile) => {
      await ProjectFile.deleteOne({ _id: folder._id });
    });

    //Deleting Project
    await Project.deleteOne({ _id: project._id });

    return NextResponse.json({
      success: true,
      message: "Deleted the project",
      deletedProject: project,
    });
  } catch (error: any) {
    console.error(`Error while deleting project: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
