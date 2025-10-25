import { mongoose } from "mongoose";

const categorySchema = new mongoose.Schema({
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sprints",
  },
  categoryName: {
    type: String,
    required: true,
    unique: false,
  },
  colour: {
    type: String,
    required: false,
    unique: false,
  },
  categoryTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
    },
  ],
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
    required: true,
  }
});

const Category =
  mongoose.models.categories || mongoose.model("categories", categorySchema);

export default Category;
