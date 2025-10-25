import React, { useEffect, useState } from "react";

interface TemplateTaskCardProps {
  projectName: string;
  sprintNo: number;
  categoryName: string;
  taskName: string;
}
interface Task {
  taskName: string;
  taskDesc: string;
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

export const TemplateTaskCard: React.FC<TemplateTaskCardProps> = ({
  projectName,
  sprintNo,
  categoryName,
  taskName,
}) => {
  const projectTemplateOptions: ProjectData = require("./projectTemplates.json");
  const [templateTaskDetails, setTemplateTaskDetails] = useState<
    Task | undefined
  >();

  useEffect(() => {
    console.log(
       `project name: ${projectName}, sprint number: ${sprintNo}, category name: ${categoryName}, task name: ${taskName}`
    );
    if (
       projectName &&
       sprintNo !== null &&
       categoryName &&
       taskName
    ) {
       const projectDetailsArray = projectTemplateOptions[projectName];
       if (projectDetailsArray && projectDetailsArray.length > 0) {
         const projectArray = projectDetailsArray[0];
         if (sprintNo !== null) {
           const sprint = projectArray.sprints.find(
             (s) => s.sprintNo === sprintNo
           );
           if (sprint) {
             const category = sprint.sprintCategories.find(
               (c) => c.categoryName === categoryName
             );
             if (category) {
               const task = category.categoryTasks.find(
                 (t) => t.taskName === taskName
               );
               setTemplateTaskDetails(task);
             }
           }
         }
       }
    }
   }, [projectName, sprintNo, categoryName, taskName, projectTemplateOptions]);

  useEffect(() => {
    if (templateTaskDetails !== undefined) {
      console.log(`task from templateTaskCard: ${templateTaskDetails}`);
    } else {
      console.log("templateTaskDetails is not defined");
    }
  }, [templateTaskDetails]);

  return (
    <>
      {templateTaskDetails !== undefined && (
        <div className="flex card w-80 h-fit bg-white shadow-xl">
          <div className="flex card-body h-fit">
            <h2 className="flex card-title text-black text-center hover:underline">
              {templateTaskDetails.taskName}
            </h2>
            <textarea
              className="textarea text-black bg-white text-sm h-56 overflow-auto max-w-80 -ml-4"
              readOnly
              value={templateTaskDetails.taskDesc}
            />
            <p className="flex text-black text-sm align-bottom justify-start">
              Assigned Members: Not yet assigned
            </p>
            <p className="flex text-black text-sm align-bottom justify-start">
              Deadline date: Not yet assigned
            </p>
          </div>
        </div>
      )}
    </>
  );
};
