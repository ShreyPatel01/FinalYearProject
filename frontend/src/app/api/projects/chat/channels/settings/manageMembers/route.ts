import Channel from "@/src/models/channelModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

interface MemberStructure {
  userID: ObjectId;
  role: string;
  _id: ObjectId;
}

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const channelID = requestBody.channelID;
    const channelMemberID = requestBody.channelMemberID;
    const newRole = requestBody.role;
    console.log(`newRole = ${newRole}`)
  
    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });
  
    //Updating channelMember with userID with newRole
    const channelMembers = channel.channelMembers;
    console.log("channel members before change");
    console.log(channelMembers);
    console.log("========================================================")
  
    //Finding the index of the channel member that needs to be updated
    const channelMemberIndex = channelMembers.findIndex((member: MemberStructure) => member.userID.toString() === channelMemberID);
  
    //Updating the role of the member at channelMemberIndex
    channelMembers[channelMemberIndex].role = newRole;
    console.log("channel members after change")
    console.log(channelMembers)
    console.log("========================================================")
  
    //Updating channel with channelMembers
    const updatedChannel = await Channel.updateOne({_id: channel._id}, {$set: {channelMembers: channelMembers}});
  
    return NextResponse.json({
      success: true,
      message: `Channel member role has been updated`,
      updatedChannel: updatedChannel
    });
  } catch (error:any) {
    console.error(`Error changing role: `,error);
    return NextResponse.json({error: error.message, status:500});
  }
}
