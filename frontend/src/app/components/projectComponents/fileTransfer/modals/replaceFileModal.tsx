"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpTrayIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import GetUserID from "@/src/helpers/getUserID";
import axios from "axios";

interface UpdateFileModalProps {
  onClose: () => void;
  currentDirectory: string;
  originalName: string;
  originalFileID: string;
}

const UpdateFileModal: React.FC<UpdateFileModalProps> = ({
  onClose,
  currentDirectory,
  originalName,
  originalFileID,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileDetails, setFileDetails] = useState<
    Array<{ name: string; file: File }>
  >([]);
  const userID = GetUserID();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    // Add the event listener when the component mounts
    document.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener
    );
    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener
      );
    };
  }, [onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]; // Get the first file
      const convertedFileSizeMB = file.size / (1024 * 1024);
      if (convertedFileSizeMB > 20) {
        toast.error(`${file.name} is too big to upload`);
        return;
      }
      setSelectedFile(file);
      setFileDetails([{ name: file.name, file }]);
    }
  };

  //Formats the file type
  const formatFileType = (fileName: string) => {
    const fileType = fileName.split(".")[1];
    return fileType;
  };

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

  //Updates file in S3 bucket and object in MongoDB
  const updateFile = async () => {
    try {
      const formData = new FormData();
      formData.append(`newFile`, fileDetails[0].file, fileDetails[0].name);
      formData.append("currentDirectory", currentDirectory);
      formData.append("originalFileID", originalFileID);
      formData.append("userID", userID);
      const response = await axios.put(
        `/api/projects/fileTransfer/updateFile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if(response.data.success){
        toast.success(`Successfully updated ${originalName}`);
        onClose();
      }
    } catch (error:any) {
      console.error(error);
      if(error.response.data.error){
        toast.error(error.response.data.error);
      } else {
        toast.error(`An unknown error occurred while updating the file`);
      }
    }
  };

  return (
    <>
      <dialog id="updateFileModal" className="modal">
        <div className="modal-box bg-slate-50 max-w-3xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-black"
              onClick={() => {
                setTimeout(() => {
                  onClose();
                }, 50);
              }}
            >
              ✕
            </button>
          </form>
          <h1 className="w-full text-center text-2xl font-bold">
            Update The File {originalName}
          </h1>
          <div
            className={`flex items-center justify-center w-full mt-6  ${
              isDragging
                ? "bg-blue-600 rounded-lg"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
            style={{
              transition: "background-color 0.3s ease", // Add transition for background-color
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              if (event.dataTransfer.files.length > 0) {
                handleFileChange({
                  target: { files: event.dataTransfer.files },
                } as React.ChangeEvent<HTMLInputElement>);
              }
              setIsDragging(false);
            }}
          >
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer `}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {!isDragging && (
                  <ArrowUpTrayIcon className="w-8 h-8 mb-4 text-gray-500" />
                )}
                <p
                  className={`mb-2 text-sm dark:text-gray-400 ${
                    isDragging ? "text-white" : "text-gray-500"
                  }`}
                >
                  {isDragging ? (
                    <>
                      <span className="font-semibold">Drop</span> the files here
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </>
                  )}
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {/* Table of selectedFile details */}
          {selectedFile !== undefined && (
            <>
              <div className="mt-5 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">File Name</TableHead>
                      <TableHead className="w-[300px]">File Type</TableHead>
                      <TableHead className="w-[300px]">File Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fileDetails.map((fileDetail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <span>{fileDetail.name}</span>
                        </TableCell>
                        <TableCell>
                          {formatFileType(fileDetail.file.name)}
                        </TableCell>
                        <TableCell>
                          {formatFileSize(fileDetail.file.size)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Update and Cancel Buttons */}
              <div className="flex w-full justify-evenly mt-8">
                <button
                  className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
                  onClick={updateFile}
                >
                  <PlusCircleIcon className="w-4 h-4 text-white" />
                  Update File
                </button>
                <button
                  className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white"
                  onClick={() => {
                    setTimeout(() => {
                      onClose();
                    }, 50);
                  }}
                >
                  <XCircleIcon className="w-4 h-4 text-white" />
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
};

export default UpdateFileModal;
