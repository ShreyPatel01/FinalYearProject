"use client";
import React, { useEffect, useState } from "react";

import { TableCell } from "@/components/ui/table";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { FolderIcon } from "@heroicons/react/16/solid";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import RenameItemModal from "../modals/renameItemModal";
import { useRouter } from "next/navigation";
import DeleteItemModal from "../modals/deleteItemModal";
import { projectRoles } from "@/src/models/enums/userRoles";

interface FolderRowProps {
  id: string | undefined;
  name: string | undefined;
  size: string | undefined;
  dateMod: string | undefined;
  modBy: string | undefined;
  path: string | undefined;
  originalDirectory: string | null;
  onDirectoryChange: (newDirectory: string) => void;
  role: string;
}

const FolderRow: React.FC<FolderRowProps> = ({
  id,
  name,
  size,
  dateMod,
  modBy,
  path,
  originalDirectory,
  onDirectoryChange,
  role,
}) => {
  const [folderName, setFolderName] = useState<string | undefined>(name);
  const [modalType, setModalType] = useState<string | null>(null);
  const router = useRouter();

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
  }, [modalType]);

  const closeModal = () => {
    setModalType(null);
    router.refresh();
  };

  return (
    <>
      {modalType === "rename" &&
        id !== undefined &&
        originalDirectory !== null &&
        name !== undefined && (
          <RenameItemModal
            originalName={name}
            itemID={id}
            type="Folder"
            onClose={closeModal}
            originalDirectory={originalDirectory}
          />
        )}
      {modalType === "delete" &&
        name !== undefined &&
        id !== undefined &&
        path !== undefined &&
        role === projectRoles.ADMIN && (
          <DeleteItemModal
            itemName={name}
            itemID={id}
            itemType="Folder"
            itemDirectory={path}
            onClose={closeModal}
          />
        )}
      {/* Icon Field */}
      <TableCell>
        <FolderIcon className="w-10 h-10" />
      </TableCell>
      {/* Name Field */}
      <TableCell
        onClick={() => {
          onDirectoryChange(path || "");
        }}
      >
        <button className="hover:underline hover:text-blue-400">
          {folderName !== undefined ? folderName : name}
        </button>
      </TableCell>
      {/* Size Field */}
      <TableCell>{size}</TableCell>
      {/* Date Modified Field */}
      <TableCell>{dateMod}</TableCell>
      {/* Modified By Field */}
      <TableCell>{modBy}</TableCell>
      {/* Actions Field */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="btn btn-ghost">
            <EllipsisHorizontalIcon className="w-4 h-4 text-black" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-50 rounded-md text-black p-1">
            {/* Rename Action */}
            <DropdownMenuItem
              className="hover:text-blue-500 hover:underline btn btn-ghost w-full"
              onClick={() => {
                setModalType("rename");
                console.log(
                  `originalName: ${name}, id: ${id}, originalDirectory: ${originalDirectory}`
                );
              }}
            >
              Rename
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

export default FolderRow;
