import { mongoose } from "mongoose";

const sprintSchema = new mongoose.Schema({
  kanbanBoard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'kanbanBoards',
  },
  sprintNo: {
    type: Number,
    required: true,
    unique: false,
  },
  startDate: {
    type: Date,
    unique: false,
    required: true
  },
  endDate: {
    type: Date,
    unique: false,
    required: true,
  },
  sprintLength: {
    type: Number,
    required: true
  },
  sprintCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories',
    },
  ],
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
    required: true,
  }
});

const Sprint = mongoose.models.sprints || mongoose.model("sprints",sprintSchema);

export default Sprint;
