"use client";
import { userRoles } from "@/src/models/enums/userRoles";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  //Setting up variables
  const router = useRouter();
  const [user, setUser] = React.useState({
    username: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onLogin = async () => {
    try {
      if(!buttonDisabled) {
        setLoading(true);
        const response = await axios.post("/api/account/login", user);
        console.log("Successful login", response.data);
        toast.success(`Successful ${response.data.type} login`);
        if(response.data.type === userRoles.USER){
          setTimeout(() => {
            router.replace(`/user/dashboard`);
          }, 100);
        }
        if(response.data.type === userRoles.CLIENT){
          setTimeout(() => {
            router.replace(`/client/dashboard`)
          },100)
        }
      }
    } catch (error: any) {
      console.log(error);
      if (error.response) {
        const errorMessages = error.response.data && error.response.data.errors;
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.username.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user, setButtonDisabled]);

  return (
    <main className="bg-white justify-center w-screen min-h-screen flex flex-1">
      {/* Login Section */}
      <div className="flex flex-col w-4/5 min-h-screen bg-gray-200 justify-center items-center">
        <div className="text-5xl font-bold -mt-8 mb-8">Welcome back</div>
        <div className="text-3xl font-bold mb-8">
          {loading ? "Checking Your Details" : "Please Log Into Your Account"}
        </div>
        <div className="">
          <input
            type="text"
            id="username"
            placeholder="username"
            className="input input-bordered w-80 max-w-sm text-white mb-8"
            onChange={(e) => setUser({ ...user, username: e.target.value })}
          />
        </div>
        <div>
          <input
            type="password"
            id="password"
            placeholder="password"
            className="input input-bordered w-80 max-w-sm text-white mb-8"
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
        </div>
        <div>
          <button className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none text-white mb-8" onClick={onLogin}>
            {buttonDisabled ? "Fill in the fields" : "Login"}
          </button>
        </div>
      </div>
      {/* Redirect to Sign-Up Section */}
      <div className="flex flex-col w-1/5 h-screen bg-blue-600 justify-center items-center text-white">
        <h1 className="text-5xl font-bold text-center -mt-20 mb-8">New To Our System?</h1>
        <p className="mx-12 text-xl font-bold text-center mb-8">
          Create an account by clicking on the sign-up button below
        </p>
        <Link href="../signup">
          <button className="btn btn-outline text-white w-40">
            Sign-Up
          </button>
        </Link>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Login;
