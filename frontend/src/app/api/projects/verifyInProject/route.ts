import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse, NextRequest } from "next/server";
import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";

connect();

export async function GET(request: NextRequest) {
  //Get UserID from browser token
  const tokenUserID = await RetrieveIDFromToken(request);
  const user = await User.findOne({ _id: tokenUserID });
  const userID = user._id;

  //Get projectID from request
  const URLObject = new URL(request.url);
  const URLParams = new URLSearchParams(URLObject.search);
  const projectID = URLParams.get("id");

  const project = await Project.findOne({ _id: projectID });
  const members = project.members;

  if (members.includes(userID)) {
    console.log("user is in project");
    return NextResponse.json({ success: true });
  } else {
    console.log("user is not in project");
    return NextResponse.json({ success: false });
  }
}
