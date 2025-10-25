import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/src/models/userModels";
import Project from "@/src/models/projectModel";
import KanbanBoard from "@/src/models/kanbanBoardModel";
import Sprint from "@/src/models/sprintModel";
import Category from "@/src/models/categoryModel";
import Task from "@/src/models/taskModel";
import projectTemplate from "../../../components/projectComponents/projectTemplate/projectTemplates.json";
import { createActivityLog } from "@/src/helpers/createActivityLog";
import { S3 } from "aws-sdk";
import { projectRoles, userRoles } from "@/src/models/enums/userRoles";
import mongoose from "mongoose";
import Channel from "@/src/models/channelModel";
import { TaskStatus } from "@/src/models/enums/status";

connect();
type TaskTemplate = {
  taskName: string;
  taskDesc: string;
};

type CategoryTemplate = {
  categoryName: string;
  colour: string;
  categoryTasks: TaskTemplate[];
};

type SprintTemplate = {
  sprintNo: number;
  sprintCategories: CategoryTemplate[];
};

type ProjectTemplate = {
  field: string;
  numberOfSprints: number;
  averageSprintLength: number;
  sprints: SprintTemplate[];
};

type ProjectTemplates = {
  [key: string]: ProjectTemplate[];
};

//Configuring the AWS SDK
const s3Bucket = new S3({
  region: process.env.AWS_BUCKET_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const typedProjectTemplates: ProjectTemplates = projectTemplate;
    const requestBody = await request.json();
    const {
      defaultProjectName,
      creatorID,
      projectName,
      projectDesc,
      privateProject,
    } = requestBody.requestBody;
    console.log(
      `default project name: ${defaultProjectName}, creator id: ${creatorID}, projectName: ${projectName}, project desc: ${projectDesc}`
    );

    let errors = [];

    if (
      projectDesc == null ||
      projectDesc === "" ||
      projectDesc.trim().length === 0
    ) {
      errors.push(`Please provide a project description`);
    }

    const chosenTemplateArray = typedProjectTemplates[defaultProjectName];
    const chosenTemplate = chosenTemplateArray[0];
    if (!chosenTemplate) {
      errors.push(`Template not found for ${defaultProjectName}`);
    }

    const user = await User.findOne({ _id: creatorID });
    if (!user) {
      errors.push(`There isn't a user with the ID ${creatorID}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    //Calculating deadline and using that for estimatedCompletion
    const currentDate = new Date();
    const daysToAdd =
      chosenTemplate.numberOfSprints * chosenTemplate.averageSprintLength;
    const estimatedCompletion = new Date(
      currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );

    //In case projectPrivate is undefined
    const projectPrivacySetting =
      privateProject !== undefined ? privateProject : false;

    //Creating new instance of Project
    const newProject = new Project({
      projectName: projectName,
      projectDescription: projectDesc,
      creationDate: currentDate,
      field: chosenTemplate.field,
      numberOfSprints: chosenTemplate.numberOfSprints,
      averageSprintLength: chosenTemplate.averageSprintLength,
      estimatedCompletion: estimatedCompletion,
      members: [creatorID],
      projectAdmin: creatorID,
      private: privateProject ? privateProject : projectPrivacySetting,
    });
    const savedProject = await newProject.save();

    //Creating new instance of Kanbanboard
    const newKanbanBoard = new KanbanBoard({
      project: savedProject._id,
    });
    const savedKanbanBoard = await newKanbanBoard.save();

    //Looping through sprints in template
    for (const sprint of chosenTemplate.sprints) {
      //Creating a new sprint for the kanbanboard
      const daysToAddToStart =
        chosenTemplate.averageSprintLength * (sprint.sprintNo - 1);
      const startDate = new Date(currentDate.getTime());
      startDate.setDate(currentDate.getDate() + daysToAddToStart);
      const daysToAddToEnd =
        chosenTemplate.averageSprintLength * sprint.sprintNo;
      const endDate = new Date(currentDate.getTime());
      endDate.setDate(endDate.getDate() + daysToAddToEnd);
      const newSprint = new Sprint({
        kanbanBoard: savedKanbanBoard._id,
        sprintNo: sprint.sprintNo,
        sprintLength: chosenTemplate.averageSprintLength,
        startDate: startDate,
        endDate: endDate,
        projectID: savedProject._id,
      });
      const savedSprint = await newSprint.save();

      //Looping through categories in sprint
      for (const category of sprint.sprintCategories) {
        //Creating a new category for the sprint
        const newCategory = new Category({
          sprint: savedSprint._id,
          categoryName: category.categoryName,
          colour: category.colour,
          projectID: savedProject._id,
        });
        const savedCategory = await newCategory.save();

        //Looping through tasks in category
        for (const task of category.categoryTasks) {
          //Calculating task deadline
          const daysToAdd =
            Math.round(chosenTemplate.averageSprintLength / 2) *
            sprint.sprintNo;
          const currentDate = new Date();
          const taskDeadline = new Date(
            currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
          );

          //Creating a new task for the category
          const newTask = new Task({
            category: savedCategory._id,
            taskName: task.taskName,
            taskDesc: task.taskDesc,
            taskCreationDate: currentDate,
            taskCreator: creatorID,
            taskDeadline: taskDeadline,
            taskMembers: creatorID,
            projectID: savedProject._id,
            status: TaskStatus.NOTSTARTED,
          });
          const savedTask = await newTask.save();

          //Creating a new activity log for the task
          await createActivityLog(
            savedTask._id,
            user.username,
            savedProject._id
          );
          //pushing saved task to category
          await Category.findByIdAndUpdate(savedCategory._id, {
            $push: { categoryTasks: savedTask._id },
          });
          //pushing saved task to userTasks
          await User.findByIdAndUpdate(creatorID, {
            $push: { userTasks: savedTask._id },
          });
        }
        //pushing saved category to sprintCategories
        await Sprint.findByIdAndUpdate(savedSprint._id, {
          $push: { sprintCategories: savedCategory._id },
        });
      }
      //pushing saved sprint to kanbanboard
      await KanbanBoard.findByIdAndUpdate(savedKanbanBoard._id, {
        $push: { sprints: savedSprint._id },
      });
    }
    //pushing kanbanboard to project
    await Project.findByIdAndUpdate(savedProject._id, {
      $push: { kanbanBoard: savedKanbanBoard._id },
    });

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
          role: projectRoles.ADMIN,
        })),
        projectID: savedProject._id,
        createdAt: currentDate,
        updatedAt: currentDate,
        channelAdmin: creatorID,
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
        { _id: creatorID },
        { $push: { channels: savedChannel._id } }
      );
    }

    //Pushing user to projectClients if type === CLIENT
    if(user.type === userRoles.CLIENT){
      await Project.findOneAndUpdate({_id: savedProject._id}, {$push: {projectClients: [user._id]}});
    }

    return NextResponse.json({
      success: true,
      message: `Project has successfully been created from template ${defaultProjectName}`,
      newProjectID: savedProject._id,
    });
  } catch (error: any) {
    console.error(
      "An error occurred on the backend of createProjectFromTemplate",
      error
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
