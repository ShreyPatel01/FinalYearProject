import { mongoose } from 'mongoose';

const issueSchema = new mongoose.Schema({
    issueName: {
        type: String,
        required: true,
        unique: false,
    },
    issueDesc: {
        type: String,
        required: true,
        unique: false,
    },
    creationDate: {
        type: Date,
        required: true,
        unique: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    type: {
        type: String,
        required: true,
        unique: false,
    },
    status: {
        type: String,
        required: true,
        unique: false,
    },
    taskID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tasks"
    },
    projectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects"
    }
});

const TicketIssue = mongoose.models.ticketissues || mongoose.model("ticketissues", issueSchema);

export default TicketIssue;