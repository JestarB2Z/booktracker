import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const bookSelect = {
  id: true,
  isbn: true,
  title: true,
  author: true,
  coverUrl: true,
  notes: true,
  addedAt: true,
  ownerId: true,
  owner: { select: { id: true, displayName: true } },
} as const;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const ownerParam = searchParams.get("ownerId");
  const isbn = searchParams.get("isbn");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};

  if (ownerParam === "me") {
    where.ownerId = user.id;
  }

  if (isbn) {
    where.isbn = isbn;
  } else if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
    ];
  }

  const books = await prisma.book.findMany({
    where,
    select: bookSelect,
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const book = await prisma.book.create({
    data: {
      title,
      isbn: typeof body?.isbn === "string" && body.isbn.trim() ? body.isbn.trim() : null,
      author: typeof body?.author === "string" && body.author.trim() ? body.author.trim() : null,
      coverUrl: typeof body?.coverUrl === "string" && body.coverUrl.trim() ? body.coverUrl.trim() : null,
      notes: typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim() : null,
      ownerId: user.id,
    },
    select: bookSelect,
  });

  return NextResponse.json(book, { status: 201 });
}
