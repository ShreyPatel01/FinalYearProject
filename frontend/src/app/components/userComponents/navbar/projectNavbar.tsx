"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./navbar.module.css";
import LogoutButton from "../../logoutButton/logoutButton";
import GetUserFullName from "@/src/helpers/getUserFullName";
import { Bars3Icon } from "@heroicons/react/16/solid";
import GetAccountRole from "@/src/helpers/getAccountRole";
import { userRoles } from "@/src/models/enums/userRoles";

const ProjectNavbar = () => {
  const userFullName = GetUserFullName();
  const role = GetAccountRole();
  const [projectID, setProjectID] = useState("");

  useEffect(() => {
    if (typeof window !== undefined) {
      const projectID = window.location.pathname.split("/")[3];
      setProjectID(projectID);
    }
  }, []);
  return (
    <div className={styles.header}>
      <div className="navbar px-20 bg-slate-50">
        <div>
          <div className="drawer">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              {/* Page content here */}
              <label
                htmlFor="my-drawer"
                className="btn btn-ghost drawer-button"
              >
                <Bars3Icon className="h-4 w-4 text-black" />
              </label>
            </div>
            <div className="drawer-side">
              <label
                htmlFor="my-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <ul className="menu p-4 w-fit min-h-full bg-slate-50 text-base-content">
                {/* Sidebar content here */}
                <li>
                  <Link
                    href={`/user/project/${projectID}`}
                    className="text-black text-lg"
                  >
                    Back to Project Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/user/project/${projectID}/issueBoard`}
                    className="text-black text-lg"
                  >
                    Issue Board
                  </Link>
                </li>

                <li>
                  <Link
                    href={`/user/project/${projectID}/fileTransfer`}
                    className="text-black text-lg"
                  >
                    Project Files
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/user/project/${projectID}/chat`}
                    className="text-black text-lg"
                  >
                    Project Chat
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Link href="/" className="btn btn-ghost text-xl">
            GroupFlow
          </Link>
        </div>
        <div className="flex-1 justify-end">
          <ul className="menu menu-horizontal px-1">
            <li>
              <details>
                <summary>Welcome {userFullName}</summary>
                <ul className="p-1 w-48 items-center bg-slate-50 rounded-t-none z-top">
                  <li>
                    <Link href={"/user/profile"}>Profile</Link>
                  </li>
                  <li>
                    <Link
                      href={`/${
                        role === userRoles.CLIENT ? "client" : "user"
                      }/dashboard`}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <LogoutButton />
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectNavbar;
