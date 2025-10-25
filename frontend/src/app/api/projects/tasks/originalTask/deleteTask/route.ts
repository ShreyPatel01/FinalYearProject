import ActivityLog from "@/src/models/activityLogModel";
import Task from "@/src/models/taskModel";
import Comment from "@/src/models/taskCommentModel";
import Category from "@/src/models/categoryModel";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const taskID = queryParams.get("taskID");

    //Finding task in database
    const task = await Task.findOne({ _id: taskID });
    if (!task) {
      return NextResponse.json({
        message: "Task not found",
        status: 404,
        invalidTaskID: taskID,
      });
    }
    //Removing task id from category
    await Category.updateOne(
      { _id: task.category },
      { $pull: { categoryTasks: task._id } }
    );
    //Finding comments related to task and deleting them
    await Comment.deleteMany({ task: task._id });
    //Finding activity logs related to task and deleting them
    await ActivityLog.deleteMany({ task: task._id });
    //Repeating for any child tasks
    const tasks = await Task.find({ parentTaskID: task._id });
    for (const task of tasks) {
      const childTaskID = task._id;
      await Comment.deleteMany({ task: childTaskID });
      await ActivityLog.deleteMany({ task: childTaskID });
      await Task.deleteOne({ _id: childTaskID });
    }

    //Deleting task
    await Task.deleteOne({ _id: task._id });

    return NextResponse.json({
      success: true,
      messsage: "Successfully deleted task",
      deletedTask: task,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
