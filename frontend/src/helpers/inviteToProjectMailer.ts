import nodemailer from "nodemailer";
import User from "../models/userModels";
import Project from "../models/projectModel";
import bcryptjs from "bcryptjs";

export const SendInvitationEmail = async ({
  recipientEmail,
  projectID,
}: any) => {
  try {
    const hashedProjectToken = await bcryptjs.hash(projectID.toString(), 10);

    //Getting sender information for email
    const project = await Project.findOne({ _id: projectID });
    if(!project){
      throw new Error(`Couldn't find project`);
    }
    console.log(project);
    const projectName = project.projectName;
    const projectAdmin = project.projectAdmin;
    const sender = await User.findOne({ _id: projectAdmin });
    const senderUserName = sender.username;
    console.log(senderUserName);

    //Getting recipient information for email
    const recipient = await User.findOne({ email: recipientEmail });
    if(!recipient){
      throw new Error(`Couldn't find recipient`)
    }

    await Project.findByIdAndUpdate(projectID, {
      projectInvitationToken: hashedProjectToken,
      projectInvitationTokenExpiryDate: Date.now() + 3600000,
    });

    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const invitationEmail = {
      from: "groupflow@gmail.com",
      to: recipientEmail,
      subject: `Invitation to ${projectName}`,
      html: `<h1>${senderUserName} has invited you to join their project </h1>
      <p>Click <a href="${process.env.DOMAIN}/user/viewInvitation?token=${hashedProjectToken}">here</a> to join the project.</p>
      <p> This link will expire in 1 hour </p>`,
    };
    const mailResponse = await transport.sendMail(invitationEmail);

    return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
