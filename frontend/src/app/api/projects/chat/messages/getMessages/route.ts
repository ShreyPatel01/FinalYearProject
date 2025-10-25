import Channel from "@/src/models/channelModel";
import ChannelMessage from "@/src/models/messageModel";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { format } from "date-fns";
import { ObjectId } from "mongoose";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";
import { chatRoles } from "@/src/models/enums/userRoles";

connect();

interface MessageStructure {
  messageID: ObjectId;
  messageContent: string;
  sentByID: ObjectId;
  sentBy: string;
  dateSent: Date;
  dateString: string;
  edited: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const channelID = queryParams.get("channelID");
    let listOfMessages: MessageStructure[] = [];

    //Finding channel in database
    const channel = await Channel.findOne({ _id: channelID });
    const channelMessageIDs = channel.messages;

    //Looping through channelMessageIDs to get details for message component
    for (let i = 0; i < channelMessageIDs.length; i++) {
      //Finding message in database
      const message = await ChannelMessage.findOne({
        _id: channelMessageIDs[i],
      });
      console.log(message);
      //Checking message type
      const messageType = message.type;
      console.log(`messageType is ${messageType}`);
      //Retrieving message content
      const actualMessage = message.messageContent;
      //Getting the user who sent the message
      const user = await User.findOne({ _id: message.sentBy });
      const userFullName = `${user.firstName} ${user.lastName}`;

      //Checking if message was edited
      const editedCheck = message.edited;

      //Getting the date the message was sent
      const messageDate = message.messageTime;
      const formattedDate = format(messageDate, "dd/MM/yyyy 'at' HH:mm");
      const messageObject = {
        messageID: message._id,
        messageContent: actualMessage,
        sentByID: message.sentBy,
        sentBy: userFullName,
        dateSent: messageDate,
        dateString: formattedDate,
        edited: editedCheck,
      };

      listOfMessages.push(messageObject);
    }

    //Sorting listOfMessages in ascending order based on messageObject.dateSent
    listOfMessages.sort((a, b) => a.dateSent.getTime() - b.dateSent.getTime());

    //Getting role of current user
    const currentUserID = await RetrieveIDFromToken(request);
    const currentUser = await User.findOne({ _id: currentUserID });
    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Couldn't find user in database",
          invalidUserID: currentUserID,
        },
        { status: 404 }
      );
    }
    let role = chatRoles.MEMBER;
    if (channel.channelAdmin === currentUserID.toString()) {
      role = chatRoles.ADMIN;
    } else if (channel.channelModerators.includes(currentUserID.toString())) {
      role = chatRoles.MODERATOR;
    } else if (channel.channelClient.includes(currentUserID.toString())){
      role = chatRoles.CLIENT;
    }

    return NextResponse.json({
      success: true,
      messages: "Retrieved messages for the channel",
      messagesList: listOfMessages,
      role: role
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
