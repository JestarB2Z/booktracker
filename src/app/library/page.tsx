"use client";

import { useEffect, useState } from "react";
import { BookCard, type BookCardData } from "@/components/BookCard";

export default function LibraryPage() {
  const [books, setBooks] = useState<BookCardData[] | null>(null);

  useEffect(() => {
    fetch("/api/books?ownerId=me")
      .then((res) => res.json())
      .then(setBooks);
  }, []);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">My Books</h1>

      {books === null && <p className="text-sm text-zinc-500">Loading…</p>}
      {books?.length === 0 && (
        <p className="text-sm text-zinc-500">
          No books yet — tap &ldquo;Add&rdquo; below to scan or enter your first one.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {books?.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
