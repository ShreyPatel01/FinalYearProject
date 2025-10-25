import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import UserDetails from "@/src/models/userModels";
import { projectRoles } from "@/src/models/enums/userRoles";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

interface UserDetails {
  id: ObjectId;
  userFullName: string;
  username: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const projectID = request.nextUrl.searchParams.get("projectID");
    const userID = request.nextUrl.searchParams.get("userID")
    const user = await User.findOne({_id: userID});
    if (!user) {
      return NextResponse.json(
        {
          error: "Couldn't find user in database",
          invalidUserID: userID,
        },
        { status: 404 }
      );
    }
    let userList: UserDetails[] = [];
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
    //Fetching all members of project
    const members = project.members;
    //Filtering project admin from members
    const filteredProjectMemberIDs = members.filter(
      (projectMember: ObjectId) => !(user._id.toString() === projectMember.toString())
    );
    console.log(filteredProjectMemberIDs);
    //Retrieving userdetails
    for (const projectMemberID of filteredProjectMemberIDs) {
      const user = await User.findOne({ _id: projectMemberID });
      if (!user) {
        return NextResponse.json(
          {
            error: "Couldn't find user in database",
            invalidUserID: projectMemberID,
          },
          { status: 404 }
        );
      }
      const userFullName = `${user.firstName} ${user.lastName}`;
      const username = user.username;
      let role = projectRoles.USER;
      if (project.projectClients.includes(user._id.toString())) {
        role = projectRoles.CLIENT;
      } else if (project.projectMods.includes(user._id.toString())) {
        role = projectRoles.MOD;
      }
      const userObject = {
        id: user._id,
        userFullName: userFullName,
        username: username,
        role: role,
      };
      userList.push(userObject);
    }

    console.log(userList);

    return NextResponse.json({ success: true, memberList: userList });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
