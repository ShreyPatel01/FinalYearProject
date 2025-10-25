import axios from "axios";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

interface DeleteCategoryModalProps {
  catID: string;
  onClose: () => void;
}
const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  catID,
  onClose,
}) => {
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
  const deleteCategory = async () => {
    try {
      const response = await axios.delete(
        `/api/projects/updateKanbanBoardAttributes/updateCategory?id=${catID}`
      );
      if (response.data.success) {
        toast.success("Successfully deleted category");
        onClose();
      }
    } catch (error: any) {
      toast.error(
        "An unexpected error occurred, check the console for more details"
      );
      console.error("An error occurred ", error);
    }
  };


  return (
    <dialog id="deleteCategoryModal" className="modal">
      <div className="modal-box bg-slate-50">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">
            ✕
          </button>
        </form>
        <h1 className="font-bold text-2xl text-center text-black">
          Are you sure you want to delete this category?
        </h1>
        <p className="text-sm text-black text-center mt-4">
          This action is irreversible and you won't be able to undo this.
        </p>
        <div className="flex flex-row justify-evenly pt-4">
          <button
            className="btn bg-red-600 text-white"
            onClick={deleteCategory}
          >
            Yes
          </button>
          <form method="dialog ml-4" onSubmit={onClose}>
            <button className="btn btn-active text-white">No</button>
          </form>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </dialog>
  );
};

export default DeleteCategoryModal;
