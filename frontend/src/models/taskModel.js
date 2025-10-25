import { mongoose } from "mongoose";

const taskSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
  },
  taskName: {
    type: String,
    required: true,
    unique: false,
  },
  taskDesc: {
    type: String,
    required: true,
    unique: false,
  },
  taskCreationDate: {
    type: Date,
    required: true,
    unique: false,
  },
  taskCreator: {
    type: String,
    required: true,
    unique: false,
  },
  taskDeadline: {
    type: Date,
    required: true,
    unique: false,
  },
  finshed: {
    type: Boolean,
    required: true,
    default: false
  },
  taskMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  ],
  taskComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
    },
  ],
  childTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
    },
  ],
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "activitylogs",
    },
  ],
  parentTaskID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tasks",
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  status: {
    type: String,
    required: true,
    unique: false,
  }
});

const Task = mongoose.models.tasks || mongoose.model("tasks", taskSchema);

export default Task;
