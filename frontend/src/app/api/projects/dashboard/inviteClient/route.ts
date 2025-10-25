import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import { SendInvitationEmail } from "@/src/helpers/inviteToProjectMailer";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse, NextRequest } from "next/server";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const projectID = requestBody.projectID;
    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found", invalidProjectID: projectID },
        { status: 404 }
      );
    }
    const clientID = requestBody.clientID;
    const client = await User.findOne({ _id: clientID });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found", invalidClientID: clientID },
        { status: 404 }
      );
    }
    const recipientEmail = client.email;

    await SendInvitationEmail({ recipientEmail, projectID });

    return NextResponse.json({
      message: "Invitation has been sent",
      success: true,
    });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
