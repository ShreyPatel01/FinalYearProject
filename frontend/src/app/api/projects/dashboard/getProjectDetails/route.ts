import Project from "@/src/models/projectModel";
import { ProjectStatus } from "@/src/models/enums/status";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json({
        message: "Project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }
    const projectName = project.projectName;
    const projectDescription = project.projectDescription;
    const projectDeadline = project.estimatedCompletion.toLocaleDateString(
      `en-GB`,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

    const currentDate = new Date();
    let status = "";
    if (project.status === ProjectStatus.FINISHED) {
      status = ProjectStatus.FINISHED;
    } else if (project.estimatedCompletion.getTime() > currentDate) {
      status = ProjectStatus.ONGOING;
    } else {
      status = ProjectStatus.OVERDUE;
    }

    return NextResponse.json({
      success: true,
      name: projectName,
      desc: projectDescription,
      deadline: projectDeadline,
      status: status,
    });
  } catch (error: any) {
    console.error(`Error fetching project details: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
