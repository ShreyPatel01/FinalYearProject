import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Sprint from "@/src/models/sprintModel";
connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const newSprintID = queryParams.get("newSprintID");
  
    const sprint = await Sprint.findOne({
      _id: newSprintID,
      projectID: projectID,
    });
    if (!sprint) {
      return NextResponse.json({
        message: "Sprint not found",
        status: 404,
        invalidSprintID: newSprintID,
        invalidProjectID: projectID,
      });
    }
  
    const categoryList = sprint.sprintCategories;
    console.log(categoryList)
  
    return NextResponse.json({
      success: true,
      categories: categoryList,
      message: "retrieved new categories in new sprint",
    });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
