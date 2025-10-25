import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Category from "@/src/models/categoryModel";

connect();

export async function GET(request: NextRequest) {
  const URLParams = new URLSearchParams(new URL(request.url).search);
  const categoryID = URLParams.get("id");
  console.log("category id from backend: " + categoryID);

  const category = await Category.findOne({ _id: categoryID });
  console.log("category from backend: " + category);

  //Fetching tasks from category
  let tasks = [];
  if (category && category.categoryTasks) {
    tasks = category.categoryTasks;
  }
  console.log("Tasks from backend: ", tasks);

  return NextResponse.json({
    message: "Category Found",
    success: true,
    name: category.categoryName,
    tasks: tasks,
    colour: category.colour
  });
}
