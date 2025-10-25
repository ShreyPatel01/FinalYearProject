import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import { projectRoles } from "@/src/models/enums/userRoles";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    //Making sure user exists in database
    const userID = requestBody.userID;
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json(
        { error: "Couldn't find user in database", invalidUserID: userID },
        { status: 404 }
      );
    }

    //Making sure project exists in database
    const projectID = requestBody.projectID;
    const project = await Project.findOne({
      _id: projectID,
      members: { $in: [user._id] },
    });
    if (!project) {
      return NextResponse.json(
        {
          error: "couldn't find project in database",
          invalidProjectID: projectID,
        },
        { status: 404 }
      );
    }

    //Updating project by changing role
    const oldRole = requestBody.oldRole;
    if (oldRole === projectRoles.MOD) {
      await Project.updateOne(
        { _id: project._id },
        { $pull: { projectMods: user._id } }
      );
    } else if (oldRole === projectRoles.CLIENT) {
      await Project.updateOne(
        { _id: project._id },
        { $pull: { projectClients: user._id } }
      );
    }
    const newRole = requestBody.newRole;
    switch (newRole) {
      case projectRoles.USER:
        break;
      case projectRoles.MOD:
        await Project.updateOne(
          { _id: project._id },
          { $push: { projectMods: user._id } }
        );
        break;
      case projectRoles.CLIENT:
        await Project.updateOne(
          { _id: project._id },
          { $push: { projectClients: user._id } }
        );
        break;
    }

    return NextResponse.json({ success: true, message: "Updated user role" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
