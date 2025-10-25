import TicketIssue from "@/src/models/issueModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const newIssueName = requestBody.newIssueName;
    const newIssueDesc = requestBody.newIssueDesc;
    const newIssueStatus = requestBody.newIssueStatus;
    const issueID = requestBody.issueID;

    //Finding issue in database
    const issue = await TicketIssue.findOne({ _id: issueID });
    if (!issue) {
      return NextResponse.json(
        { error: "Couldn't find issue in database", invalidIssueID: issueID },
        { status: 404 }
      );
    }

    //Updating issue with values
    const updatedIssue = await TicketIssue.findOneAndUpdate(
      { _id: issue._id },
      {
        $set: {
          issueName: newIssueName !== null ? newIssueName : issue.issueName,
          issueDesc: newIssueDesc !== null ? newIssueDesc : issue.issueDesc,
          status: newIssueStatus !== null ? newIssueStatus : issue.status,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Updated ticket",
      updatedTicket: updatedIssue,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
