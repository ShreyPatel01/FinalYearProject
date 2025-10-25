import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { userRoles } from "@/src/models/enums/userRoles";
import { ObjectId } from "mongoose";

connect();

interface Client {
  id: ObjectId;
  fullName: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const projectID = request.nextUrl.searchParams.get("projectID");
    const project = await Project.findOne({ _id: projectID });
    let clientList: Client[] = [];
    if (!project) {
      return NextResponse.json(
        { error: "Project not found", invalidProjectID: projectID },
        { status: 404 }
      );
    }
    //Retrieving clients in project
    const clientsInProject = project.projectClients;
    const allClients = await User.find({ type: userRoles.CLIENT, isVerified: true });
    //Adding all clients to clientList if project has no clients
    if (clientsInProject.length === 0) {
      for (const client of allClients) {
        const clientName = `${client.firstName} ${client.lastName}`;
        const email = client.email;
        const clientObject = {
          id: client._id,
          fullName: clientName,
          email: email,
        };
        clientList.push(clientObject);
      }
    } else if (clientsInProject.length > 0) {
      const filteredClients = allClients.filter((client: typeof User) => {
        !clientsInProject.includes(client._id.toString());
      });
      for (const client of filteredClients) {
        const clientName = `${client.firstName} ${client.lastName}`;
        const email = client.email;
        const clientObject = {
          id: client._id,
          fullName: clientName,
          email: email,
        };
        clientList.push(clientObject);
      }
    }

    console.log(clientList);
    
    return NextResponse.json({
      success: true,
      clientsNotInProject: clientList,
      message: "Retrieved all clients not in project",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
