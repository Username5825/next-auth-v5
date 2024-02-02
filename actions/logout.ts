"use server";

import { signOut } from "@/auth";

export const logout = async () => {
  // We can add some servert stuff here before logout user
  await signOut();
};
