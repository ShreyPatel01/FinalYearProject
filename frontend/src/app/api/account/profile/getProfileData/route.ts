import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";

connect();

export async function GET(request: NextRequest) {
  try {
    const userID = await RetrieveIDFromToken(request);

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        message: "Couldn't find user",
        status: 404,
        invalidUserID: userID,
      });
    }

    //Getting user full name, username, email, and description
    const username = user.username;
    const userFullName = `${user.firstName} ${user.lastName}`;
    const userInitials = userFullName
      .split(" ")
      .map((word) => word[0])
      .join("");
    const email = user.email;
    const description = user.description;
    const role = user.type

    //Sending all the information to the frontend
    return NextResponse.json({
      success: true,
      nameOfUser: userFullName,
      initials: userInitials,
      username: username,
      email: email,
      desc: description,
      type: role
    });
  } catch (error: any) {
    console.error(`Error while fetching profile data: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
