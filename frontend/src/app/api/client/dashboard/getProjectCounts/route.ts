import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import { ProjectStatus } from "@/src/models/enums/status";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const userID = queryParams.get("userID");
    let ongoingCount = 0;
    let finishedCount = 0;
    let overdueCount = 0;
    let totalProjectCount = 0;
    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        message: "User not found",
        status: 404,
        invalidClientID: userID,
      });
    }
    //Getting list of projects with user in it
    const projects = await Project.find({ members: { $in: [user._id] } });
    const currentDate = new Date()

    //Looping through projects to update project count
    for (const project of projects) {
      const dbProjectInstance = await Project.findOne({ _id: project._id });
      if (!dbProjectInstance) {
        return NextResponse.json({
          message: "Project not found",
          status: 404,
          invalidProjectID: project._id,
        });
      }
      if (dbProjectInstance.finished === true) {
        finishedCount++
      } else if (dbProjectInstance.estimatedCompletion.getTime() > currentDate) {
        ongoingCount++
      } else if (dbProjectInstance.estimatedCompletion.getTime() < currentDate){
        overdueCount++
      }
      totalProjectCount++;
    }

    return NextResponse.json({
      success: true,
      ongoing: ongoingCount,
      finished: finishedCount,
      overdue: overdueCount,
      total: totalProjectCount,
    });
  } catch (error: any) {
    console.error(`Error fetching project counts: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
