"use client";
import Link from "next/link";
import styles from "../../indexStyles.module.css";

const UnauthenticatedNavbar = () => {
  return (
    <div className={styles.header}>
      <div className="navbar display-block bg-white">
        <div className="flex-0">
          <h1 className="text-2xl">GroupFlow</h1>
        </div>
        <div className="flex-1">
          <ul className="px-2">
            <li className="space-x-4">
            </li>
          </ul>
        </div>
        <div className="flex-0 space-x-2">
          <button className="btn btn-ghost">
            <Link href="/login">Login</Link>
          </button>
          <button className="btn bg-blue-600 hover:bg-blue-700 text-white border-none hover:border-none">
            <Link href="/signup">Sign-Up</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthenticatedNavbar;
