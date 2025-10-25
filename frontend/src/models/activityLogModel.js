import { mongoose } from "mongoose";
import { ActivityAction } from "./enums/activityActions";
const activityLogSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tasks",
  },
  username: {
    type: String,
    required: true,
    unique: false,
  },
  action: {
    type: String,
    enum: Object.values(ActivityAction),
    required: true,
  },
  dateOfAction: {
    type: Date,
    required: true,
  },
  updatedAttributes: [
    {
      type: String,
      required: false,
    },
  ],
  oldAttributeValues: [{
    type: String,
    required: false,
  }],
  newAttributeValues: [{
    type: String,
    required: false,
  }],
  commentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comments",
    required: false,
  },
  childTaskName: {
    type: String,
    required: false
  },
  deletedChildTask: {
    type: String,
    required: false,
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  oldSprintNo: {
    type: Number,
    required: false,
    unique: false
  },
  newSprintNo: {
    type: Number,
    required: false,
    unique: false
  },
  oldCategoryName: {
    type: String,
    required: false,
    unique: false
  },
  newCategoryName: {
    type: String,
    required: false,
    unique: false
  }
});

const ActivityLog =
  mongoose.models.activitylogs ||
  mongoose.model("activitylogs", activityLogSchema);

export default ActivityLog;
