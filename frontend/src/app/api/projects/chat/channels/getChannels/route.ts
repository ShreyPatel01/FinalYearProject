import Channel from "@/src/models/channelModel";
import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId, Schema } from "mongoose";
import { chatRoles } from "@/src/models/enums/userRoles";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const userID = queryParams.get("userID");
    console.log(`projectID: ${projectID}, userID: ${userID}`);

    //Finding project in database
    const project = await Project.findOne({ _id: projectID });
    const channelList = project.channels;
    console.log(`channelList is ${channelList}`)

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    const userChannelList = user.channels;
    console.log(userChannelList);

    //Creating list of channel objects for frontend to map through
    let channelArray: {
      channelID: Schema.Types.ObjectId;
      channelName: string;
      userInChannel: boolean;
    }[] = [];

    for (let i = 0; i < channelList.length; i++) {
      const channel = await Channel.findOne({ _id: channelList[i] });
      console.log(channel._id);
      const channelName = channel.channelName;
      //Checking if the channelID is in userChannelList
      const userInChannel =
        channel &&
        userChannelList.some(
          (channelID: ObjectId) =>
            channelID.toString() === channel._id.toString()
        );

      let role = chatRoles.MEMBER;
      if (user._id.toString() === channel.channelAdmin.toString()){
        role = chatRoles.ADMIN
      }else if (channel.channelModerators.includes(user._id.toString())){
        role = chatRoles.MODERATOR
      }else if (channel.channelClient.includes(user._id.toString())){
        role = chatRoles.CLIENT
      }
      console.log(`role = ${role}`)
      console.log(`userInChannel is ${userInChannel}`);
      const channelObject = {
        channelID: channelList[i],
        channelName: channelName,
        userInChannel: userInChannel,
        userRole: role
      };
      channelArray.push(channelObject);
    }

    console.log(channelArray);

    //Sending channelArray to frontend
    return NextResponse.json({
      success: true,
      message: "Retrieved list of channels in project",
      arrayOfChannels: channelArray,
    });
  } catch (error: any) {
    console.error("Error retrieving list of channels:", error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
