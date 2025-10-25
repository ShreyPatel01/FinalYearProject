import { mongoose } from "mongoose";

const messageSchema = new mongoose.Schema({
    messageTime: {
        type: Date,
        required: true,
        unique: false,
    },
    messageContent: {
        type: String,
        required: true,
        unique: false,
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    edited: {
        type: Boolean,
        required: true,
        unique: false
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "channels"
    },
    projectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    }
});

const ChannelMessage = mongoose.models.channelmessages || mongoose.model("channelmessages", messageSchema);

export default ChannelMessage;