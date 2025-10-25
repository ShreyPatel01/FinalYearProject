import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Sprint from "@/src/models/sprintModel";
import Category from "@/src/models/categoryModel";
import Task from "@/src/models/taskModel";

connect();

export async function GET(request: NextRequest) {
  const URLParams = new URLSearchParams(new URL(request.url).search);
  const taskID = URLParams.get("taskID");
  console.log("TaskID from backend URL: ", taskID);

  let categoryNames = [];
  let categoryIDs = [];
  const task = await Task.findOne({ _id: taskID });
  console.log("task from getCategoryDetails: ", task);
  const categoryWithTask = task.category;
  console.log("categorywithtask from getCategoryDetails: ", categoryWithTask);
  const category = await Category.findOne({ _id: categoryWithTask });
  console.log("category from getCategoryDetails: ", category);
  const sprintWithCategory = category.sprint;
  console.log(
    "sprintWithCategory from getCategoryDetails: ",
    sprintWithCategory
  );
  const sprint = await Sprint.findOne({ _id: sprintWithCategory });
  console.log("sprint from getCategoryDetails: ", sprint);

  const sprintCategories = sprint.sprintCategories;
  for (let i = 0; i < sprintCategories.length; i++) {
    const categoryOption = await Category.findOne({ _id: sprintCategories[i] });
    console.log("category option from backend: ", categoryOption);
    categoryNames.push(categoryOption.categoryName);
    categoryIDs.push(categoryOption._id);
  }
  console.log("category names: ", categoryNames);
  console.log("category ids: ", categoryIDs);

  return NextResponse.json({
    success: true,
    names: categoryNames,
    ids: categoryIDs,
  });
}
