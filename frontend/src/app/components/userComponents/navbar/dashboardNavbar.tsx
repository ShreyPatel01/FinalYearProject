"use client";
import React from "react";
import Link from "next/link";
import styles from "./navbar.module.css";
import LogoutButton from "../../logoutButton/logoutButton";
import GetUserFullName from "@/src/helpers/getUserFullName";
import GetAccountRole from "@/src/helpers/getAccountRole";
import { userRoles } from "@/src/models/enums/userRoles";
const DashboardNavbar = () => {
  const userFullName = GetUserFullName();
  const role = GetAccountRole();
  return (
    <div className={styles.header}>
      <div className="navbar px-20 bg-slate-50">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            GroupFlow
          </Link>
        </div>
        <div className="flex-none justify-end">
          <ul className="menu menu-horizontal px-1">
            <li>
              <details>
                <summary>Welcome {userFullName}</summary>
                <ul className="p-1 w-48 items-center bg-slate-50 rounded-t-none z-top">
                  <li>
                    <Link href="/user/profile">Profile</Link>
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

export default DashboardNavbar;
