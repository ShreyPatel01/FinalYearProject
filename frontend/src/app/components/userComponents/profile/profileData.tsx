import {
  CheckCircleIcon,
  PencilSquareIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

const ProfileData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string>("");
  const [newName, setNewName] = useState<string | null>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  //Fetching Profile Data
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`/api/account/profile/getProfileData`);
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

  //Sending edited data
  const editProfileData = async () => {
    try {
      const requestBody = {
        newName: newName,
        newEmail: newEmail,
        newDescription: newDescription,
        newUsername: newUsername,
      };
      const response = await axios.put(
        `/api/account/profile/editProfile`,
        requestBody
      );
      if (response.data.success) {
        setEditing(false);
        toast.success(`Successfully edited the profile`);
        setLoading(true);
        fetchProfileData();
        setLoading(false);
      }
    } catch (error: any) {
      console.error(`Error editing profile data: `, error);
      toast.error(`Couldn't edit profile data`);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfileData();
    setLoading(false);
  }, []);
  return (
    <>
      {loading === false && (
        <div className="flex flex-col w-full mt-12">
          {/* Edit Button */}
          {!editing ? (
            <div className="w-full flex justify-end">
              <button
                className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none text-white hover:underline"
                onClick={() => {
                  setEditing(true);
                  setNewDescription(null);
                  setNewName(null);
                  setNewEmail(null);
                  setNewUsername(null);
                }}
              >
                <PencilSquareIcon className="w-6 h-6 text-white" />
                Edit Profile
              </button>
            </div>
          ) : (
            <>
              <div className="w-full flex justify-end">
                <button
                  className="btn bg-blue-600 hover:bg-blue-700 border-none hover:border-none text-white hover:underline"
                  disabled={
                    (newDescription === null &&
                      newName === null &&
                      newEmail === null &&
                      newUsername === null) ||
                    newDescription === description ||
                    newName === userFullName ||
                    newEmail === email ||
                    newUsername === username
                  }
                  onClick={editProfileData}
                >
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                  Submit Edit
                </button>
                <button
                  className="btn bg-red-600 hover:bg-red-700 border-none hover:border-none text-white hover:underline ml-2"
                  onClick={() => {
                    setEditing(false);
                    setNewDescription(null);
                    setNewName(null);
                    setNewEmail(null);
                    setNewUsername(null);
                  }}
                >
                  <XCircleIcon className="w-6 h-6 text-white" />
                  Cancel Edit
                </button>
              </div>
            </>
          )}
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
              //CHANGE AFTER IMPLEMENTING EDIT BACKEND
              value={newName ? newName : userFullName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={!editing}
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
              value={newUsername ? newUsername : username}
              onChange={(e) => setNewUsername(e.target.value)}
              disabled={!editing}
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
              value={newEmail ? newEmail : email}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={!editing}
            />
          </div>
          {/* Description */}
          <div className="mt-6">
            <div className="label">
              <span className="label-text text-gray-400 font-semibold text-lg">
                About You
              </span>
            </div>
            <Textarea
              className="bg-slate-50 text-lg w-full text-black h-40"
              //CHANGE AFTER IMPLEMENTING EDIT BACKEND
              value={newDescription ? newDescription : description}
              onChange={(e) => {
                setNewDescription(e.target.value);
              }}
              disabled={!editing}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileData;
