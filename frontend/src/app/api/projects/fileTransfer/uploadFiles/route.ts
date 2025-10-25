import { NextRequest, NextResponse } from "next/server";
import { S3 } from "aws-sdk";
import { connect } from "@/src/dbConfig/dbConfig";
import ProjectFile from "@/src/models/filesModel";

connect();

const s3Bucket = new S3({
  region: process.env.AWS_BUCKET_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});


export async function PUT(request: NextRequest) {
  try {
    let errors = [];
    let emptyFileNameCount = 0;
    let emptyFileTypeCount = 0;
    let uploadedFilesCount = 0;
    let validFileList = [];

    const FormData = await request.formData();
    //Getting the projectID and the userID from data
    const projectID = FormData.get("projectID");
    const userID = FormData.get("userID");
    const currentDirectory = FormData.get("currentDirectory")?.toString();

    for (const [name, value] of Array.from(FormData.entries())) {
      if (name.startsWith("file") && value instanceof File) {
        if (value.name === "") {
          emptyFileNameCount++;
          continue;
        }
        if (value.type === "") {
          emptyFileTypeCount++;
          continue;
        }
        validFileList.push(value);
      }
    }

    console.log(validFileList);
    console.log(`validFilesList length = ${validFileList.length}`)

    //Pushing errors if they exist
    if (emptyFileNameCount > 0) {
      errors.push("One of your files needs a name");
    }
    if (emptyFileTypeCount > 0) {
      errors.push("One of your files has an unsupported type");
    }

    //Returning early if there's errors
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    for (let i = 0; i < validFileList.length; i++) {
      //Creating new DB object for each file
      const newFile = new ProjectFile({
        fileName: validFileList[i].name,
        lastModifiedBy: userID,
        projectID: projectID,
      });
      const savedFile = await newFile.save();
      console.log(savedFile)
      console.log("=====================================")

      //Converting file to Buffer
      const fileBuffer = await validFileList[i].arrayBuffer().then(buffer => Buffer.from(buffer));

      if(currentDirectory) {
        const s3FilePath = `${currentDirectory}${validFileList[i].name}`
        //Creating s3 params
        const s3Params = {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: s3FilePath,
          Body: fileBuffer,
        };
        await s3Bucket.putObject(s3Params).promise();
        uploadedFilesCount++;
      }
    }

    return NextResponse.json({
      success: true,
      status: 201,
      message:
        uploadedFilesCount > 1
          ? "Files have been uploaded"
          : "File has been uploaded",
      fileCount: uploadedFilesCount,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}

