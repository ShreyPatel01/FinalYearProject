import Channel from "@/src/models/channelModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

interface MemberStructure {
    userID: ObjectId;
    role: string;
    _id: ObjectId;
  }

export async function PUT(request: NextRequest){
    try {
        const requestBody = await request.json();
        const channelID = requestBody.channelID;
        const channelMemberID = requestBody.channelMemberID;
    
        //Finding channel in database
        const channel = await Channel.findOne({_id: channelID});
        const channelMembers = channel.channelMembers;
    
        //Finding the index of the channel member that needs to be updated
        const channelMemberIndex = channelMembers.findIndex((member: MemberStructure) => member.userID.toString() === channelMemberID);
    
        //Removing object at channelMemberIndex from channelMembers
        channelMembers.splice(channelMemberIndex, 1);
    
        const updatedChannel = await Channel.updateOne({_id: channel._id}, {$set: {channelMembers: channelMembers}});
        return NextResponse.json({success:true, message: "Removed user from channel", updatedChannel: updatedChannel});
    } catch (error:any) {
        console.error(`Error kicking member from channel: `,error);
        return NextResponse.json({error: error.message, status:500});
    }
}   