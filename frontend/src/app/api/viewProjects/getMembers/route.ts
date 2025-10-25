import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

interface Member {
  id: ObjectId;
  memberFullName: string;
}

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    let members: Member[] = [];
  
    const project = await Project.findOne({ _id: projectID });
  
    if (!project) {
      return NextResponse.json({
        message: "Project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }
  
    const projectMemberIDs = project.members;
    for (const projectMemberID of projectMemberIDs) {
      const user = await User.findOne({ _id: projectMemberID });
      if (!user) {
        return NextResponse.json({
          message: "User not found",
          status: 404,
          invalidUserID: projectMemberID,
        });
      }
      const userFullName = `${user.firstName} ${user.lastName}`;
      const memberObject = {id: user._id, memberFullName: userFullName}
      members.push(memberObject)
    }
  
    return NextResponse.json({
      success: true,
      members: members,
      message: "fetched project members",
    });
  } catch (error:any) {
    console.error(`Error fetching project members: `,error);
    return NextResponse.json({error: error.message, status:500});
  }
}
