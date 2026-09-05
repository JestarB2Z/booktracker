"use client";

import { useEffect, useState } from "react";
import { BookCard, type BookCardData } from "@/components/BookCard";

function isIsbn(value: string) {
  return /^\d{10}(\d{3})?$/.test(value.replace(/-/g, ""));
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const cleaned = trimmedQuery.replace(/-/g, "");
        const param = isIsbn(cleaned)
          ? `isbn=${encodeURIComponent(cleaned)}`
          : `q=${encodeURIComponent(trimmedQuery)}`;
        const res = await fetch(`/api/books?${param}`, { signal: controller.signal });
        if (res.ok) {
          setResults(await res.json());
          setHasSearched(true);
        }
      } catch {
        // aborted or network error — ignore, next keystroke will retry
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmedQuery]);

  const displayResults = trimmedQuery ? results : [];
  const showEmptyState = trimmedQuery !== "" && hasSearched && !loading && displayResults.length === 0;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Check before you buy</h1>
      <input
        type="search"
        placeholder="Title, author, or ISBN"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-lg border border-zinc-300 px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
        autoFocus
      />

      {loading && <p className="text-sm text-zinc-500">Searching…</p>}

      {showEmptyState && (
        <p className="rounded-lg border border-green-400 bg-green-50 p-3 text-sm text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
          ✅ Nobody owns this yet — safe to buy!
        </p>
      )}

      <div className="flex flex-col gap-2">
        {displayResults.map((book) => (
          <BookCard key={book.id} book={book} showOwner />
        ))}
      </div>
    </div>
  );
}
