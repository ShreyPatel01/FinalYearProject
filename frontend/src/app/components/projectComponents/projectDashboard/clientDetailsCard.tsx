"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GetUserID from "@/src/helpers/getUserID";
import { projectRoles } from "@/src/models/enums/userRoles";
import axios from "axios";
import { ObjectId } from "mongoose";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ClientCard from "./clientCard";
import AddClientDialog from "./addClientDialog";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface Client {
  clientID: ObjectId;
  clientName: string;
  clientDesc: string;
}

const ClientDetailsCard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const projectID = usePathname().split("/")[3];
  const userID = GetUserID();

  //Fetching client list and role
  const fetchClientList = async () => {
    try {
      const response = await axios.get(
        `/api/projects/dashboard/getClientDetails`,
        { params: { projectID: projectID, userID: userID } }
      );
      if (response.data.success) {
        setClientList(response.data.clients);
        console.log(`role received from backend is ${response.data.role}`);
        setRole(response.data.role);
        toast.success(`Fetched client list`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Couldn't fetch client list`);
    }
  };

  useEffect(() => {
    if (userID !== "nothing") {
      fetchClientList();
      setLoading(false);
    }
  }, [userID]);

  return (
    <>
      {loading === false && (
        <Card className="w-[450px] mt-4">
          <CardHeader>
            <CardTitle className="w-full text-center">Client Details</CardTitle>
          </CardHeader>
          {role === projectRoles.ADMIN && clientList.length === 0 && (
            <CardContent>
              <AlertDialog
                open={openDialog}
                onOpenChange={() => setOpenDialog(!openDialog)}
              >
                <AddClientDialog
                  projectID={projectID}
                  onClose={() => setOpenDialog(false)}
                />
              </AlertDialog>
            </CardContent>
          )}
          {clientList.length > 0 && (
            <CardContent className="w-full flex flex-col overflow-y-auto max-h-[328px]">
              {clientList.map((client: Client) => (
                <div>
                  <ClientCard client={client} key={client.clientName} />
                  <div className="divider" />
                </div>
              ))}
              {role === projectRoles.ADMIN && (
                <AlertDialog
                  open={openDialog}
                  onOpenChange={() => setOpenDialog(!openDialog)}
                >
                  <AddClientDialog
                    projectID={projectID}
                    onClose={() => setOpenDialog(false)}
                  />
                </AlertDialog>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
};

export default ClientDetailsCard;
