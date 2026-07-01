import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_AUTH_COOKIE = "admin_auth";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_AUTH_COOKIE)?.value === "true";
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function setAdminAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_AUTH_COOKIE,
    value: "true",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
