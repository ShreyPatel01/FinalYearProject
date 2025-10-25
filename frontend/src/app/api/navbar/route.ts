import { RetrieveIDFromToken } from "@/src/helpers/retrieveTokenData";
import { NextRequest, NextResponse } from "next/server";
import User from "@/src/models/userModels";
import { connect } from "@/src/dbConfig/dbConfig";

connect();

export async function GET(request: NextRequest) {
  try {
    const userID = await RetrieveIDFromToken(request);
    const user = await User.findOne({ _id: userID }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.username,
      role: user.type
    };

    return NextResponse.json({
      message: "Found user",
      data: userData,
    });
  } catch (error: any) {
    console.error("Error in GET function:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
