import { connect } from "@/src/dbConfig/dbConfig";
import User from "@/src/models/userModels";
import { NextResponse, NextRequest } from "next/server";

connect();

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const {token} = requestBody;
    console.log(token);

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiryDate: { $gt: Date.now() },
    });

    if(user) {
      user.isVerified = true;
      user.verifyToken = undefined;
      user.verifyTokenExpiryDate = undefined;
  
      await user.save();
    } else {
      throw new Error(Error.toString());
    }

    return NextResponse.json({
      message: "Email has been verified",
      success: true,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
