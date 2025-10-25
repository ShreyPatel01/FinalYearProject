import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Project from "@/src/models/projectModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const URLParams = new URLSearchParams(new URL(request.url).search);
    const projectID = URLParams.get("projectID");

    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json({
        message: "project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }

    const projectName = project.projectName;
    const projectDesc = project.projectDescription;
    const projectField = project.field;
    const projectPrivacy = project.private;
    const isProjectFinished = project.finished;

    return NextResponse.json({
      success: true,
      name: projectName,
      desc: projectDesc,
      field: projectField,
      privacy: projectPrivacy,
      isProjectFinished: isProjectFinished,
      message: "Retrieved project details for settings page",
    });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
