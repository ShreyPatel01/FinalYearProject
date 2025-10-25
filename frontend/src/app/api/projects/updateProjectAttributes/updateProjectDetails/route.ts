import Project from "@/src/models/projectModel";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function PUT(request: NextRequest) {
  const requestBody = await request.json();
  const projectID = requestBody.projectID;
  const newProjectName = requestBody.newName;
  const newProjectDesc = requestBody.newDesc;
  const newProjectField = requestBody.newField;
  const newPrivacySetting = requestBody.newPrivacy;
  const newIsProjectFinished = requestBody.newFinished;

  //Finding project in database
  const project = await Project.findOne({_id: projectID});
  if(!project){
    return NextResponse.json({message: 'Project not found', status:404, invalidProjectID: projectID});
  }

  //Updating project with values from requestBody
  const updatedProject = await Project.updateOne({_id: project._id}, {$set: {
    projectName: newProjectName !== null ? newProjectName : project.projectName,
    projectDesc: newProjectDesc !== null ? newProjectDesc : project.projectDescription,
    field: newProjectField !== null ? newProjectField : project.field,
    private: newPrivacySetting !== undefined ? newPrivacySetting : project.private,
    finished: newIsProjectFinished !== undefined ? newIsProjectFinished : project.finished
  }});

  return NextResponse.json({
    success: true,
    message: "Project has been updated",
    updatedProject: updatedProject
  });
}
