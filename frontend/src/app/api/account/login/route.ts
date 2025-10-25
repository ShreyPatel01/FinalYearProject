import { connect } from "@/src/dbConfig/dbConfig";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { projectRoles, userRoles } from "@/src/models/enums/userRoles";

connect();

export async function POST(request: NextRequest) {
  try {
    let errors = [];
    const requestBody = await request.json();
    const { username, password } = requestBody;
    console.log(requestBody);

    //Checks if the user has inputted something into the password field
    const noPasswordCheck = (password: any) => {
      if (password == null || password === "" || password.trim().length === 0) {
        errors.push("Please enter your password");
      }
    };

    //Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      if (!username || username.trim().length === 0) {
        errors.push("Please enter your username");
        noPasswordCheck(password);
      } else {
        errors.push("This username doesn't exist");
        noPasswordCheck(password);
      }
      //Returns early if the user can't be found to avoid null password
      return NextResponse.json({ errors }, { status: 400 });
    } else {
      //Checks if the user has verified their account
      if (!user.isVerified) {
        errors.push("Please verify your email before logging in");
      }
      noPasswordCheck(password);
      //Check if the password matches user's stored password
      const validPass = await bcryptjs.compare(password, user.password);
      if (!validPass) {
        errors.push("Invalid password");
      }
    }

    //Sends errors to client-side
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    //Create token data
    let tokenData = {};
    if(user.type === userRoles.CLIENT){
      tokenData = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: userRoles.CLIENT,
      };
    }
    tokenData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: userRoles.USER,
    };

    //Creating an actual token for the user
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      message: "Successful login",
      success: true,
      type: user.type
    });

    response.cookies.set("token", token, {
      httpOnly: true,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
