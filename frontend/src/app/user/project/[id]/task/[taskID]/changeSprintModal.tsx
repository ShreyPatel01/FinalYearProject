"use client";
import axios from "axios";
import { ObjectId } from "mongoose";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CategoryList from "./categoryList";
import { ArrowLongRightIcon } from "@heroicons/react/16/solid";

interface ChangeSprintModalProps {
  taskID: string;
  onClose: () => void;
  projectID: string;
  userID: string;
}

interface Sprint {
  sprintID: ObjectId;
  sprintNo: number;
  startDate: string;
  endDate: string;
}

interface Category {
  categoryID: ObjectId;
  categoryName: string;
}

const ChangeSprintModal: React.FC<ChangeSprintModalProps> = ({
  projectID,
  taskID,
  onClose,
  userID,
}) => {
  const [sprintListLoading, setSprintListLoading] = useState<boolean>(false);
  const [categoryListLoading, setCategoryListLoading] =
    useState<boolean>(false);
  const [sprintList, setSprintList] = useState<Sprint[]>([]);
  const [selectedSprintID, setSelectedSprintID] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newDeadline, setNewDeadline] = useState<Date | null>(null);

  //Gets list of sprints
  const getSprints = async () => {
    try {
      const response = await axios.get(
        `/api/projects/tasks/originalTask/changeSprint/getSprints`,
        { params: { projectID: projectID } }
      );
      if (response.data.success) {
        console.log(response.data.sprintList);
        setSprintList(response.data.sprintList);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Couldn't fetch list of sprints in project`);
    }
  };

  //Sets sprintList on component load
  useEffect(() => {
    setSprintListLoading(true);
    getSprints();
    setSprintListLoading(false);
  }, []);

  //Gets list of sprints
  const getCategories = async (selectedSprintID: string) => {
    try {
      const response = await axios.get(
        `/api/projects/tasks/originalTask/changeSprint/getCategories`,
        { params: { selectedSprint: selectedSprintID } }
      );
      if (response.data.success) {
        console.log(response.data.categoryList);
        setCategoryList(response.data.categoryList);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Couldn't fetch the categories of the sprint`);
    }
  };

  //Sets categoryList whenever selectedSprint changes
  useEffect(() => {
    if (selectedSprintID !== null) {
      setCategoryListLoading(true);
      getCategories(selectedSprintID);
      setCategoryListLoading(false);
    }
  }, [selectedSprintID]);

  //Changes the category of the sprint
  const changeSprint = async () => {
    try {
      const requestBody = {
        taskID: taskID,
        newTaskDeadline: newDeadline,
        newSprintID: selectedSprintID,
        newCategoryID: newCategory,
        userID: userID,
        projectID: projectID,
      };
      const response = await axios.put(
        `/api/projects/tasks/originalTask/changeSprint`,
        requestBody
      );
      if (response.data.success) {
        toast.success(
          `Successfully changed the sprint and category of the task`
        );
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      //Checks if the error has a response object
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
        toast.error("Couldn't change the sprint and category of the task");
      }
    }
  };

  //Sets the chosen category
  const setChosenCategory = (categoryID: string) => {
    setNewCategory(categoryID);
  };
  return (
    <>
      {sprintListLoading === false && (
        <dialog id="changeSprintModal" className="modal">
          <div className="modal-box bg-slate-50 max-w-2xl">
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
              Change The Sprint Of The Task
            </h1>
            {sprintList.length > 0 && (
              <>
                <div className="w-full flex flex-col">
                  <div className="label">
                    <span className="label-text text-black font-semiold text-opacity-60">
                      Choose a new sprint
                    </span>
                  </div>
                  <div>
                    <select
                      className="select select-bordered bg-slate-50 text-black border-black"
                      onChange={(e) => {
                        setSelectedSprintID(e.target.value);
                        const chosenSprint = sprintList.find(
                          (sprint: Sprint) =>
                            sprint.sprintID.toString() === e.target.value
                        );
                        setSelectedSprint(chosenSprint || null);
                      }}
                    >
                      <option disabled selected>
                        Choose a sprint
                      </option>
                      {sprintList.map((sprint: Sprint) => (
                        <option
                          key={sprint.sprintID.toString()}
                          value={sprint.sprintID.toString()}
                        >
                          Sprint {sprint.sprintNo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedSprint !== null && (
                  <p className="w-full text-black">
                    Sprint {selectedSprint.sprintNo}: {selectedSprint.startDate}{" "}
                    <ArrowLongRightIcon className="text-black w-5 h-5" />{" "}
                    {selectedSprint.endDate}
                  </p>
                )}
                {categoryListLoading === false && (
                  <>
                    {categoryList.length > 0 && (
                      <CategoryList
                        categories={categoryList}
                        changeChosenCategory={setChosenCategory}
                      />
                    )}
                  </>
                )}
                {newCategory !== null && (
                  <div className="flex flex-col w-full">
                    <div className="label">
                      <span className="label-text text-black text-opacity-60 font-semibold">
                        New Task Deadline
                      </span>
                    </div>
                    <input
                      type="datetime-local"
                      className="input input-bordered bg-slate-50 text-black border-black"
                      onChange={(e) => {
                        setNewDeadline(new Date(e.target.value + "Z"));
                      }}
                      value={
                        newDeadline
                          ? newDeadline.toISOString().slice(0, 16)
                          : ""
                      }
                    />
                  </div>
                )}
                {newDeadline !== null && (
                  <div className="w-full">
                    <button
                      className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none hover:underline text-white"
                      onClick={changeSprint}
                    >
                      Change Sprint
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </dialog>
      )}
    </>
  );
};

export default ChangeSprintModal;
