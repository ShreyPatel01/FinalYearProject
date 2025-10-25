import Category from "@/src/models/categoryModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";
import Task from "@/src/models/taskModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const categoryID = queryParams.get("categoryID");
    let TaskList: ObjectId[] = [];

    const category = await Category.findOne({ _id: categoryID });
    if (!category) {
      return NextResponse.json({
        message: "category not found",
        status: 404,
        invalidCatID: categoryID,
      });
    }

    const catName = category.categoryName;
    const catColour = category.colour;
    const tasks = category.categoryTasks;

    for (const task of tasks) {
      const taskFromDB = await Task.findOne({ _id: task._id });
      if (!taskFromDB) {
        return NextResponse.json({
          message: "task not found",
          status: 404,
          invalidTaskID: task._id,
        });
      }
      TaskList.push(task._id);
    }

    console.log(catName, catColour, TaskList);

    return NextResponse.json({
      success: true,
      name: catName,
      colour: catColour,
      taskList: TaskList,
      message: "got category details",
    });
  } catch (error: any) {
    console.error(`Error fetching category details: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
