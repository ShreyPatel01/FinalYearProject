import {mongoose} from "mongoose";

const folderSchema = new mongoose.Schema({
    folderName: {
        type: String,
        required: true,
        unique: true,
    },
    lastModified: {
        type: Date,
        required: true,
        unique: false,
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    projectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects"
    }
});

const ProjectFolder = mongoose.models.projectfolders || mongoose.model("projectfolders", folderSchema);

export default ProjectFolder;