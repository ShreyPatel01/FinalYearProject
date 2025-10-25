import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const userID = await RetrieveIDFromToken(request);
    const newName = requestBody.newName;
    const newEmail = requestBody.newEmail;
    const newDescription = requestBody.newDescription;
    const newUsername = requestBody.newUsername;

    //Finding user in database
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({
        message: "User not found",
        status: 404,
        invalidUserID: userID,
      });
    }
    let userFirstName;
    let userLastName;

    if (newName !== null) {
      userFirstName = newName.split(" ")[0];
      userLastName = newName.split(" ")[1];
    }

    //Updating user details
    const updatedUser = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          firstName: userFirstName !== null ? userFirstName : user.firstName,
          lastName: userLastName !== null ? userLastName : user.lastName,
          email: newEmail !== null ? newEmail : user.email,
          username: newUsername !== null ? newUsername : user.username,
          description:
            newDescription !== null ? newDescription : user.description,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Profile for ${user._id} has been updated`,
      updatedUser: updatedUser,
    });
  } catch (error: any) {
    console.error(`Error while editing profile: `, error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
