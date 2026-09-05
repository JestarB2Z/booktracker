"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { BookForm, type BookFormValues } from "@/components/BookForm";
import { DuplicateWarningBanner } from "@/components/DuplicateWarningBanner";
import type { BookCardData } from "@/components/BookCard";

const ScannerClient = dynamic(() => import("./ScannerClient").then((m) => m.ScannerClient), {
  ssr: false,
});

type Mode = "choose" | "scanning" | "form";

export default function AddBookPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [prefill, setPrefill] = useState<Partial<BookFormValues>>({});
  const [formKey, setFormKey] = useState(0);
  const [duplicates, setDuplicates] = useState<BookCardData[]>([]);
  const [notFoundNotice, setNotFoundNotice] = useState(false);

  async function checkIsbn(isbn: string) {
    if (!isbn || !/^\d{10}(\d{3})?$/.test(isbn)) return;
    setNotFoundNotice(false);

    const [dupRes, lookupRes] = await Promise.all([
      fetch(`/api/books?isbn=${encodeURIComponent(isbn)}`),
      fetch(`/api/isbn/${encodeURIComponent(isbn)}`),
    ]);

    setDuplicates(dupRes.ok ? await dupRes.json() : []);

    const lookupData = await lookupRes.json();
    if (lookupData.found) {
      setPrefill({
        isbn,
        title: lookupData.title ?? "",
        author: lookupData.author ?? "",
        coverUrl: lookupData.coverUrl ?? "",
      });
    } else {
      setPrefill({ isbn });
      setNotFoundNotice(true);
    }
    setFormKey((k) => k + 1);
    setMode("form");
  }

  function startManual() {
    setPrefill({});
    setDuplicates([]);
    setNotFoundNotice(false);
    setFormKey((k) => k + 1);
    setMode("form");
  }

  async function handleSave(values: BookFormValues) {
    const res = await fetch("/api/books", {
      method: "POST",
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

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Add a Book</h1>

      {mode === "choose" && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setMode("scanning")}
            className="rounded-lg bg-blue-600 py-4 text-lg font-medium text-white"
          >
            📷 Scan barcode
          </button>
          <button
            onClick={startManual}
            className="rounded-lg border border-zinc-300 py-4 text-lg font-medium dark:border-zinc-700"
          >
            ✍️ Enter manually
          </button>
        </div>
      )}

      {mode === "scanning" && (
        <ScannerClient onDetected={checkIsbn} onCancel={() => setMode("choose")} />
      )}

      {mode === "form" && (
        <>
          {notFoundNotice && (
            <p className="text-sm text-zinc-500">
              Couldn&apos;t auto-fill from that ISBN — enter the details manually.
            </p>
          )}
          <DuplicateWarningBanner matches={duplicates} />
          <BookForm
            key={formKey}
            initial={prefill}
            submitLabel={duplicates.length > 0 ? "Add anyway" : "Add book"}
            onSubmit={handleSave}
            onIsbnBlur={checkIsbn}
          />
          <button
            onClick={() => setMode("choose")}
            className="text-sm text-zinc-500 underline"
          >
            Start over
          </button>
        </>
      )}
    </div>
  );
}
