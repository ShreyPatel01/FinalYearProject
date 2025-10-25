import {connect} from "@/src/dbConfig/dbConfig"
import { NextRequest, NextResponse } from "next/server"

connect();

export async function POST(request: NextRequest){
    try{
        let errors = [];
        const requestBody = await request.json();
        const{field, project, members} = requestBody;
        const projectDetails = [
            field,
            project,
            members
        ];

        projectDetails.forEach((element: string, index:number) => {
            const labelMessages= [
                "Please choose a field your project fits in",
                "Please chose a project",
                "An unexpeted error occurred"
            ];
            
            if(element === "" || element == null){
                const labelMessage = labelMessages[index];
                errors.push(labelMessage);
            }

            if(errors.length > 0){
                return NextResponse.json({errors}, {status:400});
            }
        });
        return NextResponse.json({
            members:members,
            success:true
        })
    }catch(error:any){
        return NextResponse.json({error: error.message}, {status:500});
    }
}