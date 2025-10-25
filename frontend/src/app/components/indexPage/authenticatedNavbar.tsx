"use client";
import Link from "next/link";
import styles from "../../indexStyles.module.css";
import LogoutButton from "../logoutButton/logoutButton";

import GetUserFullName from "@/src/helpers/getUserFullName";
import GetAccountRole from "@/src/helpers/getAccountRole";
import { userRoles } from "@/src/models/enums/userRoles";

const AuthenticatedNavbar = () => {
  const userFullName = GetUserFullName();
  const role = GetAccountRole();
  return (
    <div className={styles.header}>
      <div className="navbar display-block bg-white px-20">
        {/* Icon */}
        <button className="flex-0 btn btn-ghost">
          <p className="text-2xl font-bold">GroupFlow</p>
        </button>
        {/* Links */}
        <div className="flex-1">
          <ul className="px-20">
            <li className="space-x-12">
            </li>
          </ul>
        </div>
        {/* Menu */}
        <div className="flex none justify-end">
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

export default AuthenticatedNavbar;
