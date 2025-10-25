import Category from "@/src/models/categoryModel";
import Sprint from "@/src/models/sprintModel";
import Project from "@/src/models/projectModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const newSprintID = queryParams.get("newSprintID");
    const projectID = queryParams.get("projectID");
    let categoryIDList: ObjectId[] = [];
  
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
  
    //Fetching sprintCategories
    const categories = sprint.sprintCategories;
    for (const category of categories) {
      const categoryFromDB = await Category.findOne({ _id: category._id });
      if (!categoryFromDB) {
        return NextResponse.json({
          message: "category not found",
          status: 404,
          invalidCategoryID: category._id,
        });
      }
      categoryIDList.push(category._id);
    }
  
    return NextResponse.json({
      success: true,
      message: "Found category ids",
      categories: categoryIDList,
    });
  } catch (error:any) {
    console.error(`Error fetching categoryIDs: `,error);
    return NextResponse.json({error: error.message, status:500});
  }
}
