"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import axios from "axios";

interface ViewProfileDataProps {
  profileID: string;
}

const ViewProfileData: React.FC<ViewProfileDataProps> = ({ profileID }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [userFullName, setUserFullName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  //Fetching Profile Data
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`/api/account/profile/getProfileData`, {
        params: { userID: profileID },
      });
      if (response.data.success) {
        setUserFullName(response.data.nameOfUser);
        setUserInitials(response.data.initials);
        setUsername(response.data.username);
        setEmail(response.data.email);
        setType(response.data.type);
        const backendDesc = response.data.desc;
        if (backendDesc.trim().length > 0) {
          setDescription(response.data.desc);
        }
      }
    } catch (error: any) {
      console.error(`Error fetching profile data: `, error);
      toast.error(`Couldn't fetch profile data`);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfileData();
    setLoading(false);
  }, []);
  return (
    <div className='mt-20'>
      {loading === false && (
        <>
          {/* Avatar */}
          <div>
            <div className="avatar w-full justify-center placeholder">
              <div className="w-24 rounded-full border-2 border-blue-400 bg-gray-200">
                <span className="text-2xl">{userInitials}</span>
              </div>
            </div>
          </div>
          {/* Name of User */}
          <div className="mt-6">
            <div className="label">
              <span className="label-text text-gray-400 font-semibold text-lg">
                Full Name
              </span>
            </div>
            <Input
              type="text"
              className="bg-slate-50 text-lg w-full text-black p-2"
              value={userFullName}
              disabled
            />
          </div>
          {/* Username */}
          <div className="mt-6">
            <div className="label">
              <span className="label-text text-gray-400 font-semibold text-lg">
                Username
              </span>
            </div>
            <Input
              type="text"
              className="bg-slate-50 text-lg w-full text-black p-2"
              value={username}
              disabled
            />
          </div>
          {/* Account Type */}
          <div className="mt-6">
            <div className="label">
              <span className="label-text text-gray-400 font-semibold text-lg">
                Account Type
              </span>
            </div>
            <Input
              type="text"
              className="bg-slate-50 text-lg w-full text-black p-2"
              value={type}
              disabled
            />
          </div>
          {/* Email */}
          <div className="mt-6">
            <div className="label">
              <span className="label-text text-gray-400 font-semibold text-lg">
                Email
              </span>
            </div>
            <Input
              type="text"
              className="bg-slate-50 text-lg w-full text-black p-2"
              value={email}
              disabled
            />
          </div>
          {/* Description */}
          <div className="mt-6">
            <div className="label">
              <span className="label-text text-gray-400 font-semibold text-lg">
                About Them
              </span>
            </div>
            <Textarea
              className="bg-slate-50 text-lg w-full text-black h-40"
              value={description}
              disabled
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ViewProfileData;
