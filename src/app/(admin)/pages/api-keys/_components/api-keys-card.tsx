"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  expiresAt: string | null;
};

type CreatedKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  expiresAt: string | null;
};

const DURATION_OPTIONS = [
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "1 year", value: 365 },
  { label: "Never expires", value: null },
] as const;

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function ApiKeysCard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDuration, setCreateDuration] = useState<number | null>(30);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);

  // delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/admin/api-keys", { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to load keys (${response.status})`);
      setKeys((await response.json()) as ApiKey[]);
    } catch (e) {
      setError(toErrorMessage(e, "Failed to load API keys"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  const openCreate = () => {
    setCreateName("");
    setCreateDuration(30);
    setCreateError(null);
    setCreatedKey(null);
    setShowCreate(true);
  };

  const closeCreate = () => {
    setShowCreate(false);
    setCreatedKey(null);
  };

  const submitCreate = async () => {
    if (!createName.trim()) {
      setCreateError("Name is required");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim(), durationDays: createDuration }),
      });
      if (!response.ok) throw new Error(`Create failed (${response.status})`);
      const data = (await response.json()) as CreatedKey;
      setCreatedKey(data);
      await loadKeys();
    } catch (e) {
      setCreateError(toErrorMessage(e, "Failed to create API key"));
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/api-keys/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Delete failed (${response.status})`);
      await loadKeys();
    } catch (e) {
      setError(toErrorMessage(e, "Failed to delete API key"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-dark dark:text-white">API Keys</h2>
          <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
            Manage API keys for authenticating music API requests.
          </p>
        </div>
        <button
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          onClick={openCreate}
        >
          New Key
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#D34053]/30 bg-[#D34053]/10 px-3 py-2 text-sm text-[#D34053]">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[160px]">Name</TableHead>
            <TableHead>Prefix</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="border-[#eee] dark:border-dark-3">
              <TableCell colSpan={5} className="py-6 text-center text-dark-4 dark:text-dark-6">
                Loading keys...
              </TableCell>
            </TableRow>
          ) : keys.length === 0 ? (
            <TableRow className="border-[#eee] dark:border-dark-3">
              <TableCell colSpan={5} className="py-6 text-center text-dark-4 dark:text-dark-6">
                No API keys. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            keys.map((key) => (
              <TableRow key={key.id} className="border-[#eee] dark:border-dark-3">
                <TableCell>
                  <span className="text-dark dark:text-white">{key.name}</span>
                </TableCell>
                <TableCell>
                  <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-dark dark:bg-dark-2 dark:text-white">
                    {key.keyPrefix}…
                  </code>
                </TableCell>
                <TableCell>
                  <span className="text-dark dark:text-white">{formatDate(key.createdAt)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-dark dark:text-white">{formatDate(key.expiresAt)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <button
                      disabled={deletingId === key.id}
                      onClick={() => void deleteKey(key.id)}
                      className="rounded-lg border border-[#D34053] px-3 py-2 text-xs font-semibold text-[#D34053] transition hover:bg-[#D34053]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === key.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center bg-dark/60 px-4"
          onClick={closeCreate}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-key-title"
            className="w-full max-w-md rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            {createdKey === null ? (
              <>
                <h3 id="create-key-title" className="text-lg font-semibold text-dark dark:text-white">
                  Create API Key
                </h3>

                {createError && (
                  <div className="mt-4 rounded-lg border border-[#D34053]/30 bg-[#D34053]/10 px-3 py-2 text-sm text-[#D34053]">
                    {createError}
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-dark-4 dark:text-dark-6">
                      Name
                    </span>
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="e.g. Production Client"
                      className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-dark-4 dark:text-dark-6">
                      Duration
                    </span>
                    <select
                      value={createDuration === null ? "null" : String(createDuration)}
                      onChange={(e) =>
                        setCreateDuration(e.target.value === "null" ? null : Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    >
                      {DURATION_OPTIONS.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    disabled={creating}
                    onClick={closeCreate}
                    className="rounded-lg border border-stroke px-3 py-2 text-xs font-semibold text-dark transition hover:bg-gray-100 disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={creating}
                    onClick={() => void submitCreate()}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 id="create-key-title" className="text-lg font-semibold text-dark dark:text-white">
                  API Key Created
                </h3>
                <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">
                  Copy this key now — it will not be shown again.
                </p>

                <div className="mt-4 rounded-lg border border-[#219653]/30 bg-[#219653]/5 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-dark-4 dark:text-dark-6">
                    {createdKey.name}
                  </p>
                  <code className="block break-all text-sm text-dark dark:text-white">
                    {createdKey.key}
                  </code>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => void navigator.clipboard.writeText(createdKey.key)}
                    className="rounded-lg border border-stroke px-3 py-2 text-xs font-semibold text-dark transition hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                  >
                    Copy to clipboard
                  </button>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeCreate}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
