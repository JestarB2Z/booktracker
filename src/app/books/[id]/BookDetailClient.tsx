"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookForm, type BookFormValues } from "@/components/BookForm";

interface BookDetailClientProps {
  book: {
    id: string;
    isbn: string;
    title: string;
    author: string;
    coverUrl: string;
    notes: string;
    ownerDisplayName: string;
    addedAt: string;
  };
  canEdit: boolean;
}

export function BookDetailClient({ book, canEdit }: BookDetailClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleSave(values: BookFormValues) {
    const res = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to save");
    }
    router.push("/library");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${book.title}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/library");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-3">
        {book.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt="" className="h-40 w-28 self-center rounded object-cover shadow" />
        )}
        <h1 className="text-xl font-semibold">{book.title}</h1>
        {book.author && <p className="text-zinc-500">{book.author}</p>}
        <p className="text-sm text-zinc-400">
          Owned by {book.ownerDisplayName} · added {new Date(book.addedAt).toLocaleDateString()}
        </p>
        {book.notes && <p className="text-sm">{book.notes}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <BookForm initial={book} submitLabel="Save changes" onSubmit={handleSave} />
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-300 py-3 font-medium text-red-600 disabled:opacity-50 dark:border-red-800"
      >
        {deleting ? "Deleting…" : "Delete book"}
      </button>
    </div>
  );
}
