import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";

export interface SessionData {
  userId: string;
  isAdmin: boolean;
}

export function getSessionOptions(): SessionOptions {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return {
    password: process.env.SESSION_SECRET,
    cookieName: "booktracker_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  // Await a dynamic API (cookies) before touching env vars, so during `next
  // build`'s static-page trial render, Next bails this route into dynamic
  // rendering here rather than crashing on a missing runtime-only secret.
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}
