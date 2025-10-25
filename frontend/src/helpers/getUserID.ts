import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; 
const GetUserID = () => {
  const [userID, setUserID] = useState("nothing");

  useEffect(() => {
    let ignore = false;

    const GetUserID = async () => {
      try {
        const response = await axios.get("/api/navbar");
        const UserID = response.data.data.id;
        if (!ignore) {
          setUserID(UserID);
          console.log(UserID);
        }
      } catch (error) {
        console.error("Error fetching user data in GetUserID:", error);
        toast.error("Error fetching user data in GetUserID");
      }
    };

    if (userID === "nothing") {
      GetUserID();
    }

    return () => {
      ignore = true;
    };
  }, [userID]);

  console.log(userID);
  return userID;
};

export default GetUserID;