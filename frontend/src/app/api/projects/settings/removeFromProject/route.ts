import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import Channel from "@/src/models/channelModel";
import Task from "@/src/models/taskModel";
import ChannelMessage from "@/src/models/messageModel";
import Comment from "@/src/models/taskCommentModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function DELETE(request: NextRequest) {
  try {
    const userID = request.nextUrl.searchParams.get(`userID`);
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json(
        { error: "can't find user in database", invalidUserID: userID },
        { status: 404 }
      );
    }
    const projectID = request.nextUrl.searchParams.get(`projectID`);
    const project = await Project.findOne({
      _id: projectID,
      members: { $in: [user._id] },
    });
    if (!project) {
      return NextResponse.json(
        {
          error: "can't find project in database",
          invalidProjectID: projectID,
        },
        { status: 404 }
      );
    }

    //Deleting all messages from project that were sent by user
    const messages = await ChannelMessage.find({
      projectID: projectID,
      sentBy: user._id,
    });
    for (const message of messages) {
      await ChannelMessage.deleteOne({ _id: message._id });
    }

    //Removing user from all channels in project that they are a part of
    const channels = await Channel.find({
      projectID: projectID,
      channelMembers: { $elemMatch: { userID: user._id } },
    });
    for (const channel of channels) {
      //Removing channelID from user.channels
      await User.updateOne(
        { _id: user._id },
        { $pull: { channels: channel._id } }
      );
      //Removing user from channels
      await Channel.updateOne(
        { _id: channel._id },
        { $pull: { channelMembers: { userID: user._id } } }
      );
    }

    //Deleting comments made by user in project
    const comments = await Comment.find({
      projectID: projectID,
      userCommented: user._id,
    });
    for (const comment of comments) {
      //Removing comment from task
      await Task.updateOne(
        { _id: comment.task },
        { $pull: { taskComments: comment._id } }
      );
      //Deleting comment
      await Comment.deleteOne({ _id: comment._id });
    }

    //Removing user from tasks in project
    const tasks = await Task.find({
      projectID: projectID,
      taskMembers: { $in: [user._id] },
    });
    for (const task of tasks) {
      //Removing taskID from userTasks
      await User.updateOne(
        { _id: user._id },
        { $pull: { userTasks: task._id } }
      );
      //Removing user from task
      await Task.updateOne(
        { _id: task._id },
        { $pull: { taskMembers: user._id } }
      );
    }

    if (project.projectClients.includes(user._id.toString())) {
      await Project.updateOne(
        { _id: project._id },
        { $pull: { projectClients: user._id } }
      );
    } else if (project.projectMods.includes(user._id.toString())) {
      await Project.updateOne(
        { _id: project._id },
        { $pull: { projectMods: user._id } }
      );
    }

    await Project.updateOne(
      { _id: project._id },
      { $pull: { members: user._id } }
    );

    return NextResponse.json({
      success: true,
      message: "Removed user from project",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
