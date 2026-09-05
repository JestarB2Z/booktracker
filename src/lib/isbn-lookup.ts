export interface IsbnLookupResult {
  found: boolean;
  isbn: string;
  title?: string;
  author?: string;
  coverUrl?: string;
}

export async function lookupIsbn(isbn: string): Promise<IsbnLookupResult> {
  const openLibrary = await lookupOpenLibrary(isbn);
  if (openLibrary) return openLibrary;

  const googleBooks = await lookupGoogleBooks(isbn);
  if (googleBooks) return googleBooks;

  return { found: false, isbn };
}

interface OpenLibraryBook {
  title?: string;
  authors?: { name: string }[];
  cover?: { small?: string; medium?: string; large?: string };
}

async function lookupOpenLibrary(isbn: string): Promise<IsbnLookupResult | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, OpenLibraryBook>;
    const book = data[`ISBN:${isbn}`];
    if (!book?.title) return null;
    return {
      found: true,
      isbn,
      title: book.title,
      author: book.authors?.[0]?.name,
      coverUrl: book.cover?.medium ?? book.cover?.large ?? book.cover?.small,
    };
  } catch {
    return null;
  }
}

interface GoogleBooksVolume {
  title?: string;
  authors?: string[];
  imageLinks?: { thumbnail?: string };
}

async function lookupGoogleBooks(isbn: string): Promise<IsbnLookupResult | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: { volumeInfo: GoogleBooksVolume }[] };
    const info = data.items?.[0]?.volumeInfo;
    if (!info?.title) return null;
    return {
      found: true,
      isbn,
      title: info.title,
      author: info.authors?.[0],
      coverUrl: info.imageLinks?.thumbnail,
    };
  } catch {
    return null;
  }
}
