import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongoose";
import { projectRoles } from "@/src/models/enums/userRoles";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";

connect();

interface Client {
  clientID: ObjectId;
  clientName: string;
  clientDesc: string;
}

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const userID = queryParams.get("userID");
    console.log(`userID from getClientDetails = ${userID}`);
    const clientList: Client[] = [];

    const project = await Project.findOne({ _id: projectID });
    if (!project) {
      return NextResponse.json({
        message: "Project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }
    console.log(project);
    //Getting user role
    let role = "";
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json(
        { error: "Couldn't find user in database", invalidUserID: userID },
        { status: 404 }
      );
    }
    if (project.projectAdmin.toString() === userID) {
      role = projectRoles.ADMIN;
    } else if (project.projectMods.includes(user._id)) {
      role = projectRoles.MOD;
    } else if (project.projectClients.includes(user._id)) {
      role = projectRoles.CLIENT;
    } else {
      role = projectRoles.USER;
    }

    const clientIDs = project.projectClients;
    for (const clientID of clientIDs) {
      const client = await User.findOne({ _id: clientID });
      const clientName = `${client.firstName} ${client.lastName}`;
      const clientDesc = client.description;
      const ClientObject = {
        clientID: client._id,
        clientName: clientName,
        clientDesc: clientDesc,
      };
      clientList.push(ClientObject);
    }
    console.log(`role = ${role}`);

    return NextResponse.json({
      success: true,
      clients: clientList,
      role: role,
      message: "Retrieved clients from database",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
