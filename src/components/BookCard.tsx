import Link from "next/link";
import { BOOK_STATUS_OPTIONS, type BookStatusValue } from "@/components/BookForm";

export interface BookCardData {
  id: string;
  title: string;
  author: string | null;
  genre: string | null;
  status: BookStatusValue;
  coverUrl: string | null;
  isbn: string | null;
  addedAt: string;
  owner: { displayName: string };
}

const STATUS_LABELS: Record<BookStatusValue, string> = Object.fromEntries(
  BOOK_STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<BookStatusValue, string>;

export function BookCard({ book, showOwner }: { book: BookCardData; showOwner?: boolean }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="flex gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
    >
      {book.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={book.coverUrl} alt="" className="h-20 w-14 shrink-0 rounded object-cover" />
      ) : (
        <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-zinc-100 text-2xl dark:bg-zinc-800">
          📖
        </div>
      )}
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <p className="truncate font-medium">{book.title}</p>
        {book.author && <p className="truncate text-sm text-zinc-500">{book.author}</p>}
        <p className="truncate text-xs text-zinc-400">
          {STATUS_LABELS[book.status]}
          {book.genre && ` · ${book.genre}`}
        </p>
        {showOwner && (
          <p className="text-xs text-zinc-400">Owned by {book.owner.displayName}</p>
        )}
      </div>
    </Link>
  );
}
