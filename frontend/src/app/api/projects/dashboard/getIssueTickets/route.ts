import Project from "@/src/models/projectModel";
import TicketIssue from "@/src/models/issueModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";
import User from "@/src/models/userModels";
import Task from "@/src/models/taskModel";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";
import { projectRoles } from "@/src/models/enums/userRoles";

connect();

interface Issue {
  id: ObjectId;
  type: string;
  name: string;
  desc: string;
  dateCreated: string;
  createdBy: string;
  relatedTaskName: string;
  relatedTaskID: ObjectId;
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    const projectID = request.nextUrl.searchParams.get("project");
    console.log(`projectID = ${projectID}`);
    const project = await Project.findOne({ _id: projectID });
    let issueList: Issue[] = [];
    let role = projectRoles.USER;
    if (!project) {
      return NextResponse.json(
        {
          error: "Couldn't find project in database",
          invalidProjectID: projectID,
        },
        { status: 404 }
      );
    }
    //Finding current user's role in database
    const userID = await RetrieveIDFromToken(request);
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json(
        { error: "Couldn't find user in database", invalidUserID: userID },
        { status: 404 }
      );
    }
    if(user._id.toString() === project.projectAdmin.toString()){
      role = projectRoles.ADMIN;
    } else if(project.projectMods.includes(user._id.toString())){
      role = projectRoles.MOD;
    } else if(project.projectClients.includes(user._id.toString())){
      role = projectRoles.CLIENT;
    }

    //Finding all issues with project._id as projectID
    const issues = await TicketIssue.find({ projectID: project._id });

    for (const issue of issues) {
      console.log(issue);
      console.log(`================================`);
      const issueName = issue.issueName;
      const issueType = issue.type;
      const creationDate = issue.creationDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const issueDesc = issue.issueDesc;
      const userCreatedID = issue.createdBy;
      const user = await User.findOne({ _id: userCreatedID });
      const createdBy = `${user.firstName} ${user.lastName}`;
      let taskID = null;
      let taskName = "N/A";
      if (issue.taskID) {
        const task = await Task.findOne({ _id: issue.taskID });
        taskID = task._id;
        taskName = task.taskName;
      }
      const status = issue.status;
      const issueObject = {
        id: issue._id,
        name: issueName,
        type: issueType,
        desc: issueDesc,
        dateCreated: creationDate,
        createdBy: createdBy,
        relatedTaskID: taskID,
        relatedTaskName: taskName,
        status: status,
      };
      issueList.push(issueObject);
    }

    console.log(`role from getTickets is = ${role}`)

    return NextResponse.json({
      success: true,
      issueList: issueList,
      role: role,
      message: "Fetched all the project issue tickets",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
