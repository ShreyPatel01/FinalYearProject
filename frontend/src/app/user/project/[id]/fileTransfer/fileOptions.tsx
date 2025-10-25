"use client";
import {
  ArrowUpOnSquareStackIcon,
  FolderPlusIcon,
} from "@heroicons/react/16/solid";
import React, { useEffect, useState } from "react";
import CreateFolderModal from "../../../../components/projectComponents/fileTransfer/modals/createFolderModal";
import UploadFilesModal from "../../../../components/projectComponents/fileTransfer/modals/uploadFilesModal";

interface FileTransferOptionsProps {
  currentDirectory: string;
  projectID: string;
  onFileSystemChange: (currentPath: string) => void;
}

const FileTransferOptions: React.FC<FileTransferOptionsProps> = ({
  currentDirectory,
  projectID,
  onFileSystemChange
}) => {
  const [modalType, setModalType] = useState<string | null>(null);
  

  useEffect(() => {
    switch (modalType) {
      case "createFolder":
        const createFolderElement = document.getElementById(
          "createFolderModal"
        ) as HTMLDialogElement;
        if (createFolderElement) {
          setTimeout(() => {
            createFolderElement.showModal();
          }, 50);
        }
      case "uploadFiles":
        const uploadFilesElement = document.getElementById(
          "uploadFilesModal"
        ) as HTMLDialogElement;
        if (uploadFilesElement) {
          setTimeout(() => {
            uploadFilesElement.showModal();
          }, 50);
        }
    }
  }, [modalType]);

  const closeModal = () => {
    setModalType(null);
    onFileSystemChange(currentDirectory);
  };

  return (
    <>
      {modalType === "createFolder" && projectID !== null && (
        <CreateFolderModal onClose={closeModal} projectID={projectID} currentDirectory={currentDirectory} />
      )}
      {modalType === "uploadFiles" && projectID !== null && (
        <UploadFilesModal onClose={closeModal} projectID={projectID} currentDirectory={currentDirectory}/>
      )}
      <div className="flex flex-col h-fit w-fit p-2 bg-slate-50 rounded-lg">
        <div className="px-4">
          <button
            className="btn btn-ghost p-2 text-black mt-2 w-full justify-normal"
            onClick={() => {
              setModalType("createFolder");
            }}
          >
            <FolderPlusIcon className="w-4 h-4 text-black" />
            Create A New Folder
          </button>
          <button
            className="btn btn-ghost p-2 text-black mt-2 w-full justify-normal"
            onClick={() => {
              setModalType("uploadFiles");
            }}
          >
            <ArrowUpOnSquareStackIcon className="w-4 h-4 text-black" />
            Upload Files
          </button>
        </div>
      </div>
    </>
  );
};

export default FileTransferOptions;