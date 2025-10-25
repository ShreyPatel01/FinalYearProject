import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Task from "@/src/models/taskModel";
import Category from "@/src/models/categoryModel";
import Sprint from "@/src/models/sprintModel";
import KanbanBoard from "@/src/models/kanbanBoardModel";
import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";
import { createActivityLog } from "@/src/helpers/createActivityLog";
import { createUpdateTaskActivityLog } from "@/src/helpers/createUpdateTaskActivityLog";
import { TaskStatus } from "@/src/models/enums/status"

connect();

export async function POST(request: NextRequest) {
  try {
    let errors = [];
    const requestBody = await request.json();
    const {
      category,
      taskName,
      taskDesc,
      taskCreator,
      taskDeadline,
      taskMembers,
      projectID,
    } = requestBody.requestBody;

    const taskDetails = [
      category,
      taskName,
      taskDesc,
      taskCreator,
      taskDeadline,
    ];

    taskDetails.forEach((element: string, index: number) => {
      const labelMessages = [
        "provide the category ID",
        "provide the task name",
        "provide the task description",
        "provide the task creator",
        "provide the task deadline",
      ];
      if (element == null || element === "" || element.trim().length === 0) {
        const labelMessage = labelMessages[index];
        errors.push(`Please ${labelMessage}`);
      }
    });

    if (taskMembers.length === 0) {
      errors.push(
        "Please assign at least one task member or choose the option 'assign at a later date'"
      );
    }

    //Check to make sure the deadline date is not before the current date
    const currentDate = new Date().getTime();
    const taskDeadlineDate = new Date(taskDeadline);
    const deadlineDate = taskDeadlineDate.getTime();
    if (deadlineDate < currentDate) {
      errors.push("You can't set the deadline date before today");
    } else {
      //Check to make sure deadline date isn't after project deadline
      const sprint = await Sprint.find({
        sprintCategories: { $in: category },
      });
      console.log("Sprint from updateTask: ", sprint);
      console.log("SprintID from updateTask: ", sprint[0]._id);
      const kanbanBoard = await KanbanBoard.findOne({
        sprints: { $in: sprint[0]._id },
      });
      console.log("KanbanBoard from updateTask: ", kanbanBoard);
      const project = await Project.findOne({ kanbanBoard: kanbanBoard._id });
      console.log("Project from updateTask: ", project);
      const projectDeadlineDate = new Date(project.estimatedCompletion);
      const projectDeadline = projectDeadlineDate.getTime();
      if (deadlineDate > projectDeadline) {
        errors.push(
          "The task deadline can't be after the project completion date"
        );
      }
    }

    //Sending errors if they exist
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    errors = [];

    //Retrieving the id's of the task members
    let userIDs = [];
    for (let i = 0; i < taskMembers.length; i++) {
      const user = await User.findOne({ username: taskMembers[i] });
      if (user) {
        userIDs.push(user._id.toString());
      }
    }

    //Creating a new instance of Task
    const newTask = new Task({
      category: category,
      taskName: taskName,
      taskDesc: taskDesc,
      taskCreationDate: currentDate,
      taskCreator: taskCreator,
      taskDeadline: taskDeadline,
      taskMembers: userIDs,
      projectID: projectID,
      status: TaskStatus.NOTSTARTED
    });

    //Saving task to DB
    const savedTask = await newTask.save();

    const creator = await User.findOne({ _id: taskCreator });
    const creatorUsername = creator.username;

    //Creating instance of ActivityLog and saving to DB
    const savedActivityLog = await createActivityLog(
      savedTask._id,
      creatorUsername,
      projectID
    );
    console.log("New Activity Log for task: ", savedActivityLog);

    //Pushing task to category DB
    const categoryFromDB = await Category.findByIdAndUpdate(
      requestBody.requestBody.category,
      {
        $push: { categoryTasks: savedTask._id },
      }
    );
    await categoryFromDB.save();

    //Adding taskID to User
    const assignedCheck = !savedTask.taskMembers.includes("Not yet assigned");
    if (assignedCheck) {
      for (
        let userCount = 0;
        userCount < savedTask.taskMembers.length;
        userCount++
      ) {
        const userID = savedTask.taskMembers[userCount];
        const user = await User.findOneAndUpdate(
          { _id: userID },
          { $push: { userTasks: savedTask._id } }
        );
        await user.save();
      }
    }

    return NextResponse.json({
      message: "Task has been created",
      success: true,
      savedTask: savedTask,
      savedTaskID: savedTask._id,
    });
  } catch (error: any) {
    console.error("Error creating project: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const requestBody = await request.json();
  const action = requestBody.action;

  switch (action) {
    case "updateAnyAttributes":
      return updateAnyAttributes(requestBody);
    case "updateTaskCategory":
      return updateTaskCategory(requestBody);
  }
}

async function updateAnyAttributes(requestBody: any) {
  try {
    const {
      taskID,
      username,
      changedAttributes,
      oldAttributeValues,
      newAttributeValues,
      projectID,
    } = requestBody;

    const convertDateFormat = (input: any) => {
      // Split the input string into date and time parts
      const [datePart, timePart] = input.split(", ");
      // Split the date part into day, month, and year
      const [day, month, year] = datePart.split("/");
      // Split the time part into hours, minutes, and period (am/pm)
      const [time, period] = timePart.split(" ");
      const [hours, minutes] = time.split(":");

      // Convert the month from 1-based to 0-based (since JavaScript's Date uses 0-based months)
      const monthIndex = parseInt(month, 10) - 1;

      // Ensure hours and minutes are parsed as numbers
      const hours24 = parseInt(hours, 10);
      const minutes24 = parseInt(minutes, 10);

      // Adjust hours for PM
      const adjustedHours = period === "pm" ? hours24 + 12 : hours24;

      // Construct a Date object
      const date = new Date(year, monthIndex, day, adjustedHours, minutes24);

      // Convert the Date object to ISO string format
      const isoString = date.toISOString();

      return isoString;
    };

    console.log("requestbody from backend: ", requestBody.requestBody);

    //Updating the task details
    let update: { [key: string]: any } = {};
    for (let i = 0; i < changedAttributes.length; i++) {
      if (changedAttributes[i] === "taskDeadline") {
        const dateToFormat = newAttributeValues[i];
        const formattedDate = convertDateFormat(dateToFormat);
        update[changedAttributes[i]] = formattedDate;
      } else if (changedAttributes[i] === "category") {
        //Updating task category with new category id and replacing related attribute values with category names
        //This is to avoid errors when generating the activity log in case the code tries looking for a category
        //that a user has previously deleted.
        const newCategoryID = newAttributeValues[i];
        update[changedAttributes[i]] = newCategoryID;
        const newCategory = await Category.findOne({ _id: newCategoryID });
        console.log(`New Category: ${newCategory}`);
        const oldCategoryID = oldAttributeValues[i];
        console.log(`Old category ID: ${oldCategoryID}`);
        const oldCategory = await Category.findOne({ _id: oldCategoryID });
        console.log(`Old Category: ${oldCategory}`);
        const oldCategoryName = oldCategory.categoryName;
        const newCategoryName = newCategory.categoryName;
        oldAttributeValues[i] = oldCategoryName;
        newAttributeValues[i] = newCategoryName;

        //Moving task to new category
        await Category.findByIdAndUpdate(oldCategoryID, {
          $pull: { categoryTasks: taskID },
        });
        await Category.findByIdAndUpdate(newCategoryID, {
          $push: { categoryTasks: taskID },
        });
      } else {
        update[changedAttributes[i]] = newAttributeValues[i];
      }
    }
    await Task.findByIdAndUpdate(taskID, update);

    //Creating Activity Log for the update
    await createUpdateTaskActivityLog(
      taskID,
      username,
      changedAttributes,
      oldAttributeValues,
      newAttributeValues,
      projectID
    );

    return NextResponse.json({
      message: "Task has been updated and activity log created",
      success: true,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateTaskCategory(requestBody: any) {
  try {
    const taskID = requestBody.taskID;
    const newCategoryID = requestBody.categoryID;
    console.log(`taskID: ${taskID} newCategoryID: ${newCategoryID}`);

    let newCategoryName = null;

    const task = await Task.findOne({ _id: taskID });
    const category = await Category.findOne({ _id: newCategoryID });
    console.log("category");
    console.log(category);
    if (category) {
      newCategoryName = category.categoryName;
      if (task) {
        await Task.findByIdAndUpdate(task._id, {
          $set: { category: category._id },
        });
      }
    }
    return NextResponse.json({
      success: true,
      message: "Task Category Updated",
      newCatName: newCategoryName,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}