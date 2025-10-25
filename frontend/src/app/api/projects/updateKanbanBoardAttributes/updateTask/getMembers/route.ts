import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Project from "@/src/models/projectModel";
import User from "@/src/models/userModels";

connect();

export async function GET(request: NextRequest){
    try {
        const URLParams = new URLSearchParams(new URL(request.url).search);
        const projectID = URLParams.get('projectID');
    
        let projectMembers = [];
        const project = await Project.findOne({_id: projectID});
        if(project){
            const projectMemberIDs = project.members;
            console.log("project member ids from backend: ",projectMemberIDs);
            for (let i=0; i<projectMemberIDs.length; i++){
                const projectMember = projectMemberIDs[i];
                const user = await User.findOne({_id: projectMember});
                projectMembers.push(user.username);
            }
        }
        console.log("members from backend: "+projectMembers)
    
        return NextResponse.json({
            message: "Sending list of members",
            members: projectMembers
        });
    } catch (error:any) {
        console.error("Something went wrong - getmembers backend: ",error);
        return NextResponse.json({error: error.message}, {status:500})
    }
}