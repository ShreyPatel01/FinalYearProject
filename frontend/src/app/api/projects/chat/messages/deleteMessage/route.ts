import Channel from "@/src/models/channelModel";
import ChannelMessage from "@/src/models/messageModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function DELETE(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const channelID = queryParams.get("channelID");
    const messageID = queryParams.get("messageID");
  
    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });
  
    //Finding message in database
    const message = await ChannelMessage.findOne({ _id: messageID });
  
    //Pulling messageID from channel.messages
    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channel._id },
      { $pull: { messages: message._id } }
    );
  
    //Deleting message
    await ChannelMessage.deleteOne({ _id: message._id });
  
    return NextResponse.json({
      success: true,
      message: "Message has been deleted",
      deletedMessage: message,
      updatedChannel: updatedChannel,
    });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({error: error.message, status:500});
  }
}
