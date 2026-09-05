"use client";

import { useState } from "react";

export const BOOK_STATUS_OPTIONS = [
  { value: "TO_READ", label: "To read" },
  { value: "READING", label: "Reading" },
  { value: "READ", label: "Read" },
] as const;

export type BookStatusValue = (typeof BOOK_STATUS_OPTIONS)[number]["value"];

export interface BookFormValues {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  status: BookStatusValue;
  coverUrl: string;
  notes: string;
}

interface BookFormProps {
  initial?: Partial<BookFormValues>;
  submitLabel: string;
  onSubmit: (values: BookFormValues) => Promise<void>;
  onIsbnBlur?: (isbn: string) => void;
  children?: React.ReactNode;
}

export function BookForm({ initial, submitLabel, onSubmit, onIsbnBlur, children }: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>({
    isbn: initial?.isbn ?? "",
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    genre: initial?.genre ?? "",
    status: initial?.status ?? "TO_READ",
    coverUrl: initial?.coverUrl ?? "",
    notes: initial?.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {values.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={values.coverUrl} alt="" className="h-40 w-28 self-center rounded object-cover shadow" />
      )}

      <label className="flex flex-col gap-1 text-sm">
        ISBN
        <input
          type="text"
          inputMode="numeric"
          value={values.isbn}
          onChange={(e) => update("isbn", e.target.value)}
          onBlur={(e) => onIsbnBlur?.(e.target.value.trim())}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {children}

      <label className="flex flex-col gap-1 text-sm">
        Title *
        <input
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Author
        <input
          type="text"
          value={values.author}
          onChange={(e) => update("author", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Genre
        <input
          type="text"
          value={values.genre}
          onChange={(e) => update("genre", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Status
        <select
          value={values.status}
          onChange={(e) => update("status", e.target.value as BookStatusValue)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {BOOK_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cover image URL
        <input
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={values.coverUrl}
          onChange={(e) => update("coverUrl", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-lg bg-blue-600 py-3 font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
