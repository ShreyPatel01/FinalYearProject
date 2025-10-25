"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const ProjectDetailsCard = () => {
  const projectID = usePathname().split("/")[3];
  const [loading, setLoading] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [projectDesc, setProjectDesc] = useState<string | null>(null);
  const [projectDeadline, setProjectDeadline] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);

  //Fetching project details for card
  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `/api/projects/dashboard/getProjectDetails`,
        { params: { projectID: projectID } }
      );
      if (response.data.success) {
        setProjectName(response.data.name);
        setProjectDesc(response.data.desc);
        setProjectDeadline(response.data.deadline);
        setProjectStatus(response.data.status);
      }
    } catch (error: any) {
      console.error(`Couldn't fetch project details`, error);
      toast.error(`Failed to fetch project details`);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    setLoading(false);
  }, []);

  return (
    <>
      {loading === false && (
        <>
          <Card className="w-[450px] h-[460px]">
            <CardHeader>
              <CardTitle className="w-full text-center text-xl flex flex-row justify-evenly">
                Project Details
                <Badge
                  className={`${projectStatus === "ONGOING" && "bg-orange-600"}
                    ${projectStatus === "FINISHED" && "bg-green-600"} ${
                    projectStatus === "OVERDUE" && "bg-red-600"
                  }`}
                >
                  {projectStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col w-full">
              <div className="label">
                <div className="label-text text-black text-opacity-60 w-full text-center font-semibold">
                  Project Name
                </div>
              </div>
              <Input
                className="w-full h-12 text-black text-center"
                value={projectName ? `${projectName}` : ""}
                readOnly
              />
              <div className="label mt-4">
                <div className="label-text text-black text-opacity-60 w-full text-center font-semibold">
                  Project Description
                </div>
              </div>
              <Textarea
                className="w-full text-black min-h-fit text-center"
                value={projectDesc ? projectDesc : ""}
                readOnly
              />
              <div className="label mt-4">
                <div className="label-text text-black text-opacity-60 w-full text-center  font-semibold flex flex-row justify-evenly">
                  <p>Project Deadline</p>
                </div>
              </div>
              <Input
                className="w-full min-h-fit text-black text-center"
                value={projectDeadline ? `${projectDeadline}` : ""}
                readOnly
              />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default ProjectDetailsCard;
