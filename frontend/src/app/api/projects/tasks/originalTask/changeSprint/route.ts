import Sprint from "@/src/models/sprintModel";
import Category from "@/src/models/categoryModel";
import Task from "@/src/models/taskModel";
import { NextRequest, NextResponse } from "next/server";
import { createChangeSprintActivityLog } from "@/src/helpers/createChangeSprintActivityLog";
import { createChangeCategoryActivityLog } from "@/src/helpers/createChangeCategoryActivityLog";
import { connect } from "@/src/dbConfig/dbConfig";
import User from "@/src/models/userModels";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const taskID = requestBody.taskID;
    const newTaskDeadline = new Date(requestBody.newTaskDeadline);
    const newCategory = requestBody.newCategoryID;
    const selectedSprintID = requestBody.newSprintID;
    const userID = requestBody.userID;
    const projectID = requestBody.projectID;
    let errors = [];

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        message: "User not found",
        status: 404,
        invalidUserID: userID,
      });
    }

    //Finding task in database
    const task = await Task.findOne({ _id: taskID });
    if (!task) {
      return NextResponse.json({
        message: "Task not found",
        status: 404,
        invalidTaskID: taskID,
      });
    }
    //Retrieving username for activity log
    const username = user.username;

    //Retrieving old sprintNo for activity log
    const oldCategoryID = task.category;
    const oldCategory = await Category.findOne({ _id: oldCategoryID });
    const oldSprint = await Sprint.findOne({
      sprintCategories: { $in: [oldCategory._id] },
    });
    const oldSprintNo = oldSprint.sprintNo;

    //Retrieving old category name for activity log
    const oldCategoryName = oldCategory.categoryName;
    console.log(`oldCategoryName = ${oldCategoryName}`);

    //Finding new sprint in database
    const sprint = await Sprint.findOne({ _id: selectedSprintID });
    if (!sprint) {
      return NextResponse.json({
        message: "Sprint not found",
        status: 404,
        invalidSprintID: selectedSprintID,
      });
    }

    //Finding new category in database
    const category = await Category.findOne({ _id: newCategory });
    if (!category) {
      return NextResponse.json({
        message: "Category not found",
        status: 404,
        invalidCategoryID: newCategory,
      });
    }

    //Getting category name from new category for activity log
    const newCategoryName = category.categoryName;
    console.log(`newCategoryName = ${newCategoryName}`);

    //Checking if newTaskDeadline fits in the duration of the new sprint
    const newSprintStartDate = sprint.startDate;
    const newSprintEndDate = sprint.endDate;
    if (
      newSprintStartDate.getTime() > newTaskDeadline.getTime() ||
      newTaskDeadline.getTime() > newSprintEndDate.getTime()
    ) {
      errors.push(
        `The new task deadline needs to be in the range of the new sprint's duration`
      );
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    //Changing the deadline of the sprint
    await Task.findByIdAndUpdate(task._id, {
      $set: { taskDeadline: newTaskDeadline, category: category._id },
    });

    //Removing task from old category's categoryTasks
    await Category.updateOne(
      { _id: oldCategory._id },
      { $pull: { categoryTasks: task._id } }
    );

    //Adding task id to new category's categoryTasks
    await Category.updateOne(
      { _id: category._id },
      { $push: { categoryTasks: task._id } }
    );

    //Creating Activity Log for Change Sprint
    await createChangeSprintActivityLog(
      task._id,
      username,
      oldSprintNo,
      sprint.sprintNo,
      projectID
    );
    //Creating Activity Log for Change Category
    if (newCategoryName !== undefined && oldCategoryName !== undefined) {
      await createChangeCategoryActivityLog(
        task._id,
        username,
        oldCategoryName,
        newCategoryName,
        projectID
      );
    }

    return NextResponse.json({
      success: true,
      message: "Moved task to new sprint and category",
    });
  } catch (error: any) {
    console.error(`Error moving task to new sprint and category: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
