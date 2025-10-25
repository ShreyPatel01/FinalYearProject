import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ObjectId } from "mongoose";
import Link from "next/link";
import React from "react";

interface Client {
  clientID: ObjectId;
  clientName: string;
  clientDesc: string;
}

interface ClientCardProps {
  client: Client;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  return (
    <>
      <div className="label">
        <div className="label-text text-black text-opacity-60 w-full text-center  font-semibold flex flex-row justify-evenly">
          <p>Client Name</p>
        </div>
      </div>
      <Input
        className="w-full min-h-fit text-black text-center"
        value={client.clientName}
        readOnly
      />
      <div className="label mt-4">
        <div className="label-text text-black text-opacity-60 w-full text-center h-fit font-semibold flex flex-row justify-evenly">
          <p>Client Description</p>
        </div>
      </div>
      <Textarea
        className="w-full text-black min-h-fit text-center"
        value={client.clientDesc}
        readOnly
      />
      <Link href={`/user/viewProfile/${client.clientID}`}>
        <Button className="w-full mt-4">View Profile</Button>
      </Link>
    </>
  );
};

export default ClientCard;
