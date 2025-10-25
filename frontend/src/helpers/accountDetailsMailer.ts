import nodemailer from "nodemailer";
import User from "../models/userModels";
import bcryptjs from "bcryptjs";

export const SendEmail = async ({
  email,
  emailType,
  userID,
}: any) => {
  try {
    //Create a hashed token
    const hashedUserToken = await bcryptjs.hash(userID.toString(), 10);

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userID, {
        verifyToken: hashedUserToken,
        verifyTokenExpiryDate: Date.now() + 900000,
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userID, {
        resetPasswordToken: hashedUserToken,
        resetPasswordExpiryDate: Date.now() + 1800000,
      });
    }

    //Create a transporter
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const mailOptions = {
      from: "groupflow@gmail.com",
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      //Will change the HTML to look better at some point
      html: `<p> Click <a href="${
        process.env.DOMAIN
      }/verifyEmail?token=${hashedUserToken}">here</a> to ${
        emailType === "VERIFY" ? "verify your email" : "reset your password"
      }</p>
      <p>This link will be available for ${
        emailType === "VERIFY" ? "15" : "30"
      } minutes</p>`,
    };

    const mailResponse = await transport.sendMail(mailOptions);

    return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
