"use client";

import { useCallback, useEffect, useState } from "react";

type LogsCardProps = {
  title?: string;
  logKey: "main" | "fastify";
};

type LogLine = {
  logId: string;
  timestamp: string;
  level: string;
  message: string;
};

type LogsResponse = {
  entries: LogLine[];
  total: number;
};

const PAGE_SIZES = [50, 100, 200] as const;
const DEFAULT_LIMIT = 50;
const DEFAULT_LEVEL = "info";
const LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;

const LEVEL_STYLES: Record<string, string> = {
  fatal:
    "inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  error:
    "inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  warn: "inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  info: "inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  debug:
    "inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300",
  trace:
    "inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-gray-50 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400",
};

function formatTimestamp(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");

  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to load logs";
}

export function LogsCard({ title, logKey }: LogsCardProps) {
  const [entries, setEntries] = useState<LogLine[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [levelFilter, setLevelFilter] = useState(DEFAULT_LEVEL);
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");

  const [pendingLevel, setPendingLevel] = useState(DEFAULT_LEVEL);
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  const [pendingLimit, setPendingLimit] = useState(DEFAULT_LIMIT);

  const loadLogs = useCallback(
    async (opts: {
      page: number;
      level: string;
      from: string;
      to: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams({ id: logKey });
        query.set("page", String(opts.page));
        query.set("limit", String(limit));
        if (opts.level) query.set("level", opts.level);
        if (opts.from) query.set("from", new Date(opts.from).toISOString());
        if (opts.to) query.set("to", new Date(opts.to).toISOString());

        const response = await fetch(`/api/logs?${query.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load logs (${response.status})`);
        }

        const data = (await response.json()) as LogsResponse;
        setEntries(data.entries ?? []);
        setTotal(data.total ?? 0);
      } catch (loadError) {
        setError(toErrorMessage(loadError));
        setEntries([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [logKey, limit],
  );

  useEffect(() => {
    void loadLogs({ page, level: levelFilter, from: fromFilter, to: toFilter });
  }, [loadLogs, page, levelFilter, fromFilter, toFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function applyFilters() {
    setLevelFilter(pendingLevel);
    setFromFilter(pendingFrom);
    setToFilter(pendingTo);
    setLimit(pendingLimit);
    setPage(1);
  }

  function resetFilters() {
    setPendingLevel(DEFAULT_LEVEL);
    setPendingFrom("");
    setPendingTo("");
    setPendingLimit(DEFAULT_LIMIT);
    setLevelFilter(DEFAULT_LEVEL);
    setFromFilter("");
    setToFilter("");
    setLimit(DEFAULT_LIMIT);
    setPage(1);
  }

  function refresh() {
    void loadLogs({
      page,
      level: levelFilter,
      from: fromFilter,
      to: toFilter,
    });
  }

  return (
    <section className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {title && (
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            {title}
          </h2>
        )}
        <button
          className="inline-flex items-center rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-dark transition hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          onClick={refresh}
        >
          Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-dark-4 dark:text-dark-6">
            Level
          </label>
          <select
            className="rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            value={pendingLevel}
            onChange={(e) => setPendingLevel(e.target.value)}
          >
            <option value="">All</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-dark-4 dark:text-dark-6">
            From
          </label>
          <input
            type="datetime-local"
            className="rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            value={pendingFrom}
            onChange={(e) => setPendingFrom(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-dark-4 dark:text-dark-6">
            To
          </label>
          <input
            type="datetime-local"
            className="rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            value={pendingTo}
            onChange={(e) => setPendingTo(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-dark-4 dark:text-dark-6">
            Page size
          </label>
          <select
            className="rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            value={pendingLimit}
            onChange={(e) => setPendingLimit(Number(e.target.value))}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          onClick={applyFilters}
        >
          Apply
        </button>
        <button
          className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#D34053]/30 bg-[#D34053]/10 px-3 py-2 text-sm text-[#D34053]">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-stroke bg-[#F7F9FC] dark:border-dark-3 dark:bg-dark-2">
        {loading ? (
          <p className="p-4 text-sm text-dark-4 dark:text-dark-6">
            Loading logs...
          </p>
        ) : entries.length === 0 ? (
          <p className="p-4 text-sm text-dark-4 dark:text-dark-6">
            No logs found.
          </p>
        ) : (
          <table className="min-w-full table-auto border-separate border-spacing-0 text-left text-sm text-dark dark:text-white">
            <thead>
              <tr>
                <th className="border-b border-stroke bg-[#F7F9FC] px-3 py-2 font-semibold dark:border-dark-3 dark:bg-dark-2">
                  Timestamp
                </th>
                <th className="border-b border-stroke bg-[#F7F9FC] px-3 py-2 font-semibold dark:border-dark-3 dark:bg-dark-2">
                  Level
                </th>
                <th className="border-b border-stroke bg-[#F7F9FC] px-3 py-2 font-semibold dark:border-dark-3 dark:bg-dark-2">
                  Message
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={`${i}-${entry.timestamp}`}>
                  <td className="border-b border-stroke px-3 py-2 align-top font-mono whitespace-nowrap dark:border-dark-3">
                    {formatTimestamp(entry.timestamp)}
                  </td>
                  <td className="border-b border-stroke px-3 py-2 align-top dark:border-dark-3">
                    <span
                      className={
                        LEVEL_STYLES[entry.level.toLowerCase()] ??
                        "inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700"
                      }
                    >
                      {entry.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="border-b border-stroke px-3 py-2 align-top font-mono dark:border-dark-3">
                    {entry.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-dark-4 dark:text-dark-6">
        <span>
          {total} {total === 1 ? "entry" : "entries"} total
        </span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-dark transition hover:bg-gray-100 disabled:opacity-40 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            className="rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-dark transition hover:bg-gray-100 disabled:opacity-40 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
