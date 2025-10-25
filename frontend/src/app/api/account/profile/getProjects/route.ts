import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";
import { ProjectStatus } from "@/src/models/enums/status";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";

connect();

interface Project {
  projectName: string;
  projectDescription: string;
  projectID: ObjectId;
  projectStatus: string;
}

export async function GET(request: NextRequest) {
  const userID = RetrieveIDFromToken(request);
  let projectList: Project[] = [];

  //Finding user in database
  const user = await User.findOne({ _id: userID });
  if (!user) {
    return NextResponse.json({
      message: "User not found",
      status: 404,
      invalidUserID: userID,
    });
  }
  const projects = await Project.find({ members: { $in: [user._id] } });
  const currentDate = new Date();

  projects.forEach((project: typeof Project) => {
    const projectName = project.projectName;
    const projectDescription = project.projectDescription;
    let projectStatus = "";
    //Figuring out what the status of the project is
    if (project.finished === true) {
      projectStatus = ProjectStatus.FINISHED;
    } else if (project.estimatedCompletion.getTime() < currentDate) {
      projectStatus = ProjectStatus.OVERDUE;
    } else {
      projectStatus = ProjectStatus.ONGOING;
    }
    const projectObject = {
      projectName: projectName,
      projectDescription: projectDescription,
      projectID: project._id,
      projectStatus: projectStatus,
    };
    projectList.push(projectObject);
  });

  return NextResponse.json({ success: true, projectList: projectList });
}
