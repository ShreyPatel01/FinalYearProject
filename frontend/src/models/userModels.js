import { mongoose } from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your first name"],
    unique: false,
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  userTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
    },
  ],
  channels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "channels"
    }
  ],
  type: {
    type: String,
    required: true,
    unique: false
  },
  verifyToken: String,
  verifyTokenExpiryDate: Date,
  resetPasswordToken: String,
  resetPasswordExpiryDate: Date,
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;
