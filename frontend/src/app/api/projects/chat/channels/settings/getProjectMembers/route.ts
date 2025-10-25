import Project from "@/src/models/projectModel";
import Channel from "@/src/models/channelModel";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const channelID = queryParams.get("channelID");
    let projectMembers = [];
  
    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });
  
    //Getting channel member ids
    let channelMemberIDs = [];
    const channelMembers = channel.channelMembers;
    for (let i = 0; i < channelMembers.length; i++) {
      channelMemberIDs.push(channelMembers[i].userID.toString());
    }
  
    //Getting project member ids and filtering channelMemberIDs from project member ids
    const projectID = channel.projectID;
    const project = await Project.findOne({ _id: projectID });
    const projectMemberIDs = project.members;
    const filteredProjectMemberIDs = projectMemberIDs.filter(
      (projectMemberID: ObjectId) =>
        !channelMemberIDs.includes(projectMemberID.toString())
    );
  
    //Getting id and full name of every user in filteredProjectMemberIDs
    for (let i = 0; i < filteredProjectMemberIDs.length; i++) {
      const user = await User.findOne({ _id: filteredProjectMemberIDs[i] });
      const userFullName = `${user.firstName} ${user.lastName}`;
      const memberObject = { userFullName: userFullName, userID: user._id };
      projectMembers.push(memberObject);
    }
    return NextResponse.json({
      success: true,
      message: "Retrieved all project members not already in channel",
      projectMembers: projectMembers,
    });
  } catch (error:any) {
    console.error(`Error while fetching project members: `,error);
    return NextResponse.json({error: error.message, status: 500});
  }
}
