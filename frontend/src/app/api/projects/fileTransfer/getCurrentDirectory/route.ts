import ProjectFile from "@/src/models/filesModel";
import ProjectFolder from "@/src/models/folderModel";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import { S3 } from "aws-sdk";
import { format } from "date-fns";
import User from "@/src/models/userModels";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";
import { projectRoles } from "@/src/models/enums/userRoles";
import Project from "@/src/models/projectModel";

connect();

const s3Bucket = new S3({
  region: process.env.AWS_BUCKET_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

//Formats the file size so it's in a readable format
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} Bytes`;
  } else if (size >= 1024 && size <= 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
};

interface FolderOrFile {
  name: string | undefined;
  type: string | undefined;
  size: string | undefined;
  dateMod: string | undefined;
  modBy: string | undefined;
  path: string | undefined;
}

export async function GET(request: NextRequest) {
  try {
    let foldersAndFilesList: FolderOrFile[] = [];
    const queryParams = request.nextUrl.searchParams;
    const directory = queryParams.get("directory");
    const projectID = queryParams.get("projectID");
    const project = await Project.findOne({ _id: projectID });

    if (directory && projectID) {
      //Setting the params for the S3 bucket
      const s3Params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Prefix: directory,
        Delimiter: "/",
      };

      const data = await s3Bucket.listObjects(s3Params).promise();
      console.log(data);
      const filteredContents = data.Contents?.filter(
        (item) => item.Key !== directory
      );
      const folders = data.CommonPrefixes?.map((prefix) => prefix.Prefix);
      //Appending folders to foldersAndFiles array
      if (folders) {
        await Promise.all(
          folders.map(async (item) => {
            let folderName, folderID, formattedDateModified, userFullName;
            const itemParts = item?.toString().split("/");
            if (itemParts) {
              folderName = itemParts[itemParts.length - 2];
            }
            const type = "Folder";
            //Getting date folder was last modified and by who
            const folder = await ProjectFolder.findOne({
              folderName: folderName,
              projectID: projectID,
            });
            const size = "N/A";
            if (folder) {
              //Getting folderID
              folderID = folder._id;

              //Getting date modified
              const dateModified = folder.lastModified;
              formattedDateModified = format(dateModified, "dd/MM/yyyy HH:mm");

              //Getting last modified by
              const userID = folder.lastModifiedBy;
              const user = await User.findOne({ _id: userID });
              if (user) {
                userFullName = `${user.firstName} ${user.lastName}`;
              }
            }
            const filePath = item?.toString();

            // console.log(`folderName = ${folderName}`);
            // console.log(`type = ${type}`);
            // console.log(`formattedDateModified = ${formattedDateModified}`);
            // console.log(`userFullName = ${userFullName}`);
            // console.log(`filePath = ${filePath}`);

            const folderObject = {
              id: folderID,
              name: folderName,
              type: type,
              size: size,
              dateMod: formattedDateModified,
              modBy: userFullName,
              path: filePath,
            };
            foldersAndFilesList.push(folderObject);
          })
        );
      }
      //Appending files to foldersAndFilesArray
      if (filteredContents) {
        await Promise.all(
          filteredContents.map(async (item) => {
            const fileName = item.Key?.toString().split("/").pop();
            const fileType = fileName?.split(".")[1];
            let fileID, formattedLastModifiedDate, formattedFileSize;
            if (item.LastModified) {
              formattedLastModifiedDate = format(
                item.LastModified.toString(),
                "dd/MM/yyyy HH:mm"
              );
            }
            if (item.Size) {
              formattedFileSize = formatFileSize(item.Size);
            }

            const projectFile = await ProjectFile.findOne({ fileName });
            let lastModifiedBy = "";
            if (projectFile) {
              fileID = projectFile._id;
              const user = await User.findOne({
                _id: projectFile.lastModifiedBy,
              });
              if (user) {
                lastModifiedBy = `${user.firstName} ${user.lastName}`;
              }
            }

            //Getting the S3 URL for the item
            const s3Params = {
              Bucket: process.env.AWS_BUCKET_NAME!,
              Key: item.Key,
              Expires: 60 * 60,
            };
            const s3URL = s3Bucket.getSignedUrl("getObject", s3Params);

            // console.log(`fileName = ${fileName}`);
            // console.log(`fileType = ${fileType}`);
            // console.log(
            //   `formattedLastModifiedDate = ${formattedLastModifiedDate}`
            // );
            // console.log(`formattedFileSize = ${formattedFileSize}`);
            // console.log(`lastModifiedBy = ${lastModifiedBy}`);
            // console.log(`s3URL = ${s3URL}`);
            // console.log(`===========================================`);
            const fileObject = {
              id: fileID,
              name: fileName,
              type: fileType,
              size: formattedFileSize,
              dateMod: formattedLastModifiedDate,
              modBy: lastModifiedBy,
              path: s3URL,
            };
            foldersAndFilesList.push(fileObject);
          })
        );
      }

      //Fetching role
      const userID = await RetrieveIDFromToken(request);
      let role = projectRoles.USER;
      if (project.projectAdmin.toString() === userID.toString()) {
        role = projectRoles.ADMIN;
      } else if (project.projectClients.includes(userID.toString())) {
        role = projectRoles.CLIENT;
      } else if (project.projectMods.includes(userID.toString())) {
        role = projectRoles.MOD;
      }

      return NextResponse.json({
        success: true,
        foldersAndFiles: foldersAndFilesList,
        role: role
      });
    } else {
      return NextResponse.json({
        error: "Directory not found",
        success: false,
        status: 404,
      });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
