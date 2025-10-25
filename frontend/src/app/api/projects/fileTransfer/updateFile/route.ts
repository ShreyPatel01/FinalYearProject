import ProjectFolder from "@/src/models/folderModel";
import ProjectFile from "@/src/models/filesModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { S3 } from "aws-sdk";
import User from "@/src/models/userModels";

connect();

const s3Bucket = new S3({
  region: `eu-west-2`,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userID = formData.get("userID");
    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json(
        { error: "Couldn't find user", invalidUserID: userID },
        { status: 404 }
      );
    }
    const fileID = formData.get("originalFileID");
    //Finding file in database
    const file = await ProjectFile.findOne({ _id: fileID });
    if (!file) {
      return NextResponse.json(
        { error: "Couldn't find file", invalidFileID: fileID },
        { status: 404 }
      );
    }
    //Getting original file name
    const oldFileName = file.fileName;
    const fileDirectory = formData.get("currentDirectory");
    console.log(fileDirectory);
  
    //Deleting original file
    const s3DeleteOriginalFileParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `${fileDirectory}${oldFileName}`,
    };
  
    await s3Bucket.deleteObject(s3DeleteOriginalFileParams).promise();
  
    const newFile = formData.get("newFile");
    let newFileName = "";
    if (newFile instanceof File) {
      newFileName = newFile.name;
    } else {
      return NextResponse.json(
        { error: "Item uploaded was not a file", invalidItem: newFile },
        { status: 422 }
      );
    }
  
    //Converting file to buffer
    const fileBuffer = await newFile
      .arrayBuffer()
      .then((buffer) => Buffer.from(buffer));
  
    const newItemKey = `${fileDirectory}${newFileName}`;
  
    //Creating replacement file
    const s3CreateNewFileParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: newItemKey,
      Body: fileBuffer,
    };
    await s3Bucket.putObject(s3CreateNewFileParams).promise();
  
    //Updating file object in database
    await ProjectFile.findOneAndUpdate(
      { _id: file._id },
      { $set: { fileName: newFileName, lastModifiedBy: user._id } }
    );
  
    return NextResponse.json({ success: true, message: "Updated the file" });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({error:error.message},{status:500});
  }
}
