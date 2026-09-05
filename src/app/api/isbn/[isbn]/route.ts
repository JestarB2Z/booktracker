import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { lookupIsbn } from "@/lib/isbn-lookup";

export async function GET(_request: Request, { params }: { params: Promise<{ isbn: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { isbn } = await params;
  const result = await lookupIsbn(isbn);

  if (!result.found) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
