"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, computeSessionToken } from "@/lib/auth";

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!process.env.SITE_PASSWORD || password !== process.env.SITE_PASSWORD) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=1`);
  }

  const token = await computeSessionToken(password);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect(next || "/");
}
