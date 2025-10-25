import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse, NextRequest } from "next/server";
import Project from "@/src/models/projectModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const URLParams = new URLSearchParams(new URL(request.url).search);
    const token = URLParams.get("token");

    const project = await Project.findOne({ projectInvitationToken: token });

    const projectName = project.projectName;
    const projectDescription = project.projectDescription;
    const projectField = project.field;
    const projectDeadline = project.estimatedCompletion;

    return NextResponse.json({
      name: projectName,
      desc: projectDescription,
      field: projectField,
      deadline: projectDeadline,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
