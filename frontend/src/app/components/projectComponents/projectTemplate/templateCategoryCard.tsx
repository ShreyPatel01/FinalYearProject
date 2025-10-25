import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useState } from "react";
import { TemplateTaskCard } from "./templateTaskCard";

interface TemplateCategoryCardProps {
  projectName: string;
  sprintNo: number;
  categoryName: string;
}

interface SprintCategory {
  categoryName: string;
  colour: string;
  categoryTasks: {
    taskName: string;
    taskDesc: string;
  }[];
}

interface Sprint {
  sprintNo: number;
  sprintCategories: SprintCategory[];
}

interface Project {
  field: string;
  numberOfSprints: number;
  averageSprintLength: number;
  sprints: Sprint[];
}

interface ProjectData {
  [key: string]: Project[];
}

export const TemplateCategoryCard: React.FC<TemplateCategoryCardProps> = ({
  projectName,
  sprintNo,
  categoryName,
}) => {
  const projectTemplateOptions: ProjectData = require("./projectTemplates.json");
  const [categoryTasks, setCategoryTasks] = useState<String[]>([]);
  const [templateCatDetails, setTemplateCatDetails] = useState<
    SprintCategory | undefined
  >();
  useEffect(() => {
    //Need to find project, sprintNo in project, then category in sprint
    //done to avoid confusion if templates have same category name
    if (
      projectName !== "" &&
      projectName !== null &&
      sprintNo !== null &&
      categoryName !== null
    ) {
      const projectDetailsArray = projectTemplateOptions[projectName];
      if (projectDetailsArray && projectDetailsArray.length > 0) {
        const projectArray = projectDetailsArray[0];
        if (sprintNo !== null) {
          const sprint = projectArray.sprints.find(
            (s) => s.sprintNo === sprintNo
          );
          if (sprint && sprint.sprintCategories) {
            const category = sprint.sprintCategories.find(
              (c) => c.categoryName === categoryName
            );
            setTemplateCatDetails(category);
            if(category && category.categoryTasks){
              const tasks = category.categoryTasks.map((task) => task.taskName);
              setCategoryTasks(tasks);
            }
          }
        }
      }
    }
  }, [projectName, sprintNo, categoryName]);
  return (
    <>
      {templateCatDetails !== undefined && (
        <div className="card w-96 h-[785px] bg-white shadow-xl flex flex-col relative">
          <figure className="flex flex-col w-full justify-between overflow-visible">
            <div
              className="flex h-2 w-full"
              style={{ backgroundColor: templateCatDetails.colour }}
            ></div>
            {/* Category Name */}
            <div className="flex justify-between items-center w-full">
              <div className="flex justify-start w-full mt-2 items-center">
                <p
                  className="text-white text-sm w-fit ml-4 p-2 rounded-md text-center"
                  style={{ backgroundColor: templateCatDetails.colour }}
                >
                  {templateCatDetails.categoryName}
                </p>
              </div>
              {/* Option buttons */}
              <button className="btn btn-ghost text-white mt-2">
                <PlusIcon className="h-4 w-4 text-black" />
              </button>
              <button className="btn btn-ghost mt-2 mr-1">
                <EllipsisVerticalIcon className="h-4 w-4 text-black" />
              </button>
            </div>
          </figure>
          {/* Task Card Section */}
          <div className="flex flex-col card-body w-full bg-slate-600 mt-4 justify-center align-center px-2 rounded-b-xl overflow-auto">
            {categoryTasks.length > 0 && (
              <div className="flex flex-col justify-start p-4 bg-slate-400 rounded-lg overflow-y-auto max-h-[650px]">
                {categoryTasks.map(
                  (task: any, index: number) => (
                    <div className="flex mt-3 justify-center" key={index}>
                      <TemplateTaskCard
                        projectName={projectName}
                        sprintNo={sprintNo}
                        categoryName={categoryName}
                        taskName={task}
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
