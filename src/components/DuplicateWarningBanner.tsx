interface DuplicateMatch {
  id: string;
  title: string;
  addedAt: string;
  owner: { displayName: string };
}

export function DuplicateWarningBanner({ matches }: { matches: DuplicateMatch[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200">
      <p className="font-medium">⚠️ Already in the library</p>
      <ul className="mt-1 list-disc pl-4">
        {matches.map((m) => (
          <li key={m.id}>
            <strong>{m.owner.displayName}</strong> owns &ldquo;{m.title}&rdquo; (added{" "}
            {new Date(m.addedAt).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
