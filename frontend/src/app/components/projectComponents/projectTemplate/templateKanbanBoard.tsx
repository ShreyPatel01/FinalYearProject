import React, { useState, useEffect } from "react";
import { TemplateCategoryCard } from "./templateCategoryCard";

interface TemplateKanbanBoardProps {
  projectName: string;
}

// Define an interface for a single sprint category
interface SprintCategory {
  categoryName: string;
  colour: string;
  categoryTasks: {
    taskName: string;
    taskDesc: string;
  }[];
}

// Define an interface for a single sprint
interface Sprint {
  sprintNo: number;
  sprintCategories: SprintCategory[];
}

// Define an interface for a single project
interface Project {
  field: string;
  numberOfSprints: number;
  averageSprintLength: number;
  sprints: Sprint[];
}

interface ProjectData {
  [key: string]: Project[];
}

export const TemplateKanbanBoard: React.FC<TemplateKanbanBoardProps> = ({
  projectName,
}) => {
  const projectTemplateOptions: ProjectData = require("./projectTemplates.json");
  const [selectedSprint, setSelectedSprint] = useState<number | null>(null);
  const [sprintStart, setSprintStart] = useState<Date | null>();
  const [sprintEnd, setSprintEnd] = useState<Date | null>();
  const [sprintCategories, setSprintCategories] = useState<String[]>([]);
  const [chosenProjectDetails, setChosenProjectDetails] = useState<
    Project | undefined
  >();

  useEffect(() => {
    if(chosenProjectDetails === undefined) {
      const projectDetailsArray = projectTemplateOptions[projectName];
      if (projectDetailsArray && projectDetailsArray.length > 0) {
        const projectDetail = projectDetailsArray[0];
        console.log(`Number of sprints: ${projectDetail.numberOfSprints}`);
        setChosenProjectDetails(projectDetail);
      } else {
        console.log("Project details not found for: ", projectName);
      }
    }

    //Logic for the start and end date for each sprint
    if (
      selectedSprint !== null &&
      chosenProjectDetails &&
      chosenProjectDetails.averageSprintLength !== undefined
    ) {
      const firstSprintStartDate = new Date();
      firstSprintStartDate.setDate(
        firstSprintStartDate.getDate() +
          (selectedSprint - 1) * chosenProjectDetails.averageSprintLength
      );

      const calculatedEndDate = new Date(firstSprintStartDate);
      calculatedEndDate.setDate(
        calculatedEndDate.getDate() + chosenProjectDetails.averageSprintLength
      );

      setSprintStart(firstSprintStartDate);
      setSprintEnd(calculatedEndDate);
    }
    //Logic for displaying sprint categories
    if (selectedSprint !== null) {
      const sprint = chosenProjectDetails?.sprints.find(
        (s) => s.sprintNo === selectedSprint
      );
      if (sprint) {
        const categories = sprint.sprintCategories.map(
          (category) => category.categoryName
        );
        setSprintCategories(categories);
        console.log(`categories in sprint ${selectedSprint}: ${categories}`);
      }
    }
  }, [projectName, projectTemplateOptions, selectedSprint]);

  return (
    <div className="flex flex-col mt-20 ml-8 bg-slate-200 w-full h-5/6 rounded-xl">
      {/* Kanban Board Header */}
      <div className="flex items-center justify-center w-full p-2">
        <p className="font-bold text-3xl">{projectName}</p>
        {/* Select form for all sprints */}
        <div className="flex items-center">
          <select
            className="select select-bordered text-white ml-8 text-center"
            onChange={(e) => setSelectedSprint(parseInt(e.target.value))}
          >
            <option defaultValue="Select a sprint">Select a sprint</option>
            {chosenProjectDetails &&
              chosenProjectDetails.numberOfSprints &&
              Array.from(
                { length: chosenProjectDetails.numberOfSprints },
                (_, index) => (
                  <option key={index} value={index + 1}>
                    Sprint {index + 1}
                  </option>
                )
              )}
          </select>
          {/* Date Range */}
          {selectedSprint !== null && sprintStart && sprintEnd && (
            <div className="ml-8">
              <p className="font-bold text-3xl">
                Date Range: {sprintStart.toLocaleDateString()} -{" "}
                {sprintEnd.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Kanban Board Content */}
      <div className="flex flex-row justify-start ml-4 mt-2 mr-4 overflow-x-auto max-w-[1600px]">
        {selectedSprint !== null &&
          sprintCategories.map((categoryName, index) => (
            <div className="ml-2" key={categoryName as string}>
              <TemplateCategoryCard
                projectName={projectName}
                sprintNo={selectedSprint}
                categoryName={categoryName.toString()}
              />
            </div>
          ))}
      </div>
    </div>
  );
};
