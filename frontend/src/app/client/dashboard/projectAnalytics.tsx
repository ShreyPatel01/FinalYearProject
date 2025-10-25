'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GetUserID from "@/src/helpers/getUserID";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AllProjectAnalytics = () => {
  const [ongoingProjectCount, setOngoingProjectCount] = useState<number>(0);
  const [totalProjectCount, setTotalProjectCount] = useState<number>(0);
  const [finishedProjectCount, setFinishedProjectCount] = useState<number>(0);
  const [overdueProjectCount, setOverdueProjectCount] = useState<number>(0);
  const userID = GetUserID();

  //Fetching projects for analytics
  const fetchProjectCounts = async() => {
    try {
      const response = await axios.get(`/api/client/dashboard/getProjectCounts`, {params: {userID: userID}});
      if(response.data.success){
        toast.success(`fetched project counts`)
        console.log(response.data.ongoing)
        setOngoingProjectCount(response.data.ongoing);
        setTotalProjectCount(response.data.total)
        setFinishedProjectCount(response.data.finished)
        setOverdueProjectCount(response.data.overdue);
      }
    } catch (error) {
      console.error(`Error fetching project counts: `,error);
      toast.error(`Error fetching project counts`)
    }
  }

  //Runs on component load
  useEffect(() => {
    if(userID !== "nothing"){
      fetchProjectCounts();
    }
  },[userID])

  return (
    <div className="flex justify-start flex-col w-full mx-4">
      <div className="mt-20 bg-slate-50 flex flex-col h-4/5 rounded-lg py-2 px-4">
        {/* Project Count */}
        <p className="text-black font-semibold text-xl w-full text-center mt-4">
          You're currently a part of {totalProjectCount} projects
        </p>
        {/* Basic Analytic Cards */}
        <div className="flex flex-row w-full mt-4 justify-center">
          {/* Ongoing */}
          <Card className="w-[300px]">
            <CardHeader>
              <CardTitle className='w-full text-start'>
                Ongoing
              </CardTitle>
            </CardHeader>
            <CardContent className='text-orange-600 text-4xl font-semibold'>
                {ongoingProjectCount}
            </CardContent>
          </Card>
          {/* Finished */}
          <Card className="w-[300px] ml-8">
            <CardHeader>
              <CardTitle className='w-full text-start'>
                Finished
              </CardTitle>
            </CardHeader>
            <CardContent className='text-green-600 text-4xl font-semibold'>
                {finishedProjectCount}
            </CardContent>
          </Card>
          {/* Overdue */}
          <Card className="w-[300px] ml-8">
            <CardHeader>
              <CardTitle className='w-full text-start'>
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent className='text-red-600 text-4xl font-semibold'>
                {overdueProjectCount}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AllProjectAnalytics;
