import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Project from "@/src/models/projectModel";
import KanbanBoard from "@/src/models/kanbanBoardModel";
import Sprint from "@/src/models/sprintModel";
import { S3 } from "aws-sdk";
import Channel from "@/src/models/channelModel";
import { chatRoles, projectRoles, userRoles } from "@/src/models/enums/userRoles";
import User from "@/src/models/userModels";
import mongoose from "mongoose";

connect();

//Configuring the AWS SDK
const s3Bucket = new S3({
  region: process.env.AWS_BUCKET_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(request: NextRequest) {
  try {
    let errors = [];
    const requestBody = await request.json();
    const {
      projectName,
      projectDescription,
      field,
      numberOfSprints,
      averageSprintLength,
      estimatedCompletion,
      members,
      privateProject,
    } = requestBody;

    const projectDetails = [
      projectName,
      projectDescription,
      field,
      numberOfSprints,
      averageSprintLength,
      estimatedCompletion,
      members,
    ];

    console.log(projectDetails);

    projectDetails.forEach((element: string, index: number) => {
      const labelMessages = [
        "project name",
        "project description",
        "field that your project fits in",
        "number of sprints",
        "number of days for each sprint",
      ];
      if (element == null || element === "" || element.trim().length === 0) {
        const labelMessage = labelMessages[index];
        errors.push(`Please provide a ${labelMessage}`);
      }
    });

    //Checks if the date given is earlier than the current date
    const currentDate = new Date();
    const estimatedCompletionDate = new Date(estimatedCompletion);

    if (estimatedCompletionDate < currentDate) {
      errors.push("The estimated completion date cannot be earlier than today");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    //In case projectPrivate is undefined
    const projectPrivacySetting =
      privateProject !== undefined ? privateProject : false;

    const newProject = new Project({
      projectName,
      projectDescription,
      creationDate: currentDate,
      field,
      numberOfSprints,
      averageSprintLength,
      estimatedCompletion,
      members: [members],
      projectAdmin: members,
      private: privateProject ? privateProject : projectPrivacySetting,
    });
    const savedProject = await newProject.save();
    //console.log("Saved Project: "+savedProject)

    //Creating a new instance of Kanban Board
    const newKanbanBoard = new KanbanBoard({
      project: savedProject._id,
    });

    //Saving newKanbanBoard in database
    const savedKanbanBoard = await newKanbanBoard.save();

    //Creating a new instance of Sprint
    for (let i = 1; i < savedProject.numberOfSprints + 1; i++) {
      const daysToAddToStart = averageSprintLength * (i - 1);
      const startDate = new Date(currentDate.getTime());
      startDate.setDate(currentDate.getDate() + daysToAddToStart);
      const daysToAddToEnd = averageSprintLength * i;
      const endDate = new Date(currentDate.getTime());
      endDate.setDate(endDate.getDate() + daysToAddToEnd);

      const newSprint = new Sprint({
        kanbanBoard: savedKanbanBoard._id,
        sprintNo: i,
        sprintLength: averageSprintLength,
        startDate: startDate,
        endDate: endDate,
        projectID: savedProject._id
      });
      //Saving newSprint in database
      const savedSprint = await newSprint.save();
      //Updating savedKanbanBoard to include savedSprint
      await KanbanBoard.updateOne(
        { _id: savedKanbanBoard._id },
        {
          $push: {
            sprints: savedSprint._id,
          },
        }
      );
      await savedKanbanBoard.save();
    }

    //Updating the project with the new kanban board
    savedProject.kanbanBoard = savedKanbanBoard._id;
    await savedProject.save();

    //Setting the name of the new folder in the S3 bucket to the project's ID
    const newFolderName = `projectFiles/${savedProject._id.toString()}/`;

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: newFolderName,
      Body: "",
    };

    await s3Bucket.putObject(s3Params).promise();

    //Creating a chat channel for the project if the project's private field is false
    if (savedProject.private === false) {
      const newChannel = new Channel({
        channelName: "general",
        channelMembers: savedProject.members.map((memberID: string) => ({
          userID: new mongoose.Types.ObjectId(memberID),
          role: chatRoles.ADMIN,
        })),
        projectID: savedProject._id,
        createdAt: currentDate,
        updatedAt: currentDate,
        channelAdmin: members,
        private: false,
      });
      const savedChannel = await newChannel.save();

      //Updating project with channel
      await Project.findOneAndUpdate(
        { _id: savedProject._id },
        { $push: { channels: savedChannel._id } }
      );

      //Updating user with channel
      await User.findOneAndUpdate(
        { _id: members },
        { $push: { channels: savedChannel._id } }
      );
    }
    
    //Pushing user to projectClients if role is client
    const user = await User.findOne({ _id: members });
    if (user.type === userRoles.CLIENT) {
      await Project.findOneAndUpdate(
        { _id: savedProject._id },
        { $push: { projectClients: [user._id] } }
      );
    }

    const response = NextResponse.json({
      message: "Project has been created",
      success: true,
      savedProject: savedProject,
    });

    return response;
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
