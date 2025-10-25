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

interface UploadFilesModalProps {
  onClose: () => void;
  projectID: string;
  currentDirectory: string;
}

const UploadFilesModal: React.FC<UploadFilesModalProps> = ({
  onClose,
  projectID,
  currentDirectory,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
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

  //Store the details of the files that the user selects and maps them to fileDetails
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const validFiles = newFiles.filter((file) => {
        const convertedFileSizeMB = file.size / (1024 * 1024);
        if (convertedFileSizeMB > 20) {
          toast.error(`${file.name} is too big to upload`);
          return false;
        }
        return true;
      });
      setSelectedFiles(validFiles);
      // Update fileDetails with the new files
      console.log(validFiles)
      setFileDetails(validFiles.map((file) => ({ name: file.name, file })));
    }
  };

  //Starts the process of the user changing the file name
  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditingValue(fileDetails[index].name);
  };

  //Sets fileDetails[index].name to the value inputted by the user
  const handleEditEnd = () => {
    if (editingIndex !== null) {
      // Update the name in the fileDetails array
      const updatedFileDetails = [...fileDetails];
      updatedFileDetails[editingIndex].name =
        editingValue +
        `.${formatFileType(fileDetails[editingIndex].file.name)}`;
      setFileDetails(updatedFileDetails);
    }
    setEditingIndex(null);
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

  //Uploads files to S3 bucket and creates object in MongoDB
  const uploadFiles = async () => {
    try {
      const formData = new FormData();
      for (let i = 0; i < fileDetails.length; i++) {
        formData.append(`file${i}`, fileDetails[i].file, fileDetails[i].name);
      }
      formData.append("projectID", projectID);
      formData.append("userID", userID);
      formData.append("currentDirectory", currentDirectory)
      const file0 = formData.get("file0");
      console.log(file0);
      const response = await axios.put(
        `/api/projects/fileTransfer/uploadFiles`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        closeDialogOnCreation();
        toast.success(
          `${
            response.data.fileCount === 1
              ? "Your file was uploaded successfully"
              : "Your files were uploaded successfuly"
          }`
        );
      }
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        //Gets error message from response
        const errorMessages = error.response.data && error.response.data.errors;
        //Checks if errorMessages has multiple objects
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((message) => {
            toast.error(message);
          });
        } else {
          toast.error(errorMessages);
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  //For when the file is created
  const closeDialogOnCreation = () => {
    const dialog = document.getElementById(
      "uploadFilesModal"
    ) as HTMLDialogElement;
    if (dialog) {
      onClose();
    }
  };

  return (
    <main>
      <dialog id="uploadFilesModal" className="modal">
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
            Upload Files
          </h1>
          <p className="w-full text-center mt-2 px-14">
            Upload files to the directory by either by clicking the area below
            or dragging the files into the highlighted area
          </p>
          {/* File Upload Input Form */}
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
                multiple
                onChange={handleFileChange}
              />
            </label>
          </div>
          {/* List of files chosen in table format */}
          {selectedFiles.length > 0 && (
            <>
              <p className="mt-5 text-sm text-center">
                You can edit the names of the files by clicking on the left cell
                for each file.
              </p>
              <div className="mt-5 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">File Name</TableHead>
                      <TableHead className="w-[300px]">Original File Name</TableHead>
                      <TableHead className="w-[300px]">File Type</TableHead>
                      <TableHead className="w-[300px]">File Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fileDetails.map((fileDetail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {editingIndex === index ? (
                            <input
                              type="text"
                              className="bg-slate-50 text-black"
                              value={editingValue ?? ""}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={handleEditEnd}
                              autoFocus
                            />
                          ) : (
                            <span onClick={() => handleEditStart(index)}>
                              {fileDetail.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{fileDetail.file.name}</TableCell>
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
              {/* Submit and Cancel Buttons */}
              <div className="flex w-full justify-evenly mt-8">
                <button
                  className="btn bg-blue-600 border-none hover:bg-blue-700 hover:border-none text-white"
                  onClick={uploadFiles}
                >
                  <PlusCircleIcon className="w-4 h-4 text-white" />
                  {selectedFiles.length > 0 ? "Create Files" : "Create File"}
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
    </main>
  );
};

export default UploadFilesModal;
