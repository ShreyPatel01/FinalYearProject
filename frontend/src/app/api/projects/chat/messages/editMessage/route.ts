import ChannelMessage from "@/src/models/messageModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const messageID = requestBody.messageID;
    const newMessageContent = requestBody.newMessage;

    //Finding message in database
    const message = await ChannelMessage.findOne({ _id: messageID });

    //Updating message with new message content
    const updatedMessage = await ChannelMessage.findOneAndUpdate(
      { _id: message._id },
      { $set: { messageContent: newMessageContent, edited: true } }
    );

    return NextResponse.json({
      success: true,
      message: "Successfully updated the message",
      updatedMessage: updatedMessage,
    });
  } catch (error: any) {
    console.error("Error updating message: ", error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
