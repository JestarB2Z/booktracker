"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookForm, BOOK_STATUS_OPTIONS, type BookFormValues, type BookStatusValue } from "@/components/BookForm";

interface BookDetailClientProps {
  book: {
    id: string;
    isbn: string;
    title: string;
    author: string;
    genre: string;
    status: BookStatusValue;
    coverUrl: string;
    notes: string;
    ownerDisplayName: string;
    addedAt: string;
  };
  canEdit: boolean;
}

const STATUS_LABELS: Record<BookStatusValue, string> = Object.fromEntries(
  BOOK_STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<BookStatusValue, string>;

export function BookDetailClient({ book, canEdit }: BookDetailClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!confirmingDelete) return;
    const timeout = setTimeout(() => setConfirmingDelete(false), 5000);
    return () => clearTimeout(timeout);
  }, [confirmingDelete]);

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

  async function handleConfirmedDelete() {
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
          {STATUS_LABELS[book.status]}
          {book.genre && ` · ${book.genre}`} · Owned by {book.ownerDisplayName} · added{" "}
          {new Date(book.addedAt).toLocaleDateString()}
        </p>
        {book.notes && <p className="text-sm">{book.notes}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <BookForm initial={book} submitLabel="Save changes" onSubmit={handleSave} />

      {!confirmingDelete ? (
        <button
          onClick={() => setConfirmingDelete(true)}
          className="rounded-lg border border-red-300 py-3 font-medium text-red-600 dark:border-red-800"
        >
          Delete book
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmingDelete(false)}
            className="flex-1 rounded-lg border border-zinc-300 py-3 font-medium dark:border-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmedDelete}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 py-3 font-medium text-white disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Yes, delete permanently"}
          </button>
        </div>
      )}
    </div>
  );
}
