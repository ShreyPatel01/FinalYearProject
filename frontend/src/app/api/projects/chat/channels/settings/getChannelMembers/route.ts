import Channel from "@/src/models/channelModel";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

interface Member {
  userID: ObjectId;
  role: string;
  _id: ObjectId;
}

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const channelID = queryParams.get("channelID");
    const userID = queryParams.get("userID");
    let finalChannelMembersList = [];

    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });

    //Getting users in channel and their role
    const channelMembers = channel.channelMembers;

    //Filtering userID from channelMembers
    const otherChannelMembers = channelMembers.filter(
      (member: Member) => member.userID.toString() !== userID
    );
    console.log(otherChannelMembers);

    //Getting user full name and pushing memberObject to finalChannelMembersList
    for (let i = 0; i< otherChannelMembers.length; i++){
        const user = await User.findOne({_id: otherChannelMembers[i].userID});
        const userFullName = `${user.firstName} ${user.lastName}`;
        const memberObject = {userFullName: userFullName, userID: user._id, role: otherChannelMembers[i].role}
        finalChannelMembersList.push(memberObject);
    }

    console.log(finalChannelMembersList);

    return NextResponse.json({
      success: true,
      channelMembers: finalChannelMembersList,
    });
  } catch (error: any) {
    console.error(`Error fetching channel members: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
