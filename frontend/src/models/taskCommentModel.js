import { mongoose } from "mongoose";

const commentSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tasks",
  },
  userCommented: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  comment: {
    type: String,
    required: true,
    unique: false,
  },
  dateCommented: {
    type: Date,
    required: true,
    unique: false,
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
    required: true,
  },
});

const Comment =
  mongoose.models.comments || mongoose.model("comments", commentSchema);

export default Comment;
