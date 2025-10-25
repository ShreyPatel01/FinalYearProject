"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface UserSearchProps {
  projectID: string;
  onUserSelected: (user: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({
  projectID,
  onUserSelected,
}) => {
  const [userList, setUserList] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [hasFetchedList, setHasFetchedList] = useState(false);

  useEffect(() => {
    const getVerifiedUsers = async () => {
      const response = await axios.get(
        `/api/projects/inviteToProject/listVerifiedUsers?projectID=${projectID}`
      );
      const listOfUsers = response.data.data;
      setUserList(listOfUsers);
      setHasFetchedList(true);
    };
    if (!hasFetchedList) {
      getVerifiedUsers();
    }
  }, [setUserList, hasFetchedList, setHasFetchedList, projectID]);

  const handleSearch = (e: any) => {
    if (e.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setSearchResults(
      userList
        .filter((user) => user.toLowerCase().includes(e.toLowerCase()))
        .slice(0, 8)
    );
  };

  const handleUserSelection = (chosenUser: string) => {
    onUserSelected(chosenUser);
  };

  return (
    <>
      <div>
        <input
          type="search"
          placeholder="Username"
          className="p-3 w-full text-white rounded-md border-2 border-white"
          onChange={(e) => handleSearch(e.target.value)}
        ></input>
      </div>
      {searchResults.length > 0 && (
        <div
          className="p-4 mt-4 border-white border-2 bg-slate-800
       text-white w-full rounded-lg flex flex-col gap-2 text-left"
        >
          {searchResults.map((search, index) => (
            <span key={index} onClick={() => handleUserSelection(search)}>
              {search}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default UserSearch;
