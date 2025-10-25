import { mongoose } from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, "Please provide a project name"],
    unique: false,
  },
  projectDescription: {
    type: String,
    required: [true, "Please provide a description"],
    unique: false,
  },
  creationDate: {
    type: Date,
    required: true,
    unique: false,
  },
  field: {
    type: String,
    required: [true, "Please provide a field your project fits in"],
    unique: false,
  },
  numberOfSprints: {
    type: Number,
    required: true,
    unique: false,
  },
  averageSprintLength: {
    type: Number,
    required: [true, "Please provide the average sprint length in days"],
    unique: false,
  },
  estimatedCompletion: {
    type: Date,
    required: [true, "Please provide an estimated completion date"],
    unique: false,
  },
  finished: {
    type: Boolean,
    required: true,
    default: false,
  },
  members: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    ],
    required: [true, "A project can't have 0 members"],
    unique: false,
  },
  projectAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "A project can't have 0 project admins"],
  },

  projectMods: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
  ],
  projectClients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
  ],
  kanbanBoard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "kanbanBoards",
  },
  channels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "channels",
    },
  ],
  private: {
    type: Boolean,
    required: true,
  },
  projectInvitationToken: String,
  projectInvitationTokenExpiryDate: Date,
});

const Project =
  mongoose.models.projects || mongoose.model("projects", projectSchema);

export default Project;
