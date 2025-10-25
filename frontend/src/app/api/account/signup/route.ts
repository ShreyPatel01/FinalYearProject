import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs";
import User from "@/src/models/userModels";
import { SendEmail } from "@/src/helpers/accountDetailsMailer";

connect();

export async function POST(request: NextRequest) {
  try {
    let errors = [];
    const requestBody = await request.json();
    const { firstName, lastName, email, username, password, confirmPassword, type } =
      requestBody;
    const userDetails = [
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword,
    ];
    console.log(requestBody);

    userDetails.forEach((element: string, index: number) => {
      const labelMessages = [
        "enter your first name",
        "enter your last name",
        "enter your email",
        "enter your username",
        "enter your password",
        "confirm your password",
      ];
      if (element == null || element === "" || element.trim().length === 0) {
        const labelMessage = labelMessages[index];
        errors.push(`Please ${labelMessage}`);
      }
    });

    //Checks if the email contains an @ sign
    //Need to change this so it compares the domain to trusted domains
    if (!email.includes("@") && !(email == null || email === "")) {
      errors.push("The email is not valid");
    }

    //Check if the user's email already exists
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      errors.push("Email already in use");
    }

    //Check if the username already exists
    const UserName = await User.findOne({ username });
    if (UserName) {
      errors.push("Username already exists");
    }

    //Check if the inputted passwords match
    if (password != confirmPassword) {
      errors.push("The passwords do not match");
    }
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    //Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPass = await bcryptjs.hash(password, salt);

    //Creating new user instance once all requirements are met
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPass,
      type
    });
    const savedUser = await newUser.save();
    console.log(savedUser);

    //Sending verification email to user
    await SendEmail({ email, emailType: "VERIFY", userID: savedUser._id });

    return NextResponse.json({
      message: "Account has been created",
      success: true,
      savedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
