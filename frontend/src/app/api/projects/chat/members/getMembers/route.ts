import Channel from "@/src/models/channelModel";
import User from "@/src/models/userModels";
import { chatRoles } from "@/src/models/enums/userRoles";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const channelID = queryParams.get(`channelID`);
    const currentUserID = RetrieveIDFromToken(request);
    let adminList = [];
    let modList = [];
    let clientList = [];
    let memberList = [];

    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });
    if(!channel){
      return NextResponse.json({message: "channel not found", status: 404, invalidChannelID: channelID})
    }
    // Finding user in database
    const currentUser = await User.findOne({_id: currentUserID});
    if(!currentUser){
      return NextResponse.json({message: "User not found", status: 404, invalidUserID: currentUserID})
    }
    
    //Getting role of current user
    let role = chatRoles.MEMBER;
    if(channel.channelAdmin.toString() === currentUser._id.toString()){
      role = chatRoles.ADMIN
    }else if (channel.channelModerators.includes(currentUser._id.toString())){
      role = chatRoles.MODERATOR
    }else if (channel.channelClient.includes(currentUser._id.toString())){
      role = chatRoles.CLIENT;
    }

    //Getting list of members from channel
    const channelMemberList = channel.channelMembers;
    console.log(channelMemberList);
    console.log(channelMemberList.length)

    //Looping through channelMemberList to get role and user's full name
    for (let i = 0; i < channelMemberList.length; i++) {
      //Finding user in database
      const user = await User.findOne({ _id: channelMemberList[i].userID });
      //Getting user's full name
      const userFullName = `${user.firstName} ${user.lastName}`;

      //Getting user's initials for avatar placeholder
      const initials = userFullName
        .split(" ")
        .map((word) => word[0])
        .join("");

      const memberObject = {
        userID: user._id,
        userFullName: userFullName,
        userInitials: initials,
      };

      //Pushing memberObject to correct role list
      switch (channelMemberList[i].role) {
        case chatRoles.ADMIN:
          adminList.push(memberObject);
          break;
        case chatRoles.MODERATOR:
          modList.push(memberObject);
          break;
        case chatRoles.CLIENT:
          clientList.push(memberObject);
          break;
        case chatRoles.MEMBER:
          memberList.push(memberObject);
          break;
      }
    }

    return NextResponse.json({
      success: true,
      adminList: adminList,
      modList: modList,
      clientList: clientList,
      memberList: memberList,
      role: role
    });
  } catch (error: any) {
    console.error("Error fetching members: ", error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
