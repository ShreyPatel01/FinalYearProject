"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircleIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useState } from "react";
import IssueRow from "./issueRow";
import { ObjectId } from "mongoose";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CreateIssueDialog from "./createIssueDialog";
import { projectRoles } from "@/src/models/enums/userRoles";

interface Issue {
  id: ObjectId;
  type: string;
  name: string;
  desc: string;
  dateCreated: string;
  createdBy: string;
  relatedTaskName: string;
  relatedTaskID: ObjectId;
  status: string;
}

const IssueCard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [role, setRole] = useState<string>(projectRoles.USER);
  const projectID = usePathname().split("/")[3];

  //Fetches the project issues
  const fetchProjectIssues = async () => {
    try {
      const response = await axios.get(
        `/api/projects/dashboard/getIssueTickets`,
        {
          params: { project: projectID },
        }
      );
      if (response.data.success) {
        toast.success(`Fetched the issue tickets`);
        setIssueList(response.data.issueList);
        setRole(response.data.role);
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unknown error occurred while creating the ticket.");
      }
    }
  };

  useEffect(() => {
    if (projectID !== null) {
      fetchProjectIssues();
      setLoading(false);
    }
  }, [projectID]);

  return (
    <>
      {loading === false && (
        <>
          <Card className="h-[880px]">
            <CardHeader className="w-full flex flex-row justify-between">
              <p className="text-lg text-start font-semibold mt-2.5">
                Issue Tickets
              </p>
              {/* Create New Issue Ticket Button */}
              <AlertDialog
                open={isDialogOpen}
                onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
              >
                <AlertDialogTrigger asChild>
                  <Button>
                    <PlusCircleIcon className="w-4 h-4 text-white mr-2" />
                    Create New Ticket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-2xl">
                  <CreateIssueDialog
                    projectID={projectID}
                    onClose={() => {
                      setIsDialogOpen(false);
                      fetchProjectIssues();
                    }}
                  />
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              {/* Table of tickets */}
              {issueList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Issue Type</TableHead>
                      <TableHead className="text-center">Issue Name</TableHead>
                      <TableHead className="text-center">
                        Date Created
                      </TableHead>
                      <TableHead className="text-center">Created By</TableHead>
                      <TableHead className="text-center">
                        Related Task
                      </TableHead>
                      <TableHead className="text-center">
                        Issue Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issueList.map((issue: Issue) => (
                      <IssueRow
                        issue={issue}
                        role={role}
                        projectID={projectID}
                        onClose={() => fetchProjectIssues()}
                      />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="w-full text-center align-center h-full my-4">
                  No tickets created
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default IssueCard;
