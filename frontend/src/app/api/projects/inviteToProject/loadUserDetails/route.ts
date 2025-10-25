import { connect } from "@/src/dbConfig/dbConfig";
import User from "@/src/models/userModels";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
  try {
    //Getting username from URL
    const URLObject = new URL(request.url);
    const URLParams = new URLSearchParams(URLObject.search);
    const username = URLParams.get("getUser");
    console.log("Username from frontend; " + username);

    const user = await User.findOne({ username: username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    return NextResponse.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
