"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export async function getSeededUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return users;
}

export async function login(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const cookieStore = await cookies();
  cookieStore.set("user_id", user.id, { path: "/" });
  cookieStore.set("user_role", user.role, { path: "/" });
  cookieStore.set("user_name", user.name || user.email, { path: "/" });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("user_id");
  cookieStore.delete("user_role");
  cookieStore.delete("user_name");

  redirect("/");
}

export async function getLoggedInUser() {
  const cookieStore = await cookies();
  const id = cookieStore.get("user_id")?.value;
  const role = cookieStore.get("user_role")?.value as Role | undefined;
  const name = cookieStore.get("user_name")?.value;

  if (!id) {
    return null;
  }

  return { id, role, name };
}
