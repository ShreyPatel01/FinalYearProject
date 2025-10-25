import Project from "@/src/models/projectModel";
import KanbanBoard from "@/src/models/kanbanBoardModel";
import Sprint from "@/src/models/sprintModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

interface SprintObject {
  sprintID: ObjectId;
  sprintNo: number;
  startDate: string;
  endDate: string;
}

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    let SprintList: SprintObject[] = [];

    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json({
        message: "Project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }
    const projectKanbanBoard = project.kanbanBoard;
    const kanbanBoard = await KanbanBoard.findOne({ _id: projectKanbanBoard });
    if (!kanbanBoard) {
      return NextResponse.json({
        message: "Kanban Board not found",
        status: 404,
        invalidKanbanBoardID: projectKanbanBoard,
      });
    }
    const sprintIDs = kanbanBoard.sprints;
    for (const sprintID of sprintIDs) {
      const sprint = await Sprint.findOne({ _id: sprintID });
      if (!sprint) {
        return NextResponse.json({
          message: "Sprint not found",
          status: 404,
          invalidSprintID: sprintID,
        });
      }
      const idOfSprint = sprint._id;
      const sprintNo = sprint.sprintNo;
      const sprintStartDate = sprint.startDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const sprintEndDate = sprint.endDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const sprintObject = {
        sprintID: idOfSprint,
        sprintNo: sprintNo,
        startDate: sprintStartDate,
        endDate: sprintEndDate,
      };
      SprintList.push(sprintObject);
    }

    return NextResponse.json({
      success: true,
      sprintList: SprintList,
      message: "Retrieved all sprints in project",
    });
  } catch (error: any) {
    console.error(`Error fetching sprints in project: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
