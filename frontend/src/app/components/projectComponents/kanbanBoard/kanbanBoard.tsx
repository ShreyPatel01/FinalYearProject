"use client";
import { projectRoles } from "@/src/models/enums/userRoles";
import { ObjectId } from "mongoose";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CategoryCard from "./categoryCard";
import { ArrowPathIcon } from "@heroicons/react/16/solid";
import GetUserID from "@/src/helpers/getUserID";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateCategoryPopover from "./createCategoryPopover";
const KanbanBoard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [projectID, setProjectID] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [role, setRole] = useState<string>(projectRoles.USER);
  const [sprintIDs, setSprintIDs] = useState<ObjectId[] | null>(null);
  const [currentSprintID, setCurrentSprintID] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [categories, setCategories] = useState<ObjectId[] | null>(null);
  const userID = GetUserID();

  //Fetching projectID from URL
  useEffect(() => {
    if (typeof window !== undefined) {
      const idFromURL = window.location.pathname.split("/")[3];
      setProjectID(idFromURL);
    }
  }, []);

  //Fetching project data from database on component load
  const fetchProjectData = async () => {
    try {
      const response = await axios.get(
        `/api/projects/showProjectAttributes/getKanbanBoardDetails`,
        { params: { projectID: projectID, userID: userID } }
      );
      if (response.data.success) {
        setProjectName(response.data.name);
        setRole(response.data.role);
        setSprintIDs(response.data.sprintIDs);
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error(`Error while fetching project details: `, error);
      toast.error(`Error fetching project details`);
    }
  };

  const fetchChosenSprintData = async () => {
    if (currentSprintID !== null) {
      try {
        const response = await axios.get(
          `/api/projects/showProjectAttributes/getSprintDetails`,
          { params: { newSprintID: currentSprintID, projectID: projectID } }
        );
        if (response.data.success) {
          setCategories(response.data.categories);
          toast.success(`Fetched the new categories`);
        }
      } catch (error: any) {
        console.error(`Error fetching new categories: `, error);
        toast.error(`Error fetching new sprint categories`);
      }
    }
  };

  const handleCreateCategory = async (categoryName: string) => {
    try {
      const requestBody = {
        sprintID: currentSprintID,
        catName: categoryName,
        projectID: projectID,
      };
      const response = await axios.post(
        `/api/projects/updateKanbanBoardAttributes/updateCategory`,
        requestBody
      );
      if (response.data.success) {
        setOpenPopover(false);
        toast.success(`Successfully created category ${categoryName}`);
        fetchChosenSprintData();
      }
    } catch (error: any) {}
  };

  useEffect(() => {
    if (userID !== "nothing") {
      setLoading(true);
      fetchProjectData();
      setLoading(false);
    }
  }, [userID]);

  useEffect(() => {
    setLoading(true);
    fetchChosenSprintData();
    setLoading(false);
  }, [currentSprintID]);

  return (
    <>
      {loading === false && (
        <div className="flex flex-col mt-20 bg-slate-200 w-full h-full pb-4 pr-4 rounded-xl">
          {/* Issue Board Header */}
          <div className="flex flex-row w-full h-fit p-2 justify-center">
            {/* Project Name */}
            <p className="flex justify-start mx-8 mt-4 font-semibold text-2xl">
              {projectName}
            </p>
            {/* Select form for sprints */}
            <Select
              onValueChange={(e) => {
                setCurrentSprintID(e);
              }}
            >
              <SelectTrigger className="w-[200px] mt-3 bg-slate-50">
                <SelectValue
                  placeholder="Select a sprint"
                  className="text-black"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sprintIDs !== undefined &&
                    sprintIDs !== null &&
                    sprintIDs.map((sprintID: ObjectId, index: number) => (
                      <SelectItem
                        key={sprintID.toString()}
                        value={sprintID.toString()}
                        className="text-black"
                      >
                        Sprint {index + 1}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* Create Category Button - only if user is Admin */}
            {role !== null && role === "ADMIN" && (
              <CreateCategoryPopover
                onCreate={handleCreateCategory}
                onPress={() => setOpenPopover(!openPopover)}
                open={openPopover}
              />
            )}
            {/* Refresh Button */}
            <button
              className="btn btn-ghost text-lg font-semibold mt-2 ml-8"
              onClick={fetchChosenSprintData}
            >
              Refresh <ArrowPathIcon className="w-4 h-4 text-black" />
            </button>
          </div>
          {/* Issue Board Content */}
          <div className="flex flex-row justify-start ml-4 mt-2 overflow-x-auto max-w-[1600px] h-[800px]">
            {projectID !== null &&
              currentSprintID !== null &&
              categories !== null &&
              categories.map((category: ObjectId) => (
                <CategoryCard
                  key={category.toString()}
                  categoryID={category.toString()}
                  role={role}
                  projectID={projectID}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default KanbanBoard;
