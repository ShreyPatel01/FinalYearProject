import axios from "axios";
import React, { useEffect, useState } from "react";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/16/solid";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import TaskCard from "./taskCard";
import CreateTaskModal from "./createTaskModal";
import GetUserID from "@/src/helpers/getUserID";
import EditCategoryModal from "./editCategoryModal";
import DeleteCategoryModal from "./deleteCategoryModal";
import { motion } from "framer-motion";

interface CategoryCardProps {
  categoryID: string;
  role: string;
  projectID: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  categoryID,
  role,
  projectID,
}) => {
  const [specifiedCatID, setSpecifiedCatID] = useState("");
  const [modalType, setModalType] = useState("");
  const userID = GetUserID();
  console.log("category id from categorycard frontend: " + categoryID);
  const [categoryDetails, setCategoryDetails] = useState({
    categoryName: "",
    categoryTasks: [],
    colour: "",
  });

  const getCategoryDetails = async () => {
    const response = await axios.get(
      `/api/projects/showProjectAttributes/getCategoryDetails?id=${categoryID}`
    );
    setCategoryDetails({
      ...categoryDetails,
      categoryName: response.data.name,
      categoryTasks: Array.isArray(response.data.tasks)
        ? response.data.tasks
        : [],
      colour: response.data.colour,
    });
  };
  useEffect(() => {
    getCategoryDetails();
  }, []);

  useEffect(() => {
    if (specifiedCatID && role === "ADMIN") {
      if (modalType === "create") {
        const element = document.getElementById(
          "createTaskModal"
        ) as HTMLDialogElement;
        if (element) {
          setTimeout(() => {
            element.showModal();
          }, 50);
        }
      } else if (modalType === "edit") {
        const element = document.getElementById(
          "editCategoryModal"
        ) as HTMLDialogElement;
        if (element) {
          setTimeout(() => {
            element.showModal();
          }, 50);
        }
      } else if (modalType === "delete") {
        const element = document.getElementById(
          "deleteCategoryModal"
        ) as HTMLDialogElement;
        if (element) {
          setTimeout(() => {
            element.showModal();
          }, 50);
        }
      }
    }
  }, [specifiedCatID, modalType]);

  const closeModal = () => {
    setModalType("");
    getCategoryDetails();
  };

  console.log("tasks from categorycard: ", categoryDetails.categoryTasks);

  return (
    <>
      {specifiedCatID && modalType === "create" && role === "ADMIN" && (
        <CreateTaskModal
          catID={specifiedCatID}
          creatorID={userID}
          projectID={projectID}
          onClose={closeModal}
        />
      )}
      {specifiedCatID && modalType === "edit" && role === "ADMIN" && (
        <EditCategoryModal catID={specifiedCatID} onClose={closeModal} />
      )}
      {specifiedCatID && modalType === "delete" && role === "ADMIN" && (
        <DeleteCategoryModal catID={specifiedCatID} onClose={closeModal} />
      )}
      <div className="card rounded-lg w-96 h-[785px] bg-white shadow-xl flex flex-col relative ml-4">
        <figure className="flex flex-col w-full justify-between overflow-visible">
          <div
            className="flex h-2 w-full rounded-tr-lg rounded-tl-lg"
            style={{ backgroundColor: categoryDetails.colour }}
          ></div>
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-start w-full mt-2 items-center">
              <p
                className="text-white text-sm w-fit ml-4 p-2 rounded-md text-center"
                style={{ backgroundColor: categoryDetails.colour }}
              >
                {categoryDetails.categoryName}
              </p>
            </div>
            {/* Option Buttons */}
            {/* Button for Task Creation */}
            <button
              className="btn btn-ghost text-black mt-2"
              onClick={getCategoryDetails}
            >
              <ArrowPathIcon className="w-4 h-4 text-black" />
            </button>
            {role === "ADMIN" && (
              <button
                className="btn btn-ghost text-white mt-2"
                onClick={() => {
                  setSpecifiedCatID(categoryID);
                  setModalType("create");
                  console.log(
                    "CategoryID when clicking plus icon: ",
                    categoryID
                  );
                }}
              >
                <PlusIcon className="h-4 w-4 text-black" />
              </button>
            )}
            {/* Button for Category Creation */}
            {role === "ADMIN" && (
              <div className="dropdown dropdown-right">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost mt-2 mr-1"
                >
                  <EllipsisVerticalIcon className="h-4 w-4 text-black" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-neutral-200 rounded-box w-40"
                >
                  {/* Buttons for renaming and deleting category */}
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setSpecifiedCatID(categoryID);
                      setModalType("edit");
                    }}
                  >
                    <li>Edit Category</li>
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setSpecifiedCatID(categoryID);
                      setModalType("delete");
                    }}
                  >
                    <li>Delete Category</li>
                  </button>
                </ul>
              </div>
            )}
          </div>
        </figure>
        <motion.div className="flex flex-col card-body w-full bg-slate-600 mt-4 justify-center align-center px-2 rounded-b-xl overflow-auto">
          {categoryDetails.categoryTasks.length > 0 && (
            <div className="flex flex-col justify-start p-4 bg-slate-400 rounded-lg overflow-y-auto max-h-[650px]">
              {categoryDetails.categoryTasks.map((task: any) => (
                <div className="flex mt-3 justify-center" key={task}>
                  <TaskCard taskID={task} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default CategoryCard;
