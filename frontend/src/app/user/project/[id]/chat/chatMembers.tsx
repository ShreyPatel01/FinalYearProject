import Member from "@/src/app/components/chat/otherComponents/member";
import RoleHeader from "@/src/app/components/chat/otherComponents/roleHeader";
import { CogIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import { ObjectId } from "mongoose";
import React, { useEffect, useState } from "react";
import ChannelSettingsModal from "@/src/app/components/chat/modals/channelSettingsModal";
import { chatRoles } from "@/src/models/enums/userRoles";

interface ChatMembersProps {
  channelID: ObjectId;
  userID: string;
}

interface RoleList {
  userID: ObjectId;
  userFullName: string;
  userInitials: string;
}

const ChatMembers: React.FC<ChatMembersProps> = ({ channelID, userID }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string>(chatRoles.MEMBER);
  const [membersList, setMembersList] = useState<RoleList[]>([]);
  const [adminList, setAdminList] = useState<RoleList[]>([]);
  const [modList, setModList] = useState<RoleList[]>([]);
  const [clientList, setClientList] = useState<RoleList[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const getMembers = async () => {
    try {
      const response = await axios.get(
        `/api/projects/chat/members/getMembers`,
        { params: { channelID: channelID } }
      );
      if (response.data.success) {
        setAdminList(response.data.adminList);
        setModList(response.data.modList);
        setClientList(response.data.clientList);
        setMembersList(response.data.memberList);
        setRole(response.data.role);
      }
    } catch (error: any) {
      console.error("Error fetching members: ", error);
    }
  };

  useEffect(() => {
    getMembers();
    setLoading(false);
  }, [channelID]);

  useEffect(() => {
    if (modalOpen) {
      const element = document.getElementById(
        "channelSettingsModal"
      ) as HTMLDialogElement;
      if (element) {
        setTimeout(() => {
          element.showModal();
        }, 50);
      }
    }
  }, [modalOpen]);

  //Refetches member list when child component does something
  const refetchMembers = () => {
    setModalOpen(false);
    setLoading(true);
    getMembers();
    setLoading(false);
  };
  //TODO: Convert to components
  return (
    <>
      {(modalOpen === true && (role === chatRoles.MODERATOR ||
        role === chatRoles.ADMIN) && (
          <ChannelSettingsModal
            onClose={refetchMembers}
            channelID={channelID}
            userID={userID}
            role={role}
          />
        ))}
      {loading === false && (
        <div className="w-full h-screen justify-start overflow-y-auto">
          <div className="ml-4 pt-4 mb-4 mr-2">
            <div className="flex flex-row w-full justify-between">
              <p className="text-xl font-semibold mt-2">Channel Members</p>
              <button
                className="btn btn-ghost -mt-1"
                onClick={() => {
                  setModalOpen(true);
                  console.log(`modalOpen changed to true`);
                }}
              >
                <CogIcon className="w-7 h-7 text-black opacity-60" />
              </button>
            </div>
            <div className="divider -mt-1 h-3 -mb-0.5" />
            {/* Admin Role Label */}
            {adminList.length > 0 && (
              <RoleHeader roleName="Admin" roleCount={adminList.length} />
            )}
            {/* Admins */}
            {adminList.length > 0 &&
              adminList.map((user) => (
                <Member
                  userID={user.userID}
                  userFullName={user.userFullName}
                  userInitials={user.userInitials}
                  key={user.userFullName}
                />
              ))}
            {/* Mod Role Label */}
            {modList.length > 0 && (
              <div className="mt-2">
                <RoleHeader roleName="Moderator" roleCount={modList.length} />
              </div>
            )}
            {/* Moderators */}
            {modList.length > 0 &&
              modList.map((user) => (
                <Member
                  userID={user.userID}
                  userFullName={user.userFullName}
                  userInitials={user.userInitials}
                  key={user.userFullName}
                />
              ))}
            {/* Client Role Label */}
            {clientList.length > 0 && (
              <div className="mt-2">
                <RoleHeader roleName="Client" roleCount={clientList.length} />
              </div>
            )}
            {/* Clients */}
            {clientList.length > 0 &&
              clientList.map((user) => (
                <Member
                  userID={user.userID}
                  userFullName={user.userFullName}
                  userInitials={user.userInitials}
                  key={user.userFullName}
                />
              ))}
            {/* Member Role Label */}
            {membersList.length > 0 && (
              <div className="mt-2">
                <RoleHeader roleName="Member" roleCount={membersList.length} />
              </div>
            )}
            {/* Members */}
            {membersList.length > 0 &&
              membersList.map((user) => (
                <Member
                  userID={user.userID}
                  userFullName={user.userFullName}
                  userInitials={user.userInitials}
                  key={user.userFullName}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMembers;
