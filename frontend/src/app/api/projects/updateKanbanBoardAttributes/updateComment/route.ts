import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Comment from "@/src/models/taskCommentModel";
import Task from "@/src/models/taskModel";
import User from "@/src/models/userModels";
import { createAddAcommentActivityLog } from "@/src/helpers/createAddCommentActivityLog";

connect();

export async function POST(request: NextRequest) {
  try {
    let errors = [];
    const requestBody = await request.json();
    const { commentContent, userID, taskID, projectID } = requestBody.requestBody;
    console.log(
      "request body from updatecomment backend: ",
      requestBody.requestBody
    );

    //Checking if commentContent has something there
    if (commentContent.trim().length === 0 || commentContent == null) {
      errors.push("Please provide a comment to post");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    //Getting username from userID
    const user = await User.findOne({ _id: userID });
    const username = user.username;

    //Creating new instance of comment
    const newComment = new Comment({
      task: taskID,
      userCommented: userID,
      comment: commentContent,
      dateCommented: new Date().getTime(),
      projectID: projectID
    });

    //Saving comment to DB
    const savedComment = await newComment.save();

    //Updating task with commentID
    await Task.findByIdAndUpdate(taskID, {
      $push: { taskComments: savedComment._id },
    });

    //Creating activity log for comment creation
    const savedActivityLog = await createAddAcommentActivityLog(
      taskID,
      username,
      savedComment._id,
      projectID
    );
    console.log("Activity log created for comment: ", savedActivityLog);

    return NextResponse.json({
      message: "Comment has been created",
      success: true,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
