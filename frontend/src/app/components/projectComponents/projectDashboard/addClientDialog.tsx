"use client";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, PlusIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useState } from "react";
import {
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";
import { ObjectId } from "aws-sdk/clients/codecommit";
import toast from "react-hot-toast";

interface AddClientDialogProps {
  onClose: () => void;
  projectID: string;
}

interface Client {
  id: ObjectId;
  fullName: string;
  email: string;
}

const AddClientDialog: React.FC<AddClientDialogProps> = ({
  onClose,
  projectID,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogStep, setDialogStep] = useState<number>(1);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [chosenClient, setChosenClient] = useState<Client | null>(null);

  const getVerifiedClients = async () => {
    try {
      const response = await axios.get(
        `/api/projects/dashboard/getVerifiedClients`,
        { params: { projectID: projectID } }
      );
      if (response.data.success) {
        setClientList(response.data.clientsNotInProject);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    getVerifiedClients();
    setLoading(false);
  }, []);

  const sendInviteToClient = async () => {
    try {
      const requestBody = { clientID: chosenClient?.id, projectID: projectID };
      const response = await axios.put(
        `/api/projects/dashboard/inviteClient`,
        requestBody
      );
      if (response.data.success) {
        toast.success(
          `${chosenClient?.fullName} has been sent an invite to join the project`
        );
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(
          "An unexpected error occurred while trying to send an invite to the client"
        );
      }
    }
  };

  const handleActionPress = () => {
    if (dialogStep === 1) {
      setDialogStep(2);
    } else {
      sendInviteToClient();
    }
  };

  const handleCancelPress = () => {
    if (dialogStep === 1) {
      onClose();
    } else {
      setDialogStep(1);
      setChosenClient(null);
    }
  };

  return (
    <div className="w-full justify-center items-center flex flex-col">
      {loading === false && (
        <>
          <AlertDialogTrigger>
            <Button variant={"default"} className="w-fit justify-center flex">
              <PlusCircleIcon className="w-4 h-4 text-white mr-2" /> Add Client
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <p className="w-full text-center text-2xl font-semibold">
                Invite A New Client
              </p>
            </AlertDialogHeader>
            <AlertDialogDescription>
              {/* Dialog Step 1 Content */}
              {dialogStep === 1 && (
                <>
                  {clientList !== undefined && clientList.length > 0 && (
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full px-4"
                    >
                      <AccordionItem value="item-1">
                        <AccordionTrigger>List of Clients</AccordionTrigger>
                        <AccordionContent>
                          {clientList.map((client: Client) => (
                            <AccordionItem
                              value={client.id.toString()}
                              className="w-full flex flex-row justify-between mt-4"
                              onClick={() => {
                                setChosenClient(client);
                                setDialogStep(2);
                              }}
                            >
                              {client.fullName}
                              <Button variant={"default"}>
                                <PlusIcon className="w-4 h-4 text-white" />
                              </Button>
                            </AccordionItem>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </>
              )}
              {/* Dialog Step 2 Content */}
              {dialogStep === 2 && chosenClient !== null && (
                <>
                  <p>Chosen Client Details</p>
                  <div className="join">
                    <input
                      value="Client Name"
                      className="flex w-32 input input-bordered border-white border-2 max-w-xs text-white rounded-br-none rounded-tr-none"
                      readOnly
                    />
                    <input
                      value={chosenClient.fullName}
                      className="input input-bordered border-white border-2 w-fit max-w-xs text-white rounded-tl-none rounded-bl-none"
                      readOnly
                    />
                  </div>
                  <div className="join">
                    <input
                      value="Client Email"
                      className="flex w-32 input input-bordered border-white border-2 max-w-xs text-white rounded-br-none rounded-tr-none"
                      readOnly
                    />
                    <input
                      value={chosenClient.email}
                      className="input input-bordered border-white border-2 w-fit max-w-xs text-white rounded-tl-none rounded-bl-none"
                      readOnly
                    />
                  </div>
                </>
              )}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={(e) => {
                  e.preventDefault();
                  handleCancelPress();
                }}
              >
                {dialogStep !== 2 ? "Close" : "Back"}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-blue-600 hover:bg-blue-700 hover:underline border-none hover:border-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleActionPress();
                }}
              >
                {dialogStep !== 2 ? "Next" : "Add Client"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </>
      )}
    </div>
  );
};

export default AddClientDialog;
