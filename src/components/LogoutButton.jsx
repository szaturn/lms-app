"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton({ className = "btn btn-outline" }) {
  return (
    <button className={className} onClick={() => signOut({ callbackUrl: "/login" })}>
      Keluar
    </button>
  );
}
