"use server";

import { redirect } from "next/navigation";
import { setAdminAuthCookie } from "../../lib/admin-auth";

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  if (password !== expectedPassword) {
    redirect("/admin/login?error=1");
  }

  await setAdminAuthCookie();
  redirect("/admin");
}
