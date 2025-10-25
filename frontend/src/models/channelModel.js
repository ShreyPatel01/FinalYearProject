import { mongoose } from "mongoose";

const channelMemberSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

const channelSchema = new mongoose.Schema({
  channelName: {
    type: String,
    required: true,
    unique: false,
  },
  channelMembers: [{
    type: channelMemberSchema,
    required: true
  }],
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
    },
  ],
  createdAt: {
    type: Date,
    required: true,
    unique: false,
  },
  updatedAt: {
    type: Date,
    required: true,
    unique: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  channelAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  channelModerators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  channelClient: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  private: {
    type: Boolean,
    required: true,
    unique: false,
  },
});

const Channel =
  mongoose.models.channels || mongoose.model("channels", channelSchema);

export default Channel;
