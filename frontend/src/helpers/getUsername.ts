import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; 
const GetUsername = () => {
  const [userName, setUserName] = useState("nothing");

  useEffect(() => {
    let ignore = false;

    const getUsersName = async () => {
      try {
        const response = await axios.get("/api/navbar");
        const UserName = response.data.data.userName;
        if (!ignore) {
          setUserName(UserName);
          console.log(UserName);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data");
      }
    };

    if (userName === "nothing") {
      getUsersName();
    }

    return () => {
      ignore = true;
    };
  }, [userName]);

  return userName;
};

export default GetUsername;