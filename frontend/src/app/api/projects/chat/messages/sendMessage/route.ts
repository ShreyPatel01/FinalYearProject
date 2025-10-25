import Channel from "@/src/models/channelModel";
import ChannelMessage from "@/src/models/messageModel";
import { NextRequest, NextResponse } from "next/server";
import User from "@/src/models/userModels";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const message = requestBody.message;
    const userID = requestBody.userID;
    const channelID = requestBody.channelID;
    const projectID = requestBody.projectID

    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });
    //Finding user in database
    const user = await User.findOne({ _id: userID });

    //Getting current date
    const currentDate = new Date();

    //Creating new instance of message
    const newMessage = new ChannelMessage({
      messageTime: currentDate,
      messageContent: message,
      type: "text",
      edited: false,
      sentBy: user._id,
      channel: channel._id,
      projectID: projectID
    });
    const savedMessage = await newMessage.save();

    //Updating channel with message
    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channel._id },
      { $push: { messages: savedMessage._id } },
      { $set: { updatedAt: currentDate } }
    );

    return NextResponse.json({ success: true, savedMessage, updatedChannel });
  } catch (error: any) {
    console.error(`Error while creating message: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
