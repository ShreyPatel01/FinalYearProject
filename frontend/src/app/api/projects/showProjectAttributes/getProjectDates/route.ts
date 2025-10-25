import Project from "@/src/models/projectModel";
import KanbanBoard from "@/src/models/kanbanBoardModel";
import Sprint from "@/src/models/sprintModel";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
  const URLParams = new URLSearchParams(new URL(request.url).search);
  const projectID = URLParams.get("projectID");

  const project = await Project.findOne({ _id: projectID });
  const projectDeadline = project.estimatedCompletion;
  let sprints = [];
  if (project) {
    const kanbanBoard = await KanbanBoard.findOne({ _id: project.kanbanBoard });
    const sprintIDs = kanbanBoard.sprints;
    for (let i = 0; i < sprintIDs.length; i++) {
      sprints.push(await Sprint.findOne({ _id: sprintIDs[i] }));
    }
  }

  return NextResponse.json({
    success: true,
    infoOfSprints: sprints,
    projectDeadline: projectDeadline,
  });
}
