import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";
import { NextRequest, NextResponse } from "next/server";
import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function GET(request: NextRequest) {
  try {
    const userID = await RetrieveIDFromToken(request);
    const user = await User.findOne({ _id: userID }).select(
      "-username -firstName -lastName -email -password -v"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const provenUserID = user._id;
    //console.log("Project query for "+userName);
    const projects = await Project.find({ members: { $in: [provenUserID] } });
    console.log(projects);
    return NextResponse.json({
      message: "Projects found",
      data: projects,
    });
  } catch (error: any) {
    console.error("Error in GET function:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
