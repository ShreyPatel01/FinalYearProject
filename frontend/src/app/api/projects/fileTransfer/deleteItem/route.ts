import ProjectFolder from "@/src/models/folderModel";
import ProjectFile from "@/src/models/filesModel";
import { S3 } from "aws-sdk";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";

connect();

const s3Bucket = new S3({
  region: `eu-west-2`,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const itemName = requestBody.itemName;
    const itemID = requestBody.itemID;
    const itemDirectory = requestBody.itemDirectory;
    const itemType = requestBody.itemType;

    if (itemType === "Folder") {
      await ProjectFolder.findOneAndDelete({ _id: itemID });
      const s3DeleteFolderParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: itemDirectory,
      };
      try {
        await s3Bucket.deleteObject(s3DeleteFolderParams).promise();
      } catch (err: any) {
        console.error(`error deleting object ${itemName}: `, err);
        return NextResponse.json({ error: err.message, status: err.status });
      }
    } else {
      await ProjectFile.findOneAndDelete({ _id: itemID });
      const s3DeleteFileParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `${itemDirectory}${itemName}`,
      };
      try {
        await s3Bucket.deleteObject(s3DeleteFileParams).promise();
      } catch (err: any) {
        console.error(`error deleting object ${itemName}: `, err);
        return NextResponse.json({ error: err.message, status: err.status });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
