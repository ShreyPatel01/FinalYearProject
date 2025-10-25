"use client";
import React, { useEffect, useState } from "react";
import CreateProjectModal from "../createProjectModal/createProjectModal";
import axios from "axios";
import Link from "next/link";

interface ProjectItem {
  _id: string;
  projectName: string;
}
const DashboardSidebar = () => {
  const [projectList, setProjectList] = useState<ProjectItem[]>([]);
  useEffect(() => {
    const provideProjects = async () => {
      try {
        const response = await axios.get("/api/userSidebar");
        const listOfProjects = response.data.data;
        setProjectList(listOfProjects);
      } catch (error: any) {
        console.log(error);
      }
    };
    provideProjects();
  }, []);
  return (
    <>
      <CreateProjectModal />
      <div className="flex justify-start flex-col">
        <div className="min-w-72 px-4 mt-20 bg-gray-200 flex flex-col h-4/5 rounded-lg">
          <div className="pt-4 font-bold text-2xl flex-grow text-center">Projects</div>
          <div className="flex flex-col pl-4 pt-4 h-full align-top">
            {"  "}
            {projectList.map((project, index) => (
              <div className="flex flex-col pt-4" key={index}>
                <Link href={`/user/project/${project._id}`}>
                  <button className="btn btn-outline text-black outline-black w-full justify-center">
                    {project.projectName}
                  </button>
                </Link>
                <br />
              </div>
            ))}
          </div>
          <div className="flex justify-center pb-4 items-center">
            <label
              htmlFor="createProjectModal"
              className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none text-white w-full"
              onClick={() => {
                const element = document.getElementById(
                  "createProjectModal"
                ) as HTMLDialogElement;
                if (element) {
                  element.showModal();
                }
              }}
            >
              Create Project
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
