import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseStatus } from "@/lib/book-status";

const bookSelect = {
  id: true,
  isbn: true,
  title: true,
  author: true,
  genre: true,
  status: true,
  coverUrl: true,
  notes: true,
  addedAt: true,
  ownerId: true,
  owner: { select: { id: true, displayName: true } },
} as const;

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id }, select: bookSelect });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(book);
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.ownerId !== user.id && !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (body?.status !== undefined && parseStatus(body.status) === undefined) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body?.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body?.author === "string") data.author = body.author.trim() || null;
  if (typeof body?.genre === "string") data.genre = body.genre.trim() || null;
  if (parseStatus(body?.status)) data.status = parseStatus(body.status);
  if (typeof body?.isbn === "string") data.isbn = body.isbn.trim() || null;
  if (typeof body?.coverUrl === "string") data.coverUrl = body.coverUrl.trim() || null;
  if (typeof body?.notes === "string") data.notes = body.notes.trim() || null;

  const book = await prisma.book.update({ where: { id }, data, select: bookSelect });
  return NextResponse.json(book);
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.ownerId !== user.id && !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
