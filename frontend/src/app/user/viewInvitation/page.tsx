"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import GetUserID from "@/src/helpers/getUserID";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import DashboardNavbar from "../../components/userComponents/navbar/dashboardNavbar";
import { userRoles } from "@/src/models/enums/userRoles";

export default function AcceptInvite() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [tokenSet, setTokenSet] = useState(false);
  const [error, setError] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    projectName: "",
    projectDescription: "",
    field: "",
    estimatedCompletion: "",
  });
  const userID = GetUserID();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const formatEstimatedCompletion = formatDate(
    projectDetails.estimatedCompletion
  );

  const loadProjectDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/projects/viewInvite?token=${token}`
      );
      setProjectDetails({
        ...projectDetails,
        projectName: response.data.name,
        projectDescription: response.data.desc,
        field: response.data.field,
        estimatedCompletion: response.data.deadline,
      });
      console.log(projectDetails);
    } catch (error: any) {
      setError(true);
      console.error(error.response.data);
    }
  }, [token, projectDetails, setProjectDetails]);

  const acceptInvitation = async () => {
    try {
      const response = await axios.put(
        `/api/projects/acceptInvite?id=${userID}&token=${token}`
      );
      console.log("response received from backend: ", response.data);
      if (response.data.success) {
        if (response.data.role === userRoles.USER) {
          router.replace("/user/dashboard");
        }
        if (response.data.role === userRoles.CLIENT) {
          router.replace("/client/dashboard");
        }
        toast.success(`Joined ${projectDetails.projectName}`);
      }
    } catch (error: any) {
      setError(true);
      console.error(error.response.data);
      toast.error("an error occurred, check the console");
    }
  };

  useEffect(() => {
    const tokenFromURL = window.location.search.split("=")[1];
    if (tokenFromURL && !tokenSet) {
      setToken(tokenFromURL);
    }
  }, [tokenSet]);

  useEffect(() => {
    if (token.length > 0 && !tokenSet) {
      loadProjectDetails();
      setTokenSet(true);
    }
  }, [token, tokenSet, loadProjectDetails]);

  //Need to improve HTML Later - might move to modal in future
  return (
    <>
      <div className="bg-white w-screen min-h-screen flex flex-1">
        <DashboardNavbar />
        <div className="flex flex-col pt-24 w-screen bg-white text-black">
          <h1 className="text-4xl font-bold text-center">Project Invitation</h1>
          <p className="text-xl mt-4 text-center">
            You&apos;ve been invited to join{" "}
            <strong>{projectDetails.projectName}</strong>
            <br />
            View the details below before accepting the invite
          </p>
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="join">
              <input
                value="Project Description"
                className="textarea input-bordered border-black border-2 w-72 max-w-sm text-black rounded-br-none rounded-tr-none bg-slate-50 text-lg"
                readOnly
              />
              <textarea
                value={projectDetails.projectDescription}
                className="textarea input-bordered border-black border-2 w-72 max-w-sm text-black rounded-tl-none rounded-bl-none bg-slate-50"
                readOnly
              />
            </div>
            <div className="join pt-4">
              <input
                value="Project Field"
                className="input input-bordered border-black border-2 w-72 max-w-sm text-black rounded-br-none rounded-tr-none bg-slate-50"
                readOnly
              />
              <input
                value={projectDetails.field}
                className="input input-bordered border-black border-2 w-72 max-w-sm text-black rounded-tl-none rounded-bl-none bg-slate-50"
                readOnly
              />
            </div>
            <div className="join pt-4">
              <input
                value="Project Estimated Deadline"
                className="input input-bordered border-black border-2 w-72 max-w-sm text-black rounded-br-none rounded-tr-none bg-slate-50"
                readOnly
              />
              <input
                value={formatEstimatedCompletion}
                className="input input-bordered border-black border-2 w-72 max-w-sm text-black rounded-tl-none rounded-bl-none bg-slate-50"
                readOnly
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-center mt-4">
            <button
              className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none text-white"
              onClick={acceptInvitation}
            >
              Accept Invitation
            </button>
            <button className="btn bg-red-600 text-white ml-24" onClick={() => {toast.success(`Declined invite to ${projectDetails.projectName}`); router.replace('/user/profile')}}>
              Decline Invitation
            </button>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}
