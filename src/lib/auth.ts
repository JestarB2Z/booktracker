import { getSession } from "./session";

export interface CurrentUser {
  id: string;
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session.userId) return null;
  return { id: session.userId, isAdmin: !!session.isAdmin };
}
