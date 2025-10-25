import Channel from "@/src/models/channelModel";
import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import ChannelMessage from "@/src/models/messageModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function DELETE(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const channelID = queryParams.get("channelID");
    const userID = queryParams.get("userID");
    const projectID = queryParams.get("projectID");

    //Removing channel from Project
    const project = await Project.findOne({ _id: projectID });
    await Project.updateOne(
      { _id: project._id },
      { $pull: { channels: channelID } }
    );

    //Removing channel from User
    const user = await User.findOne({ _id: userID });
    await User.updateOne({ _id: user._id }, { $pull: { channels: channelID } });

    //Deleting messages related to channel
    const channel = await Channel.findOne({ _id: channelID });
    const messagesInChannel = channel.messages;
    for (let i = 0; i < messagesInChannel.length; i++) {
      await ChannelMessage.deleteOne({ _id: messagesInChannel[i] });
    }

    //Deleting channel
    await Channel.deleteOne({ _id: channelID });

    return NextResponse.json({
      success: true,
      message: "Channel has been deleted",
    });
    
  } catch (error: any) {
    console.error(`Error while deleting channel`, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
