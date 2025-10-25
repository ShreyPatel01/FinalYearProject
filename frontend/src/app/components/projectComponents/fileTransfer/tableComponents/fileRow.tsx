"use client";
import { TableCell } from "@/components/ui/table";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { FileIcon } from "react-file-icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";

import React, { useEffect, useState } from "react";
import RenameItemModal from "../modals/renameItemModal";
import DeleteItemModal from "../modals/deleteItemModal";
import UpdateFileModal from "../modals/replaceFileModal";
import { projectRoles } from "@/src/models/enums/userRoles";

interface FileRowProps {
  id: string | undefined;
  name: string | undefined;
  type: string | undefined;
  size: string | undefined;
  dateMod: string | undefined;
  modBy: string | undefined;
  path: string | undefined;
  originalDirectory: string | null;
  onChange: () => void;
  role: string;
}

const FileRow: React.FC<FileRowProps> = ({
  id,
  name,
  type,
  size,
  dateMod,
  modBy,
  path,
  originalDirectory,
  onChange,
  role,
}) => {
  const [modalType, setModalType] = useState<string | null>(null);

  useEffect(() => {
    if (modalType === "rename") {
      const element = document.getElementById(
        "renameItemModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    }
    if (modalType === "delete") {
      const element = document.getElementById(
        "deleteItemModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    }
    if (modalType === "update") {
      const element = document.getElementById(
        "updateFileModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    }
  }, [modalType]);

  const closeModal = () => {
    setModalType(null);
    onChange();
  };
  return (
    <>
      {modalType === "rename" &&
        id !== undefined &&
        originalDirectory !== null &&
        type !== undefined &&
        name !== undefined && (
          <RenameItemModal
            originalName={name}
            itemID={id}
            type={type}
            onClose={closeModal}
            originalDirectory={originalDirectory}
          />
        )}
      {modalType === "delete" &&
        name !== undefined &&
        id !== undefined &&
        originalDirectory !== null &&
        type !== undefined &&
        role === projectRoles.ADMIN && (
          <DeleteItemModal
            itemName={name}
            itemID={id}
            itemType={type}
            itemDirectory={originalDirectory}
            onClose={closeModal}
          />
        )}
      {modalType === "update" &&
        name !== undefined &&
        id !== undefined &&
        originalDirectory !== null && (
          <UpdateFileModal
            onClose={closeModal}
            currentDirectory={originalDirectory}
            originalName={name}
            originalFileID={id}
          />
        )}
      {/* Icon for Type Field */}
      {type !== undefined && (
        <TableCell>
          {/* Change so icon has colours */}
          <div style={{ width: "45px", height: "45px" }}>
            <FileIcon extension={type} />
          </div>
        </TableCell>
      )}
      {/* Name Field */}
      <TableCell>{name}</TableCell>
      {/* Size Field */}
      <TableCell>{size}</TableCell>
      {/* Date Modified Field */}
      <TableCell>{dateMod}</TableCell>
      {/* Modified By Field */}
      <TableCell>{modBy}</TableCell>
      {/* Actions field */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="btn btn-ghost">
            <EllipsisHorizontalIcon className="w-4 h-4 text-black" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-50 rounded-md text-black p-1 w-fit flex flex-col">
            {/* Download Action */}
            <DropdownMenuItem
              onClick={() => {
                window.open(path, "_blank");
              }}
              className="hover:text-blue-500 hover:underline btn btn-ghost w-full"
            >
              Download
            </DropdownMenuItem>
            {/* Rename Action */}
            <DropdownMenuItem
              className="hover:text-blue-500 hover:underline btn btn-ghost w-full"
              onClick={() => setModalType("rename")}
            >
              Rename
            </DropdownMenuItem>
            {/* Update File Action */}
            <DropdownMenuItem
              className="hover:text-blue-500 hover:underline btn btn-ghost w-full"
              onClick={() => setModalType("update")}
            >
              Update File
            </DropdownMenuItem>
            {role === projectRoles.ADMIN && (
              <DropdownMenuItem
                className="hover:text-blue-500 hover:underline btn btn-ghost w-full"
                onClick={() => setModalType("delete")}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </>
  );
};

export default FileRow;
