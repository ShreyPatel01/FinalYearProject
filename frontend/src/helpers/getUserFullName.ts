
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
const GetUserFullName = () => {
  const [userFullName, setUserFullName] = useState("nothing");

  useEffect(() => {
    let ignore = false;

    const getUsersName = async () => {
      try {
        const response = await axios.get("/api/navbar");
        const userFullName =
          response.data.data.firstName + " " + response.data.data.lastName;
        if (!ignore) {
          setUserFullName(userFullName);
          console.log(userFullName);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data");
      }
    };

    if (userFullName === "nothing") {
      getUsersName();
    }

    return () => {
      ignore = true;
    };
  }, [userFullName]);

  return userFullName;
};

export default GetUserFullName;
