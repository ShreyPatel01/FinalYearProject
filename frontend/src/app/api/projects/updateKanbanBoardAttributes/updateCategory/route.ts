import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Sprint from "@/src/models/sprintModel";
import Category from "@/src/models/categoryModel";
import Task from "@/src/models/taskModel";
import Comment from "@/src/models/taskCommentModel";
import User from "@/src/models/userModels";

connect();

//Creating new Category
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const catName = requestBody.catName;
    const sprintID = requestBody.sprintID;
    const projectID = requestBody.projectID
    console.log("CATNAME FROM BACKEND: " + catName);
    console.log("SPRINTID FROM BACKEND: " + sprintID);

    //Creating a new instance of category
    const newCategory = new Category({
      sprint: sprintID,
      categoryName: catName,
      colour: "#ff0000",
      projectID: projectID
    });

    //Saving category to DB
    const savedCategory = await newCategory.save();
    console.log("SAVED CATEGORY FROM BACKEND: " + savedCategory);

    //Pushing category to sprint DB
    const sprint = await Sprint.findByIdAndUpdate(sprintID, {
      $push: { sprintCategories: savedCategory._id },
    });
    await sprint.save();

    return NextResponse.json({
      message: "Category has been created",
      success: true,
      savedCategory: savedCategory,
      newCategoryID: savedCategory._id,
    });
  } catch (error: any) {
    console.error("Error creating project: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//Updating category name
export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const {catID, newName, newColour} = requestBody;
    console.log("requestBody from backend: ", requestBody);

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: catID },
      { categoryName: newName, colour: newColour }
    );
    console.log("updated category from backend: ", updatedCategory);
    if (!updatedCategory) {
      return NextResponse.json(
        { message: "category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Category name has been updated",
      success: true,
      updatedCategory: updatedCategory,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//Removing Category
export async function DELETE(request: NextRequest) {
  try {
    const URLParams = new URLSearchParams(new URL(request.url).search);
    const categoryID = URLParams.get("id");
    const category = await Category.findOne({ _id: categoryID });
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const tasksInCategory = category.categoryTasks;
    const taskIds = tasksInCategory.map((task: { _id: any }) => task._id);
    const taskMembers = tasksInCategory.flatMap(
      (task: { taskMembers: any }) => task.taskMembers
    );
    const taskComments = tasksInCategory.flatMap(
      (task: { taskComments: any }) => task.taskComments
    );

    // Update user tasks in bulk if there are any task members
    if (taskMembers.length > 0 || !taskMembers.includes("Not yet assigned")) {
      await User.updateMany(
        { username: { $in: taskMembers } },
        { $pull: { userTasks: { $in: taskIds } } }
      );
    }

    // Delete comments if there are any
    if (taskComments.length > 0) {
      await Comment.deleteMany({ _id: { $in: taskComments } });
    }

    // Delete tasks if there are any
    if (taskIds.length > 0) {
      await Task.deleteMany({ _id: { $in: taskIds } });
    }

    // Remove category from sprint
    await Sprint.updateMany(
      { sprintCategories: { $in: [categoryID] } },
      { $pull: { sprintCategories: categoryID } }
    );

    // Delete the category
    await Category.deleteOne({ _id: categoryID });

    return NextResponse.json({
      message: "Successfully deleted Category",
      success: true,
    });
  } catch (error: any) {
    console.error("Something failed on the backend ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
