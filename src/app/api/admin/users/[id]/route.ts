import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

const userSelect = {
  id: true,
  username: true,
  displayName: true,
  isAdmin: true,
  isActive: true,
  createdAt: true,
} as const;

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.displayName === "string" && body.displayName.trim()) {
    data.displayName = body.displayName.trim();
  }
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body?.isAdmin === "boolean") data.isAdmin = body.isAdmin;
  if (typeof body?.password === "string" && body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    data.passwordHash = await hashPassword(body.password);
  }

  const updated = await prisma.user.update({ where: { id }, data, select: userSelect });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === admin.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
