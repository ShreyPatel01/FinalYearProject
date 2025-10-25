import { connect } from "@/src/dbConfig/dbConfig";
import { SendInvitationEmail } from "@/src/helpers/inviteToProjectMailer";
import User from "@/src/models/userModels";
import { NextResponse, NextRequest } from "next/server";

connect();

export async function PUT(request: NextRequest) {
  try {
    const URLParams = new URLSearchParams(new URL(request.url).search);
    const projectID = URLParams.get("projectID");
    console.log("projectID from invitetoproject backend: ",projectID)
    const recipient = URLParams.get("invitedUser");
    console.log("recipient from invitetoproject backend: ",recipient)
  
    const user = await User.findOne({username: recipient});
    console.log("User to send email to: "+user);
    const recipientEmail = user.email;
    console.log("recipient email from backend: ",recipientEmail)
  
    //Sending invitation email to user
    await SendInvitationEmail({recipientEmail, projectID});
  
    return NextResponse.json({
      message:"Invitation has been sent",
      success:true
    });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({error: error.message},{status:500});
  }
}
