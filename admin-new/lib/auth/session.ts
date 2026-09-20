import { cookies } from "next/headers";
import { SafeUser } from "@/lib/types/auth";

export const SESSION_COOKIE_NAME = "session_token";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const USER_COOKIE_NAME = "user";

export async function setAuthSession({
  accessToken,
  refreshToken,
  user,
}: {
  accessToken: string;
  refreshToken?: string;
  user?: SafeUser;
}): Promise<void> {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: accessToken,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });

  if (refreshToken) {
    cookieStore.set({
      name: REFRESH_COOKIE_NAME,
      value: refreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });
  }

  if (user) {
    cookieStore.set({
      name: USER_COOKIE_NAME,
      value: JSON.stringify(user),
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });
  }
}

export async function getAuthSession(): Promise<{
  accessToken?: string;
  refreshToken?: string;
  user?: SafeUser;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  const userCookie = cookieStore.get(USER_COOKIE_NAME)?.value;

  let user: SafeUser | undefined;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie) as SafeUser;
    } catch {
      user = undefined;
    }
  }

  return { accessToken, refreshToken, user };
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
}
