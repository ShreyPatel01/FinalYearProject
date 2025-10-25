import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const GetAccountRole = () => {
  const [role, setRole] = useState("nothing");

  useEffect(() => {
    let ignore = false;

    const getRole = async () => {
      try {
        const response = await axios.get("/api/navbar");
        const roleFromDB =
          response.data.data.role;
        if (!ignore) {
          setRole(roleFromDB);
          console.log(roleFromDB);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data");
      }
    };

    if (role === "nothing") {
      getRole();
    }

    return () => {
      ignore = true;
    };
  }, [role]);

  return role;
};

export default GetAccountRole;

