import Channel from "@/src/models/channelModel";
import { chatRoles } from "@/src/models/enums/userRoles";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const channelID = requestBody.channelID;
    const projectMemberID = requestBody.projectMemberID;
  
    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });
  
    //Finding project member in database
    const projectMember = await User.findOne({ _id: projectMemberID });
  
    //Updating channel.channelMembers with projectMember and role "MEMBER"
    const updatedChannel = await Channel.updateOne(
      { _id: channel._id },
      {
        $push: {
          channelMembers: { userID: projectMember._id, role: chatRoles.MEMBER },
        },
      }
    );

    //Updating project member document with channel id in channels attribute
    await User.findOneAndUpdate({_id: projectMember._id}, {$push: {channels: channel._id}});
  
    return NextResponse.json({success: true, message: "Added project member to channel", updatedChannel: updatedChannel});
  } catch (error:any) {
    console.error(`Error while adding project member to channel: `,error);
    return NextResponse.json({error: error.message, status: 500});
  }
}
