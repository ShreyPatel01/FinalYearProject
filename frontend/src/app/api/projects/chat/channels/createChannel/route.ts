import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import Channel from "@/src/models/channelModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { chatRoles } from "@/src/models/enums/userRoles";
import { ObjectId } from "mongoose";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const projectID = queryParams.get("projectID");
    const userID = queryParams.get("userID");
    let listOfMembers = [];

    //Finding project in database
    const project = await Project.findOne({ _id: projectID });

    //Getting list of members from project
    const memberIDs = project.members;
    //Removing current user from memberIDs
    const otherMemberIDs = memberIDs.filter(
      (memberID: ObjectId) => memberID.toString() !== userID?.toString()
    );

    //Looping through memberIDs to get user's full name and username
    for (let i = 0; i < otherMemberIDs.length; i++) {
      const user = await User.findOne({ _id: otherMemberIDs[i] });

      //Getting username
      const username = user.username;

      //Getting user fullname
      const userFullName = `${user.firstName} ${user.lastName}`;

      let memberObject = {};
      if (user) {
        memberObject = {
          userID: user._id.toString(),
          username: username,
          userFullName: userFullName,
        };
      }
      listOfMembers.push(memberObject);
    }

    return NextResponse.json({
      success: true,
      message: "Retrieved all members of the project",
      memberList: listOfMembers,
    });
  } catch (error: any) {
    console.error(`Error while fetching members: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const selectedMembers = requestBody.selectedMemberOptions;
    const projectID = requestBody.projectID;
    const userID = requestBody.userID;
    const newChannelName = requestBody.newChannelName;
    const privateChannel = requestBody.privateChannel;
    console.log(requestBody)

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    //Finding project in database
    const project = await Project.findOne({ _id: projectID });
    //Getting current date
    const currentDate = new Date();

    //Creating a new channel
    const newChannel = new Channel({
      channelName: newChannelName,
      channelMembers: [{ userID: user._id, role: chatRoles.ADMIN }],
      projectID: projectID,
      createdAt: currentDate,
      updatedAt: currentDate,
      channelAdmin: user._id,
      private: privateChannel,
    });
    const savedChannel = await newChannel.save();
    console.log(`savedChannel = ${savedChannel}`)
    console.log("=========================================")

    //Adding channel to project
    const updatedProject = await Project.findOneAndUpdate(
      { _id: project._id },
      { $push: { channels: savedChannel._id } }
    );

    //Adding channel to user
    await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { channels: savedChannel._id } }
    );

    //Only adds the members in selectedMembers is privateChannel is true
    if (privateChannel === true) {
      console.log(selectedMembers)
      for (let i = 0; i < selectedMembers.length; i++) {
        const user = await User.findOne({ _id: selectedMembers[i] });
        console.log(`user = ${user}`)

        //Adding user to channel with member role
        await Channel.findOneAndUpdate(
          { _id: savedChannel._id },
          {
            $push: {
              channelMembers: { userID: user._id, role: chatRoles.MEMBER },
            },
          }
        );

        //Adding channel id to user
        await User.findOneAndUpdate(
          { _id: user._id },
          { $push: { channels: savedChannel._id } }
        );
      }
    } else {
      //Adds everyone in project to channel
      const memberIDs = project.members;
      const otherMemberIDs = memberIDs.filter(
        (memberID: ObjectId) => memberID.toString() !== userID
      );

      for (let i = 0; i < otherMemberIDs.length; i++) {
        const user = await User.findOne({ _id: otherMemberIDs[i] });

        //Adding user to channel with member role
        await Channel.findOneAndUpdate(
          { _id: savedChannel._id },
          {
            $push: {
              channelMembers: { userID: user._id, role: chatRoles.MEMBER },
            },
          }
        );

        //Adding channel id to user
        await User.findOneAndUpdate(
          { _id: user._id },
          { $push: { channels: savedChannel._id } }
        );
      }
    }

    const updatedChannel = await Channel.findOne({ _id: savedChannel });
    console.log(updatedChannel);

    return NextResponse.json({
      success: true,
      message: "New channel has been created",
      updatedProject,
      updatedChannel,
    });
  } catch (error: any) {
    console.error(`Error while creating new channel: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
