import ProjectFolder from "@/src/models/folderModel";
import ProjectFile from "@/src/models/filesModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { S3 } from "aws-sdk";

connect();

const s3Bucket = new S3({
  region: `eu-west-2`,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

export async function PUT(request: NextRequest) {
  try {
    let errors = [];
    const requestBody = await request.json();
    const newItemName = requestBody.newName;
    const originalItemName = requestBody.originalName;
    const itemID = requestBody.itemID;
    const itemType = requestBody.type;
    const userID = requestBody.userID;
    const directory = requestBody.originalDirectory;

    console.log(
      `s3 bucket region: ${process.env.AWS_BUCKET_REGION}, s3 bucket name = ${process.env.AWS_BUCKET_NAM}`
    );

    console.log(
      `newItemName = ${newItemName}, originalItemName=${originalItemName}, itemID=${itemID}, itemType=${itemType} userID=${userID} originalDirectory=${directory}`
    );

    if (
      newItemName === undefined ||
      newItemName.trim().length === 0 ||
      newItemName === originalItemName
    ) {
      errors.push(`Please enter a new name`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const currentDate = new Date();

    if (itemType === "Folder") {
      console.log(`itemType = ${itemType}`);
      const updatedFolder = await ProjectFolder.findOneAndUpdate(
        { _id: itemID },
        {
          $set: {
            folderName: newItemName,
            lastModified: currentDate,
            lastModifiedBy: userID,
          },
        }
      );

      console.log(`the folder ${originalItemName} was updated`);
      console.log(updatedFolder);
      console.log("====================================");

      //Creating a new folder
      const s3NewFolderParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `${directory}${newItemName}/`,
        Body: "",
      };
      await s3Bucket.putObject(s3NewFolderParams).promise();

      //Getting the contents of the original folder
      const objectsInFolder = await listObjectsInFolder(
        process.env.AWS_BUCKET_NAME!,
        `${directory}${originalItemName}/`
      );

      //Copying contents of original folder and pasting in new folder
      for (const object of objectsInFolder) {
        const originKey = object.Key;
        const destinationKey = originKey?.replace(
          `${originalItemName}/`,
          `${newItemName}/`
        );

        console.log(`originKey = ${originKey}`);
        console.log(`destinationKey = ${destinationKey}`);
        console.log("========================================");

        if (originKey !== undefined && destinationKey !== undefined) {
          const s3CopyOriginalFileParams = {
            CopySource: `${process.env.AWS_BUCKET_NAME!}/${originKey}`,
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: destinationKey,
          };

          try {
            await s3Bucket.copyObject(s3CopyOriginalFileParams).promise();
          } catch (error: any) {
            console.error(`error copying object ${originKey}: `, error);
          }

          //Deleting contents of old folder after being copied to new folder
          const s3DeleteOriginalFileParams = {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: originKey,
          };
          try {
            await s3Bucket.deleteObject(s3DeleteOriginalFileParams).promise();
          } catch (err) {
            console.error(`error deleting object ${originKey}: `, err);
          }
        }
      }
      //Deleting empty original folder
      const s3DeleteOriginalFolderParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `${directory}${originalItemName}/`,
      };
      try {
        await s3Bucket.deleteObject(s3DeleteOriginalFolderParams).promise();
        console.log(
          `deleted the original folder ${directory}${originalItemName}/`
        );
      } catch (err) {
        console.error(
          `error deleteing folder ${directory}${originalItemName}: `,
          err
        );
      }
    } else {
      const updatedFile = await ProjectFile.findOneAndUpdate({_id: itemID}, {$set: {
        fileName: newItemName,
        lastModifiedBy: userID,
      }});
      
      //Creating params to copy file to directory
      const s3CopyFileParams = {
        CopySource: `${process.env.AWS_BUCKET_NAME!}/${directory}${originalItemName}`,
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `${directory}${newItemName}`
      }

      try {
        await s3Bucket.copyObject(s3CopyFileParams).promise();
      } catch (error:any) {
        console.error(`Error copying object: `,error)
      }

      //Creating params to delete original file
      const s3DeleteOriginalFileParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `${directory}${originalItemName}`
      }

      //Deleting file
      try {
        await s3Bucket.deleteObject(s3DeleteOriginalFileParams).promise();
      } catch (error) {
        console.error(`Error deleting original file: `,error)
      }
    }
    return NextResponse.json({
      success: true,
      newItemName: newItemName,
      originalItemName: originalItemName,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, status: 500 });
  }
}

async function listObjectsInFolder(
  bucketName: string,
  folderPath: string
): Promise<S3.ObjectList> {
  console.log(`folderPath = ${folderPath}`);
  const params = {
    Bucket: bucketName,
    Prefix: folderPath,
  };

  try {
    const data = await s3Bucket.listObjects(params).promise();
    // The Contents property contains the list of objects
    console.log(data.Contents);
    console.log("=======================================");
    return data.Contents || [];
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error listing objects in folder:", error);
    // Return an empty array to ensure the function always returns a value of the correct type
    return [];
  }
}
