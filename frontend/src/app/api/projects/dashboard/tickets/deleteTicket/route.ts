import TicketIssue from "@/src/models/issueModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function DELETE(request: NextRequest) {
  try {
    const issueID = request.nextUrl.searchParams.get("issueID");
    const issue = await TicketIssue.findOne({ _id: issueID });
    if (!issue) {
      return NextResponse.json(
        { error: "Couldn't find issue in database", invalidIssueID: issueID },
        { status: 404 }
      );
    }
    //Deleting issue ticket
    await TicketIssue.deleteOne({ _id: issue._id });
  
    return NextResponse.json({
      success: true,
      message: "Successfully deleted issue",
      deletedIssue: issue,
    });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({error: error.message}, {status:500});
  }
}
