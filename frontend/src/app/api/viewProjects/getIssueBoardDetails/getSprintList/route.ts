import Project from "@/src/models/projectModel";
import Sprint from "@/src/models/sprintModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    let sprintList: ObjectId[] = [];
  
    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json({
        message: "Project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }
  
    const projectName = project.projectName;
  
    //Finding sprints that have projectID
    const sprints = await Sprint.find({ projectID: project._id });
    for (const sprint of sprints) {
      const sprintFromDB = await Sprint.findOne({ _id: sprint._id });
      if (!sprintFromDB) {
        return NextResponse.json({
          message: "Sprint not found",
          status: 404,
          invalidSprintID: sprint._id,
        });
      }
      sprintList.push(sprint._id);
    }
  
    return NextResponse.json({
      success: true,
      projectName: projectName,
      sprintIDs: sprintList,
      message: "fetched project name and sprintIDs",
    });
  } catch (error:any) {
    console.error(`Error fetching project name and sprintIDs: `,error);
    return NextResponse.json({error: error.message, status:500});
  }
}
