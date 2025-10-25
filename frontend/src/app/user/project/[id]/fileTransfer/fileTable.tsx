"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FileRow from "@/src/app/components/projectComponents/fileTransfer/tableComponents/fileRow";
import FolderRow from "@/src/app/components/projectComponents/fileTransfer/tableComponents/folderRow";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FileTransferOptions from "./fileOptions";
import { ArrowPathIcon, ChevronDoubleUpIcon } from "@heroicons/react/16/solid";
import { projectRoles } from "@/src/models/enums/userRoles";

interface FolderOrFile {
  id: string | undefined;
  name: string | undefined;
  type: string | undefined;
  size: string | undefined;
  dateMod: string | undefined;
  modBy: string | undefined;
  path: string | undefined;
}

export default function FileTable() {
  const [projectID, setProjectID] = useState<string | null>(null);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [role, setRole] = useState<string>(projectRoles.USER);
  const [foldersAndFilesList, setFoldersAndFilesList] = useState<
    FolderOrFile[] | null
  >(null);
  const [path, setPath] = useState<string[]>([]);

  //Getting the projectID
  useEffect(() => {
    if (typeof window !== undefined) {
      const idFromURL = window.location.pathname.split("/")[3];
      setProjectID(idFromURL);
    }
  }, []);

  //Gets the contents of the directory given
  const getCurrentDirectory = async (currentPath: string) => {
    const response = await axios.get(
      `/api/projects/fileTransfer/getCurrentDirectory`,
      { params: { directory: currentPath, projectID: projectID } }
    );
    if (response.data.success) {
      toast.success(`retrieved the folders and files from the directory`);
      console.log(response.data.foldersAndFiles);
      setFoldersAndFilesList(response.data.foldersAndFiles);
      setRole(response.data.role);
    }
  };

  useEffect(() => {
    if (projectID !== null) {
      console.log(`projectID = ${projectID}`);
      setCurrentDirectory(`projectFiles/${projectID}/`);
      getCurrentDirectory(`projectFiles/${projectID}/`);
    }
  }, [projectID]);

  const handleNewDirectory = (newDirectory: string) => {
    console.log(`currentDirectory changed to ${newDirectory}`);
    setCurrentDirectory(newDirectory);
    getCurrentDirectory(newDirectory);
    const directoryParts = newDirectory.split("/");
    const newDirectoryName = directoryParts[directoryParts.length - 2];
    setPath([...path, newDirectoryName]);
  };

  const handlePreviousDirectory = (currentDirectory: string) => {
    const currentPath = [...path];
    currentPath.pop();
    currentPath.length === 0 ? setPath([]) : setPath(currentPath);
    const currentDirectoryParts = currentDirectory.split("/");
    console.log(currentDirectoryParts);
    currentDirectoryParts.pop();
    currentDirectoryParts.pop();
    console.log(currentDirectoryParts);
    const newDirectory = `${currentDirectoryParts.join("/")}/`;
    setCurrentDirectory(newDirectory);
    getCurrentDirectory(newDirectory);
  };

  return (
    <div className="flex flex-row w-full">
      <div className="flex justify-start w-4/5 flex-col">
        <div className="flex flex-row w-full justify-between">
          {/* File path */}
          <div className="flex justify-start">
            <div className="breadcrumbs">
              <ul>
                <li>Home</li>
                {path.length > 0 && path.map((item) => <li>{item}</li>)}
              </ul>
            </div>
          </div>
          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (currentDirectory) {
                  getCurrentDirectory(currentDirectory);
                }
              }}
            >
              <ArrowPathIcon className="w-4 h-4 text-black" />
              Refresh
            </button>
          </div>
        </div>
        {/* Table of files */}
        <div className="w-full mt-4">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">File Type</TableHead>
                <TableHead className="w-[300px]">File Name</TableHead>
                <TableHead className="w-[300px]">File Size</TableHead>
                <TableHead className="w-[300px]">Date Modified</TableHead>
                <TableHead className="w-[300px]">Last Modified By</TableHead>
                <TableHead className="w-[300px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {path.length > 0 && (
                <TableRow
                  className="h-[100px]"
                  onClick={() => {
                    if (currentDirectory) {
                      handlePreviousDirectory(currentDirectory);
                    }
                  }}
                >
                  <TableCell>
                    <ChevronDoubleUpIcon className="w-10 h-10" />
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
              {foldersAndFilesList !== null && (
                <>
                  {/* Mapping Folders */}
                  {foldersAndFilesList
                    .filter((item) => item.type === "Folder")
                    .map((item) => (
                      <TableRow key={item.id} className="h-[100px]">
                        <FolderRow
                          id={item.id}
                          name={item.name}
                          size={item.size}
                          dateMod={item.dateMod}
                          modBy={item.modBy}
                          path={item.path}
                          onDirectoryChange={handleNewDirectory}
                          originalDirectory={currentDirectory}
                          role={role}
                        />
                      </TableRow>
                    ))}
                  {/* Mapping files */}
                  {foldersAndFilesList
                    .filter((item) => item.type !== "Folder")
                    .map((item) => (
                      <TableRow key={item.id} className="h-[100px]">
                        <FileRow
                          id={item.id}
                          name={item.name}
                          type={item.type}
                          size={item.size}
                          dateMod={item.dateMod}
                          modBy={item.modBy}
                          path={item.path}
                          originalDirectory={currentDirectory}
                          role={role}
                          onChange={() => {
                            if (currentDirectory) {
                              getCurrentDirectory(currentDirectory);
                            }
                          }}
                        />
                      </TableRow>
                    ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* File Options */}
      <div className="flex w-1/5 justify-end mt-14 ml-6">
        {currentDirectory !== null && projectID !== null && (
          <FileTransferOptions
            currentDirectory={currentDirectory}
            projectID={projectID}
            onFileSystemChange={getCurrentDirectory}
          />
        )}
      </div>
    </div>
  );
}
