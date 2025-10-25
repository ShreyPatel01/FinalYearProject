import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ObjectId } from "mongoose";
import Link from "next/link";
import React from "react";

interface Project {
  projectName: string;
  projectDescription: string;
  projectID: ObjectId;
  projectStatus: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link className="w-full" href={`/user/project/${project.projectID}`}>
      <Card>
        <CardHeader>
          <CardTitle>{project.projectName}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{project.projectDescription}</CardDescription>
        </CardContent>
        <CardFooter>
          <p
            className={`rounded-3xl p-2 w-fit text-white  ${
              project.projectStatus === "ONGOING" && "bg-orange-400"
            } ${project.projectStatus === "FINISHED" && "bg-green-600"} ${
              project.projectStatus === "OVERDUE" && "bg-red-600"
            }`}
          >
            Status: {project.projectStatus}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
