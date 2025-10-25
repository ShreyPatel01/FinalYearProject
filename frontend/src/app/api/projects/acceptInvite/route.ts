import { connect } from "@/src/dbConfig/dbConfig";
import Channel from "@/src/models/channelModel";
import User from "@/src/models/userModels";
import {
  chatRoles,
  projectRoles,
  userRoles,
} from "@/src/models/enums/userRoles";
import Project from "@/src/models/projectModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function PUT(request: NextRequest) {
  try {
    //Getting the userID and token from the URL
    const URLParams = new URLSearchParams(new URL(request.url).search);
    const userID = URLParams.get("id");
    const token = URLParams.get("token");
    console.log("USERID FROM ACCEPTINVITE: " + userID);
    console.log("TOKEN FROM ACCEPTINVITE: " + token);
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        message: "User not found",
        status: 404,
        invalidUserID: userID,
      });
    }
    const userRole = user.type;

    const project = await Project.findOne({
      projectInvitationToken: token,
      projectInvitationTokenExpiryDate: { $gt: Date.now() },
    });
    console.log("PROJECT FROM ACCEPTINVITE" + project);

    let updatedProject: typeof Project = null || null;

    if (project) {
      project.members.push(user._id);
      project.projectInvitationToken = undefined;
      project.projectInvitationTokenExpiryDate = undefined;
      if (user.type === userRoles.CLIENT) {
        project.projectClients.push([user._id]);
      }

      if (project.private === false) {
        //Adding user to general channel
        const generalChannelID = project.channels[0];
        const channel = await Channel.findOne({ _id: generalChannelID });
        let role;
        if (user.type === userRoles.CLIENT) {
          role === chatRoles.CLIENT;
        } else {
          role === chatRoles.MEMBER;
        }
        await Channel.findByIdAndUpdate(channel._id, {
          $push: { channelMembers: [{ userID: user._id, role: role }] },
        });
        await User.findByIdAndUpdate(user._id, {
          $push: { channels: channel._id },
        });
      }
      updatedProject = await project.save();
    }
    console.log(updatedProject);

    const response = NextResponse.json({
      message: "User has been added to project",
      success: true,
      role: userRole,
    });

    return response;
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
