import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookDetailClient } from "./BookDetailClient";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const book = await prisma.book.findUnique({
    where: { id },
    include: { owner: { select: { id: true, displayName: true } } },
  });
  if (!book) notFound();

  const canEdit = book.ownerId === user.id || user.isAdmin;

  return (
    <div className="mx-auto max-w-lg p-4">
      <BookDetailClient
        book={{
          id: book.id,
          isbn: book.isbn ?? "",
          title: book.title,
          author: book.author ?? "",
          coverUrl: book.coverUrl ?? "",
          notes: book.notes ?? "",
          ownerDisplayName: book.owner.displayName,
          addedAt: book.addedAt.toISOString(),
        }}
        canEdit={canEdit}
      />
    </div>
  );
}
