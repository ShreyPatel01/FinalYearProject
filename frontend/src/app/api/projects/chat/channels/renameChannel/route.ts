import Channel from "@/src/models/channelModel";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const newChannelName = requestBody.newChannelName;
    const channelID = requestBody.channelID;
    const userID = requestBody.userID;

    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });
    //Finding user in database
    const user = await User.findOne({ _id: userID });

    //Getting current date
    const currentDate = new Date();

    //Updating channel
    const updatedChannel = await Channel.updateOne(
      { _id: channel._id },
      {
        $set: {
          channelName: newChannelName,
          updatedAt: currentDate,
          updatedBy: user._id,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Channel has been renamed",
      updatedChannel: updatedChannel,
    });
    
  } catch (error: any) {
    console.error(`Error renaming channel: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
