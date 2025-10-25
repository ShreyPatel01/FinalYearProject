import {mongoose} from 'mongoose';

const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        unique: true
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

const ProjectFile = mongoose.models.projectfiles || mongoose.model("projectfiles", fileSchema);

export default ProjectFile;