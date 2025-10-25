import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Project from "@/src/models/projectModel";
import KanbanBoard from "@/src/models/kanbanBoardModel";
import Sprint from "@/src/models/sprintModel";
import User from "@/src/models/userModels";
import { projectRoles } from "@/src/models/enums/userRoles";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const userID = queryParams.get("userID");

    //Finding project in database
    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json({
        message: "Project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }

    //Getting project name
    const projectName = project.projectName;

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        message: "User not found",
        status: 404,
        invalidUserID: userID,
      });
    }

    //Getting getting user's role
    let userRole = projectRoles.USER;
    if (project.projectAdmin.toString() === user._id.toString()) {
      userRole = projectRoles.ADMIN;
    }else if (project.projectMods.includes(user._id)) {
      userRole = projectRoles.MOD;
    }else if (project.projectClients.includes(user._id)){
      userRole = projectRoles.CLIENT;
    }

    //Getting all sprintIDs, number of sprints, and first sprint
    const projectKanbanBoardID = project.kanbanBoard;
    const kanbanBoard = await KanbanBoard.findOne({
      _id: projectKanbanBoardID,
    });
    if (!kanbanBoard) {
      return NextResponse.json({
        message: "User not found",
        status: 404,
        invalidKanbanBoardID: projectKanbanBoardID,
      });
    }
    const sprintIDs = kanbanBoard.sprints;
    const numberOfSprints = sprintIDs.length;
    const defaultChosenSprintID = sprintIDs[0];

    //Loading categories from first sprint
    const firstSprint = await Sprint.findOne({ _id: defaultChosenSprintID });
    if (!firstSprint) {
      return NextResponse.json({
        message: "Sprint not found",
        status: 404,
        invalidSprintID: defaultChosenSprintID,
      });
    }
    const categoryList = firstSprint.sprintCategories;

    return NextResponse.json({
      success: true,
      name: projectName,
      role: userRole,
      sprintIDs: sprintIDs,
      numberOfSprints: numberOfSprints,
      categories: categoryList,
    });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
