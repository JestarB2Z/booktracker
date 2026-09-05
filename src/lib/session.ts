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
      // Only mark the cookie Secure if the operator confirms HTTPS is
      // actually terminated in front of this app (e.g. a Cloudflare Tunnel
      // with a real hostname). Secure cookies are dropped by browsers over
      // plain HTTP, which is how this app is reached on the LAN or over a
      // raw VPN tunnel (Netbird) — defaulting to secure here would silently
      // break login in those setups.
      secure: process.env.COOKIE_SECURE === "true",
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
