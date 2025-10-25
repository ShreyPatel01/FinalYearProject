"use client";
import React from "react";
import Link from "next/link";
import styles from "./navbar.module.css";
import LogoutButton from "../../logoutButton/logoutButton";
import GetUserFullName from "@/src/helpers/getUserFullName";
import { Bars3Icon } from "@heroicons/react/16/solid";

interface ProjectSettingsNavbarProps {
  id: string;
}

const ProjectSettingsNavbar: React.FC<ProjectSettingsNavbarProps> = ({
  id,
}) => {
  const userFullName = GetUserFullName();
  return (
    <div className={styles.header}>
      <div className="navbar px-20 bg-slate-50">
        <div className="">
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
              <ul className="menu p-4 w-fit min-h-full bg-slate-50 text-base-content flex flex-col justify-between">
                <div className="">
                  <li>
                    <Link
                      href={`/user/project/${id}/projectSettings/details`}
                      className="text-lg text-black"
                    >
                      Details
                    </Link>
                  </li>
                  <li>
                    <a className="text-lg text-black" href={`/user/project/${id}/projectSettings/roles`}>
                      Permissions and Privileges
                    </a>
                  </li>
                  <li>
                    <Link
                      href={`/user/project/${id}/projectSettings/timeline`}
                      className="text-lg text-black"
                    >
                      Timeline
                    </Link>
                  </li>
                </div>
                <div className="">
                  <li>
                    <Link
                      href={`/user/project/${id}`}
                      className="text-lg text-black"
                    >
                      Back to Project
                    </Link>
                  </li>
                </div>
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
                    <Link href="/user/profile">Profile</Link>
                  </li>
                  <li>
                    <Link href="/user/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link href={`/user/project/${id}`}>Back To Project</Link>
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

export default ProjectSettingsNavbar;
