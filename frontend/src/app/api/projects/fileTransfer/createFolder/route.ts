import { NextRequest, NextResponse } from "next/server";
import { S3 } from "aws-sdk";
import ProjectFolder from "@/src/models/folderModel";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

const s3Bucket = new S3({
  region: process.env.AWS_BUCKET_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const projectID = requestBody.projectID;
    const folderName = requestBody.folderName;
    const userID = requestBody.userID;
    const currentDirectory = requestBody.currentDirectory.toString();
    console.log(`projectID: ${projectID}, folderName: ${folderName}, userID: ${userID}, currentDirectory: ${currentDirectory}`);
  
    let errors = [];
  
    //Checking to see if folderName doesn't have a value
    if (folderName.trim().length === 0) {
      errors.push("The folder needs a name");
    }
  
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }
  
    //Getting the current date
    const currentDate = new Date();
  
    //Creating new DB object for folder
    const newFolder = new ProjectFolder({
      folderName: folderName,
      lastModified: currentDate,
      lastModifiedBy: userID,
      projectID: projectID,
    });
    const savedFolder = await newFolder.save();
    console.log(savedFolder)

    const newS3Directory = `${currentDirectory}${folderName}/`
  
    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: newS3Directory,
      Body: "",
    };
    const s3SavedFolder = await s3Bucket.putObject(s3Params).promise();
    console.log(s3SavedFolder)
  
    return NextResponse.json({
      success: true,
      status: 201,
      message: "Folder has been created",
    });
  } catch (error:any) {
    console.error(error)
    return NextResponse.json({error: error.message, status:500})
  }
}
