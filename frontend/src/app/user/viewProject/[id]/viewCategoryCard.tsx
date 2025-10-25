"use client";
import React, { useEffect, useState } from "react";
import ViewTaskCard from "./viewTaskCard";
import { ObjectId } from "mongoose";
import toast from "react-hot-toast";
import axios from "axios";

interface ViewCategoryCardProps {
  categoryID: string;
  projectID: string;
}

const ViewCategoryCard: React.FC<ViewCategoryCardProps> = ({
  categoryID,
  projectID,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [categoryTaskIDs, setCategoryTaskIDs] = useState<ObjectId[]>([]);
  const [categoryColour, setCategoryColour] = useState<string | null>(null);

  //Fetching category details
  const fetchCategoryDetails = async () => {
    try {
      const response = await axios.get(`/api/viewProjects/getIssueBoardDetails/getCategoryDetails`, {
        params: { categoryID: categoryID },
      });
      if (response.data.success) {
        setCategoryName(response.data.name);
        setCategoryColour(response.data.colour);
        setCategoryTaskIDs(response.data.taskList);
        toast.success(`loaded category card details`)
      }
    } catch (error) {
      console.error(error);
      toast.error(`Couldn't get category details`);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCategoryDetails();
    setLoading(false);
  }, []);

  return (
    <>
      {loading === false && (
        <>
          <div className="card rounded-lg w-96 h-[800px] bg-white shadow-xl flex flex-col relative ml-4">
            <figure className="flex flex-col w-full justify-between overflow-visible">
              <div
                className="flex h-2 w-full rounded-tr-lg rounded-tl-lg"
                style={{
                  backgroundColor: categoryColour ? categoryColour : undefined,
                }}
              />
                <div className="flex justify-start w-full mt-2 items-center">
              <p
                className="text-white text-sm w-fit ml-4 p-2 rounded-md text-center"
                style={{ backgroundColor: categoryColour ? categoryColour : '' }}
              >
                {categoryName}
              </p>
            </div>
              
            </figure>
            <div className="flex flex-col card-body w-full bg-slate-600 mt-4 justify-center align-center px-2 rounded-b-xl overflow-auto">
              {categoryTaskIDs.length > 0 && (
                <div className="flex flex-col justify-start p-4 bg-slate-400 rounded-lg overflow-y-auto max-h-[650px]">
                  {categoryTaskIDs.map((taskID: ObjectId) => (
                    <div
                      className="flex mt-3 justify-center"
                      key={taskID.toString()}
                    >
                      <ViewTaskCard taskID={taskID} projectID={projectID} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ViewCategoryCard;
