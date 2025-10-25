import { connect } from "@/src/dbConfig/dbConfig";
import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import { NextResponse, NextRequest } from "next/server";

connect();

export async function GET(request: NextRequest) {
  try {
    //Getting the projectID to make sure users already assigned
    //to the project aren't returned in the list
    const URLObject = new URL(request.url);
    const URLParams = new URLSearchParams(URLObject.search);
    const projectID = URLParams.get("projectID");

    const project = await Project.findOne({ _id: projectID });

    //Retrieving all users from user collection
    const users = await User.find({});

    const verifiedUsers = users
      .filter(
        (user: { isVerified: any; _id: any }) =>
          user.isVerified && !project.members.includes(user._id)
      )
      .map((user: { username: any }) => user.username);

    console.log("verified users: " + verifiedUsers);

    return NextResponse.json({
      success: true,
      data: verifiedUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
