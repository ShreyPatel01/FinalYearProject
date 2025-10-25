"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ObjectId } from "mongoose";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowPathIcon } from "@heroicons/react/16/solid";
import ViewCategoryCard from "./viewCategoryCard";
import { usePathname } from "next/navigation";



const ViewIssueBoard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [sprintIDs, setSprintIDs] = useState<ObjectId[] | null>(null);
  const [currentSprintID, setCurrentSprintID] = useState<string | null>(null);
  const [categories, setCategories] = useState<ObjectId[] | null>(null);
  const projectID = usePathname().split("/")[3];


  const fetchProjectData = async () => {
    try {
      const response = await axios.get(
        `/api/viewProjects/getIssueBoardDetails/getSprintList`,
        { params: { projectID: projectID } }
      );
      if (response.data.success) {
        setProjectName(response.data.name);
        setSprintIDs(response.data.sprintIDs);
        toast.success(`fetched project details`)
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
          `/api/viewProjects/getIssueBoardDetails/getCategoryList`,
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

  useEffect(() => {
    setLoading(true);
    fetchProjectData();
    setLoading(false);
  }, [projectID]);

  useEffect(() => {
    setLoading(true);
    fetchChosenSprintData();
    setLoading(false);
  }, [currentSprintID]);

  return (
    <>
      {loading === false && (
        <div className="flex flex-col mt-20 bg-slate-200 w-full h-5/6 pb-4 pr-4 rounded-xl ml-8">
          {/* Issue Board Header */}
          <div className="flex flex-row w-full h-fit p-2 justify-center">
            {/* Project Name */}
            <p className="flex justify-start mx-8 mt-4 font-semibold text-2xl">
              {projectName}
            </p>
            {/* Select Form for Sprints */}
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
                <ViewCategoryCard
                  key={category.toString()}
                  categoryID={category.toString()}
                  projectID={projectID}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ViewIssueBoard;
