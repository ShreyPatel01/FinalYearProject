import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ColorPicker, useColor, IColor } from "react-color-palette";
import "react-color-palette/css";

interface EditCategoryModalProps {
  catID: string;
  onClose: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  catID,
  onClose,
}) => {
  const [color, setColor] = useColor("");
  const [oldCategoryName, setOldCategoryName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  useEffect(() => {
    const getPreviousCategoryDetails = async () => {
      const response = await axios.get(
        `/api/projects/showProjectAttributes/getCategoryDetails?id=${catID}`
      );
      setOldCategoryName(response.data.name);
    };
    getPreviousCategoryDetails();
    const checkNewCategoryDetails = () => {
      // Check if newCategoryName is empty or consists only of whitespace
      if (newCategoryName.trim() === "") {
        // Set newCategoryName to oldCategoryName if it's empty or only whitespace
        setNewCategoryName(oldCategoryName);
      }
    };
    checkNewCategoryDetails();
  });

  //Handling when the user exits by pressing escape instead of the X button
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

  const updateCategoryName = async () => {
    try {
      const hexColour = color.hex.toString();
      console.log("new category name: ", newCategoryName);
      console.log("chosen colour for category: ", hexColour);
      const response = await axios.put(
        `/api/projects/updateKanbanBoardAttributes/updateCategory?`,
        { catID: catID, newName: newCategoryName, newColour: hexColour }
      );
      if (response.data.success) {
        toast.success(`Successfully edited ${oldCategoryName}`);
        closeDialogOnRefactor();
      }
    } catch (error: any) {
      toast.error("An error occurred, please see the console for more details");
      console.error("An error occurred when renaming the category: ", error);
    }
  };

  const closeDialogOnRefactor = () => {
    const dialog = document.getElementById(
      "editCategoryModal"
    ) as HTMLDialogElement;
    if (dialog) {
      onClose();
    }
  };

  return (
    <dialog id="editCategoryModal" className="modal">
      <div className="modal-box w-3/5 max-w-3xl bg-slate-50">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-black"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <h1 className="font-bold text-2xl text-center text-black">
          Edit the Category {oldCategoryName}
        </h1>
        <p className="text-md text-black text-center">
          Please input the new name for the category in the input form below
        </p>
        {/* New Category Name input form */}
        <div className="label">
          <span className="label-text mt-3 text-black font-bold">
            New Category Name
          </span>
          <p className="text-black text-start text-sm mt-3">
            If you don't want to change this, leave it blank
          </p>
        </div>
        <input
          type="text"
          placeholder={oldCategoryName}
          className="input w-full rounded-md border-2 border-black text-black p-3 bg-slate-50 mt-2"
          onChange={(e) => {
            setNewCategoryName(e.target.value);
            console.log("Category name changed to: ", e.target.value);
          }}
        />
        {/* Change Category Colour input form */}
        <div className="label">
          <span className="label-text mt-12 text-black font-bold">
            Change Category Color
          </span>
          <p className="text-sm text-black text-center mt-3 max-w-[400px]">
            Choose a new colour for the category. IMPORTANT: PLEASE SET A COLOUR
            BEFORE SUBMITTING OTHERWISE THE COLOUR WILL BE SET TO BLACK
          </p>
        </div>
        <div className="w-full">
          <ColorPicker
            color={color}
            onChange={(newColor) => {
              setColor(newColor);
              console.log("new colour: ", newColor);
            }}
          />
        </div>
        {/* Edit Category button */}
        <div className="flex justify-center mt-3">
          <button
            className="btn btn-info text-white"
            onClick={updateCategoryName}
          >
            Edit Category
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default EditCategoryModal;
