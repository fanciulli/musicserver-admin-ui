"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type LogsCardProps = {
  logKey: "main" | "fastify";
};

type MainColumn = "level" | "time" | "hostname" | "msg";
type FastifyColumn =
  | "level"
  | "time"
  | "hostname"
  | "msg"
  | "reqId"
  | "req.method"
  | "req.url"
  | "res.statusCode";

const MAIN_COLUMNS: MainColumn[] = ["level", "time", "hostname", "msg"];
const FASTIFY_COLUMNS: FastifyColumn[] = [
  "level",
  "time",
  "hostname",
  "msg",
  "reqId",
  "req.method",
  "req.url",
  "res.statusCode",
];

type LogRow = Record<string, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function formatDateTime(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  let date: Date | null = null;

  if (typeof value === "number") {
    date = new Date(value);
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    const asNumber = Number(trimmed);
    date = Number.isNaN(asNumber) ? new Date(trimmed) : new Date(asNumber);
  }

  if (!date || Number.isNaN(date.getTime())) {
    return toCellValue(value);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
}

function formatLogLevel(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericLevel =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  if (!Number.isNaN(numericLevel)) {
    if (numericLevel === 60) return "FATAL";
    if (numericLevel === 50) return "ERROR";
    if (numericLevel === 40) return "WARN";
    if (numericLevel === 30) return "INFO";
    if (numericLevel === 20) return "DEBUG";
    if (numericLevel === 10) return "TRACE";
  }

  return toCellValue(value);
}

function formatColumnLabel(column: string): string {
  const withoutPrefixes = column.replace(/^req\./, "").replace(/^res\./, "");
  if (!withoutPrefixes) {
    return "";
  }

  return withoutPrefixes.charAt(0).toUpperCase() + withoutPrefixes.slice(1);
}

function getFieldValue(
  log: Record<string, unknown>,
  fieldPath: string,
): string {
  const parts = fieldPath.split(".");
  let current: unknown = log;

  for (const part of parts) {
    if (!isRecord(current) || !(part in current)) {
      return "";
    }

    current = current[part];
  }

  if (fieldPath === "time") {
    return formatDateTime(current);
  }

  if (fieldPath === "level") {
    return formatLogLevel(current);
  }

  return toCellValue(current);
}

function toRow(log: Record<string, unknown>, fields: string[]): LogRow {
  const row: LogRow = {};
  for (const field of fields) {
    row[field] = getFieldValue(log, field);
  }

  return row;
}

function parseJsonLogLines(text: string): Record<string, unknown>[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .reduce<Record<string, unknown>[]>((logs, line) => {
      try {
        const parsed = JSON.parse(line) as unknown;
        if (isRecord(parsed)) {
          logs.push(parsed);
        }
      } catch {
        // Ignore malformed lines and keep rendering valid JSON log lines.
      }

      return logs;
    }, []);
}

function parseMainRows(text: string): LogRow[] {
  return parseJsonLogLines(text).map((log) => toRow(log, MAIN_COLUMNS));
}

function parseFastifyRows(text: string): LogRow[] {
  const logs = parseJsonLogLines(text);
  const rows: LogRow[] = [];
  const rowIndexByReqId = new Map<string, number>();

  for (const log of logs) {
    const row = toRow(log, FASTIFY_COLUMNS);
    const reqId = row.reqId;

    if (!reqId) {
      rows.push(row);
      continue;
    }

    const existingIndex = rowIndexByReqId.get(reqId);
    if (existingIndex === undefined) {
      rowIndexByReqId.set(reqId, rows.length);
      rows.push(row);
      continue;
    }

    const existingRow = rows[existingIndex];
    if (!existingRow["res.statusCode"] && row["res.statusCode"]) {
      existingRow["res.statusCode"] = row["res.statusCode"];
    }
  }

  return rows;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to load logs";
}

export function LogsCard({ logKey }: LogsCardProps) {
  const [logsText, setLogsText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({ id: logKey });
      const response = await fetch(`/api/logs?${query.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load logs (${response.status})`);
      }

      const bodyText = await response.text();
      setLogsText(bodyText);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [logKey]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const placeholder = useMemo(() => {
    if (loading) {
      return "Loading logs...";
    }

    if (error) {
      return "Unable to load logs.";
    }

    if (!logsText.trim()) {
      return "No logs available.";
    }

    return null;
  }, [error, loading, logsText]);

  const columns = useMemo(
    () => (logKey === "fastify" ? FASTIFY_COLUMNS : MAIN_COLUMNS),
    [logKey],
  );

  const rows = useMemo(
    () =>
      logKey === "fastify"
        ? parseFastifyRows(logsText)
        : parseMainRows(logsText),
    [logKey, logsText],
  );

  const emptyParsedData = useMemo(() => {
    return (
      !loading && !error && logsText.trim().length > 0 && rows.length === 0
    );
  }, [error, loading, logsText, rows.length]);

  return (
    <section className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="mb-5 flex items-center justify-end gap-3">
        <button
          className="inline-flex items-center rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-dark transition hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          onClick={() => {
            void loadLogs();
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#D34053]/30 bg-[#D34053]/10 px-3 py-2 text-sm text-[#D34053]">
          {error}
        </div>
      )}

      <div className="max-h-[65vh] overflow-auto rounded-lg border border-stroke bg-[#F7F9FC] p-4 dark:border-dark-3 dark:bg-dark-2">
        {placeholder ? (
          <p className="text-sm text-dark-4 dark:text-dark-6">{placeholder}</p>
        ) : emptyParsedData ? (
          <p className="text-sm text-dark-4 dark:text-dark-6">
            No valid JSON log lines found.
          </p>
        ) : (
          <table className="min-w-full table-auto border-separate border-spacing-0 text-left text-sm text-dark dark:text-white">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="sticky top-0 border-b border-stroke bg-[#F7F9FC] px-3 py-2 font-semibold dark:border-dark-3 dark:bg-dark-2"
                  >
                    {formatColumnLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${row.time}-${row.reqId ?? ""}`}>
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column}`}
                      className="border-b border-stroke px-3 py-2 align-top font-mono dark:border-dark-3"
                    >
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
