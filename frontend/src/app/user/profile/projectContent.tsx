import axios from "axios";
import { ObjectId } from "mongoose";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProjectCard from "../../components/userComponents/profile/projectCard";

interface Project {
  projectName: string;
  projectDescription: string;
  projectID: ObjectId;
  projectStatus: string;
}
const ProjectContent = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [projectList, setProjectList] = useState<Project[]>([]);
  //Fetching the list of projects
  const fetchUserProjects = async () => {
    try {
      const response = await axios.get(`/api/account/profile/getProjects`);
      if (response.data.success) {
        console.log(response.data.projectList);
        setProjectList(response.data.projectList);
      }
    } catch (error: any) {
      console.error(`Error while fetching the user's projects: `, error);
      toast.error(`Error while fetching your projects`);
    }
  };

  useEffect(() => {
    fetchUserProjects();
    setLoading(false);
  }, []);
  return (
    <>
      {loading === false && (
        <>
          {projectList.length > 0 &&
            projectList.map((project: Project) => (
              <div className="mt-8 cursor-pointer transition-all duration-50 ease-in-out transform hover:scale-105">
                <ProjectCard project={project} />
              </div>
            ))}
        </>
      )}
    </>
  );
};

export default ProjectContent;
