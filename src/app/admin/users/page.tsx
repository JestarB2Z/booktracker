"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    })();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, password, isAdmin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create user");
        return;
      }
      setUsername("");
      setDisplayName("");
      setPassword("");
      setIsAdmin(false);
      await loadUsers();
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(user: AdminUser) {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    await loadUsers();
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Delete account "${user.username}"? Their books will also be deleted.`)) return;
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    await loadUsers();
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold">Family Accounts</h1>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="text-sm font-medium">Add a family member</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
        <input
          type="text"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
        <input
          type="password"
          placeholder="Initial password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          Grant admin access
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-blue-600 py-2 font-medium text-white disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create account"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div>
              <p className="font-medium">
                {user.displayName}{" "}
                {user.isAdmin && <span className="text-xs text-blue-600">admin</span>}
                {!user.isActive && <span className="text-xs text-red-500"> · disabled</span>}
              </p>
              <p className="text-xs text-zinc-500">@{user.username}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleActive(user)} className="text-xs text-zinc-500 underline">
                {user.isActive ? "Disable" : "Enable"}
              </button>
              <button onClick={() => handleDelete(user)} className="text-xs text-red-600 underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
