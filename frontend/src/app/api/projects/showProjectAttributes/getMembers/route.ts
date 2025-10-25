import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse, NextRequest } from "next/server";
import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";

connect();

export async function GET(request: NextRequest) {
  try {
    const users = [];
    let projectAdmin;
    let projectMods: string[] = [];
    let projectClients: string[] = [];
    let usernames: string[] = [];

    const URLObject = new URL(request.url);
    const URLParams = new URLSearchParams(URLObject.search);
    console.log("URL Search Params = " + URLParams);
    const projectID = URLParams.get("id");
    console.log("Project ID = " + projectID);

    const project = await Project.findOne({ _id: projectID });
    console.log(project);
    const members = project.members;
    console.log(`project members`);
    console.log(members);
    console.log(members.length);

    for (let i = 0; i < members.length; i++) {
      console.log(i);
      console.log(members[i].toString());
      const user = await User.findOne({ _id: members[i].toString() });
      console.log(user);
      if (user) {
        users.push(user);
        usernames.push(user.username.toString()); // Moved this line here
      }
      if (project.projectAdmin.toString() === user._id.toString()) {
        projectAdmin = user._id;
        continue;
      } else if (project.projectMods.includes(user._id.toString())) {
        projectMods.push(user._id.toString());
      } else if (project.projectClients.includes(user._id.toString())) {
        projectClients.push(user._id.toString());
      }
    }
    console.log(users);
    console.log("ADMIN FROM ROUTE.TS " + projectAdmin);

    console.log("usernames from users: ", usernames);

    return NextResponse.json({
      message: "Members found",
      success: true,
      data: users,
      usernames: usernames,
      admin: projectAdmin,
      modList: projectMods,
      clientList: projectClients,
    });
  } catch (error: any) {
    console.error("Error in GET function: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
