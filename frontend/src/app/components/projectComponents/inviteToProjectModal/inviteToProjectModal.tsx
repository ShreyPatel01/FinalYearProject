import axios from "axios";
import React, { useEffect, useState } from "react";
import UserSearch from "./searchForUser";
import styles from "./inviteModalStyles.module.css";
interface InviteToProjectModalProps {
  id: string;
}
const InviteToProjectModal: React.FC<InviteToProjectModalProps> = ({ id }) => {
  const [modalStep, setModalStep] = useState(1);
  const [userToDisplay, setUserToDisplay] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    console.log(
      "User To Display fron inviteprojectmodal component: " + userToDisplay
    );
    const loadUserDetails = async () => {
      const response = await axios.get(
        `/api/projects/inviteToProject/loadUserDetails?getUser=${userToDisplay}`
      );
      setUserDetails({
        ...userDetails,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
      });
    };
    if (modalStep === 2) {
      loadUserDetails();
    }
  }, [modalStep, userToDisplay]);

  const handleUserSelection = (chosenUser: string) => {
    setUserToDisplay(chosenUser);
    handleModalStepChange(2);
  };
  const handleModalStepChange = (step: any) => {
    setModalStep(step);
  };

  const sendInvite = async () => {
    const response = await axios.put(
      `/api/projects/inviteToProject?projectID=${id}&invitedUser=${userToDisplay}`
    );
    if(response.data.success) {
      setShowAlert(true);
    }
  };

  useEffect(() => {
    console.log("User Details from invitetoprojectmodal", userDetails);
  }, [userDetails]);

  return (
    <dialog id="inviteToProjectModal" className="modal">
      <div className="modal-box bg-blue-500">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">
            ✕
          </button>
        </form>
        <ul className="steps justify-center w-full pb-4 ">
          <li
            className={`step ${modalStep === 1 ? "step-info" : ""} text-white`}
            onClick={() => handleModalStepChange(1)}
          >
            Choose User
          </li>
          <li
            className={`step ${
              modalStep === 2 ? "step-info text-white" : ""
            } text-black mr-8`}
            onClick={() => handleModalStepChange(2)}
          >
            Invite User
          </li>
        </ul>
        {/* Step 1 Content */}
        {modalStep === 1 && (
          <>
            <div className="flex flex-col align-center justify-center">
              <h1 className="font-bold text-white text-2xl text-center">Search for User</h1>
              <p className="text-white text-md mb-4 text-center justify-center ">
                Search for a user and click on their username to go to the next
                step
              </p>
            </div>
            {/* Need to configure elastic search that goes through all the verified users in the DB */}
            <UserSearch projectID={id} onUserSelected={handleUserSelection} />
          </>
        )}
        {/* Step 2 Content */}
        {modalStep === 2 && (
          <>
            <div className="flex flex-col align-center justify-center">
              <h1 className="font-bold text-white text-2xl text-center">
                Invite {userToDisplay}
              </h1>
              <p className="text-white text-md mb-4 text-center justify-center">
                Here are {userToDisplay}&apos;s details. Make sure they are
                correct before inviting them to the project
              </p>
              {/* Displaying user details */}
              <div className="flex flex-col items-center justify-center">
                <div className="join">
                  <input
                    value="First Name"
                    className="flex w-32 input input-bordered border-white border-2 max-w-xs text-white rounded-br-none rounded-tr-none"
                    readOnly
                  />
                  <input
                    value={userDetails.firstName}
                    className="input input-bordered border-white border-2 w-fit max-w-xs text-white rounded-tl-none rounded-bl-none"
                    readOnly
                  />
                </div>
                <div className="join pt-4">
                  <input
                    value="Last Name"
                    className="flex w-32 input input-bordered border-white border-2 max-w-xs text-white rounded-br-none rounded-tr-none"
                    readOnly
                  />
                  <input
                    value={userDetails.lastName}
                    className="input input-bordered border-white border-2 w-fit max-w-xs text-white rounded-tl-none rounded-bl-none"
                    readOnly
                  />
                </div>
                <div className="join pt-4">
                  <input
                    value="Email"
                    className="flex w-32 input input-bordered border-white border-2 max-w-xs text-white rounded-br-none rounded-tr-none"
                    readOnly
                  />
                  <input
                    value={userDetails.email}
                    className="input input-bordered border-white border-2 w-fit max-w-xs text-white rounded-tl-none rounded-bl-none"
                    readOnly
                  />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex justify-center mt-4">
                <button
                  className="flex flex-col btn btn-active text-white"
                  onClick={() => handleModalStepChange(1)}
                >
                  Back
                </button>
                <button
                  className="flex flex-col btn btn-active ml-4 text-white"
                  onClick={sendInvite}
                >
                  Invite {userToDisplay}
                </button>
              </div>
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
                  <span>
                    An invitation email has been sent to {userToDisplay}
                  </span>
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
            ) : null}
          </>
        )}
      </div>
    </dialog>
  );
};

export default InviteToProjectModal;
