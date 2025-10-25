"use client";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import styles from "./signupStyles.module.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { userRoles } from "@/src/models/enums/userRoles";

const Signup = () => {
  //Setting up states
  const [showAlert, setShowAlert] = useState(false);
  const [signupStep, setSignupStep] = useState<number>(1);
  const [transitionClass, setTransitionClass] = useState("opacity-100");
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    type: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [lookedAtTerms, setLookedAtTerms] = useState(false);

  const handleTermsAccept = () => {
    setLookedAtTerms(true);
  };

  const onSignup = async () => {
    try {
      if (!buttonDisabled) {
        const response = await axios.post("/api/account/signup", user);
        if (response.data.success) {
          toast.success("Created account");
          console.log("Successfully created account", response.data);
          setShowAlert(true);
        }
      }
    } catch (error: any) {
      console.log(error);
      //Checks if the error has a response object
      if (error.response) {
        //Gets error message from response
        const errorMessages = error.response.data && error.response.data.errors;
        //Checks if errorMessages has multiple objects
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((message) => {
            toast.error(message);
          });
        } else {
          toast.error(errorMessages);
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleStepChange = (newStep: number) => {
    // Add transition classes
    setTransitionClass("opacity-0 transition-opacity duration-500");

    // Use setTimeout to delay the actual step change and allow the transition to complete
    setTimeout(() => {
      setSignupStep(newStep);
      setTransitionClass("opacity-100 transition-opacity duration-500");
    }, 500); // Duration of the transition
 };


  //Creating states for "Create Account" button depending on conditions specified
  useEffect(() => {
    if (
      user.firstName.length > 0 &&
      user.lastName.length > 0 &&
      user.email.length > 0 &&
      user.username.length > 0 &&
      user.password.length > 0 &&
      user.confirmPassword.length > 0 &&
      lookedAtTerms
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user, setButtonDisabled, lookedAtTerms]);

  return (
    <main className="bg-white justify-center w-screen min-h-screen flex flex-1">
      {/* Modal for Terms and Conditions - Need to add checkbox
      To make sure the user has looked at this before signing up */}
      <input
        type="checkbox"
        id="termsModal"
        className="modal-toggle"
        onClick={handleTermsAccept}
      />
      <div className="modal" role="dialog">
        <div className="modal-box text-white  ">
          <h3 className="font-bold text-lg">Terms and Conditions</h3>
          <p className="py-4 ">Placeholder for T&C</p>
          <div className="modal-action">
            <label htmlFor="termsModal" className="btn">
              I Accept
            </label>
          </div>
        </div>
      </div>

      {/* Redirect to Login Section */}
      <div className="flex flex-col w-1/5 h-screen bg-gray-200 justify-center items-center">
        <div className="mx-1 text-4xl font-bold text-center mb-8">
          Already an Existing Member?
        </div>
        <p className="mx-2 text-2xl font-bold text-center mb-8">
          Click the button below to login to your account
        </p>
        <Link href="../login">
          <button className="btn btn-outline text-black w-40">Login</button>
        </Link>
      </div>
      {/* Sign-Up Section */}
      <div className="flex flex-col w-4/5 h-screen bg-blue-600 justify-center items-center text-white">
        {/* Step 1 Content - Choose Account Type*/}
        {signupStep === 1 && (
          <div className={`${transitionClass}`}>
            <p className="text-4xl font-semibold w-full text-center">Select an account type</p>
            <div className="flex flex-row mt-8">
              <Card
                className="w-[300px] shadow-xl cursor-pointer transition-all duration-50 ease-in-out transform hover:scale-105"
                onClick={() => {
                  setUser({ ...user, type: userRoles.USER });
                  toast.success(`Chosen the account type ${userRoles.USER}`);
                  handleStepChange(2);
                }}
              >
                <CardHeader>
                  <CardTitle className="w-full text-center text-2xl">
                    User
                  </CardTitle>
                </CardHeader>
                <CardContent className="w-full text-center">
                  Create projects, collaborate with team members, and
                  communicate with clients to deliver products
                </CardContent>
              </Card>
              <Card
                className="w-[300px] ml-8 shadow-xl cursor-pointer transition-all duration-50 ease-in-out transform hover:scale-105"
                onClick={() => {
                  setUser({ ...user, type: userRoles.CLIENT });
                  toast.success(`Chosen the account type ${userRoles.CLIENT}`);
                  handleStepChange(2);
                }}
              >
                <CardHeader>
                  <CardTitle className="w-full text-center text-2xl">
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="w-full text-center">
                  Participate in team-based projects or assemble and lead your
                  own team for project execution
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {/* Step 2 Content - Signup Form*/}
        {signupStep === 2 && (
          <div className={`${transitionClass} flex flex-col justify-center items-center`}>
            <div>
              <h1 className="text-5xl font-bold">Create Your Account Now</h1>
            </div>

            {/* First Name input form */}
            <input
              type="text"
              placeholder="First Name"
              className="input w-full max-w-xs text-white mt-12 mb-8"
              id="firstName"
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />

            {/* Last Name input form */}
            <input
              type="text"
              placeholder="Last Name"
              className="input w-full max-w-xs text-white mb-8"
              id="lastName"
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />

            {/* Email input form */}
            <input
              type="text"
              placeholder="Email"
              className="input w-full max-w-xs text-white mb-8"
              id="email"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />

            {/* Username input form */}
            <input
              type="text"
              placeholder="Username"
              className="input w-full max-w-xs text-white mb-8"
              id="username"
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />

            {/* Password input form */}
            <input
              type="password"
              placeholder="Password"
              className="input w-full max-w-xs text-white mb-8"
              id="password"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />

            {/* Confirm Password input form */}
            <input
              type="password"
              placeholder="Confirm Password"
              className="input w-full max-w-xs text-white mb-8"
              id="confirmPassword"
              onChange={(e) =>
                setUser({ ...user, confirmPassword: e.target.value })
              }
            />

            {/* Terms and Conditions */}
            <div className="mb-8">
              <p>
                I agree to the{" "}
                <label htmlFor="termsModal" className="btn-link text-white">
                  {" "}
                  Terms and Conditions
                </label>
              </p>
            </div>

            {/* Create Account Button */}
            <div className="">
              <button className="btn glass text-white" onClick={onSignup}>
                {buttonDisabled ? "Fill all the fields" : "Create Account"}
              </button>
            </div>
            {/* Change Role Button */}
            <div className="mt-4">
              <button className="btn glass text-white" onClick={() => handleStepChange(1)}>
                Change Role
              </button>
            </div>
          </div>
        )}
      </div>
      {showAlert ? (
        <div className={styles.alertContainer}>
          <div role="alert" className="alert bg-slate-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-info shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>An email has been sent for you to verify your email</span>
            <div>
              <Link href="/login">
                <button className="btn btn-sm text-white">
                  Click here to Login
                </button>
              </Link>
            </div>
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setShowAlert(false)}
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      ) : (
        <Toaster position="bottom-right" />
      )}
    </main>
  );
};

export default Signup;
