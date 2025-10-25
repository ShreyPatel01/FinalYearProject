import { mongoose } from "mongoose";

const kanbanBoardSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
  },
  sprints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "sprints",
  }],
});

const KanbanBoard = mongoose.models.kanbanBoards || mongoose.model("kanbanBoards", kanbanBoardSchema);

export default KanbanBoard;