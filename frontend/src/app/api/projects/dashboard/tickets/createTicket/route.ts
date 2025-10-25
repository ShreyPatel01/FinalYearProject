import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import Task from "@/src/models/taskModel";
import TicketIssue from "@/src/models/issueModel";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import { ticketStatus, ticketTypes } from "@/src/models/enums/ticketType";

connect();

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const issueName = requestBody.name;
    const issueDesc = requestBody.desc;
    const issueType = requestBody.type;
    const userID = requestBody.userID;
    const projectID = requestBody.projectID;
    let relatedTaskID = "None";
    if (issueType === ticketTypes.BUG) {
      relatedTaskID = requestBody.relatedTaskID;
    }
    let fetchedTaskID;

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json(
        { error: "Couldn't find user in database", invalidUserID: userID },
        { status: 404 }
      );
    }

    //Finding project in database
    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json(
        {
          error: "Couldn't find project in database",
          invalidProjectID: projectID,
        },
        { status: 404 }
      );
    }

    //Finding the task in the database if relatedTaskID is not None
    if (relatedTaskID !== "None") {
      const task = await Task.findOne({ _id: relatedTaskID });
      if (!task) {
        return NextResponse.json(
          {
            error: "Couldn't find task in database",
            invalidTaskID: relatedTaskID,
          },
          { status: 404 }
        );
      }
      fetchedTaskID = task._id;
    }

    const currentDate = new Date();

    //Creating new issue document
    const baseIssueTicket = {
      issueName: issueName,
      issueDesc: issueDesc,
      creationDate: currentDate,
      createdBy: user._id,
      type: issueType,
      status: ticketStatus.ONGOING,
      projectID: project._id,
    };

    const newIssueTicket = new TicketIssue({
      ...baseIssueTicket,
      ...(fetchedTaskID !== "" ? { taskID: fetchedTaskID } : {}),
    });

    const newTicket = await newIssueTicket.save();

    return NextResponse.json({
      success: true,
      message: "Created a new ticket",
      createdTicket: newTicket,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
