"use client";

import { apiFetch } from "@/lib/api-client";
import { formatMessageTime } from "@/lib/format-message-time";
import { getNotificationStyle } from "@/lib/notification-style";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function NotificationsCard() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await apiFetch("/api/admin/notifications", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load notifications (${response.status})`);
      }
      setItems((await response.json()) as Notification[]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load notifications",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    try {
      await apiFetch(`/api/admin/notifications/${id}/read`, { method: "POST" });
    } catch {
      // optimistic update already applied
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await apiFetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  const removeAll = async () => {
    setDeletingAll(true);
    setError(null);
    try {
      const results = await Promise.all(
        items.map((item) =>
          apiFetch(`/api/admin/notifications/${item.id}`, { method: "DELETE" }),
        ),
      );
      if (results.some((response) => !response.ok)) {
        throw new Error("Failed to delete some notifications");
      }
      setItems([]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to delete all notifications",
      );
      await load();
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-dark dark:text-white">
          Notifications
        </h2>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => void removeAll()}
            disabled={deletingAll}
            className="rounded-lg bg-red px-4 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-red-dark focus-visible:ring-2 focus-visible:ring-red disabled:opacity-50"
          >
            {deletingAll ? "Deleting…" : "Delete All"}
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm font-medium text-red">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-dark-5 dark:text-dark-6">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-dark-5 dark:text-dark-6">
          No notifications
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const { Icon, iconClassName } = getNotificationStyle(item.type);
            return (
              <li
                key={item.id}
                onClick={() => {
                  if (!item.read) void markRead(item.id);
                }}
                className={cn(
                  "flex items-center gap-4 rounded-lg border border-stroke px-4 py-3 dark:border-dark-3",
                  !item.read && "bg-gray-1 dark:bg-dark-2",
                )}
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full bg-gray-2 dark:bg-dark-3",
                    iconClassName,
                  )}
                >
                  <Icon className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <strong className="block text-sm font-medium text-dark dark:text-white">
                    {item.title}
                  </strong>
                  <span className="block text-sm text-dark-5 dark:text-dark-6">
                    {item.message}
                  </span>
                  <span className="text-xs text-dark-5 dark:text-dark-6">
                    {formatMessageTime(item.createdAt)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void remove(item.id);
                  }}
                  disabled={deletingId === item.id}
                  aria-label="Delete notification"
                  className="shrink-0 rounded-lg p-2 text-dark-5 outline-none hover:bg-gray-2 hover:text-red focus-visible:bg-gray-2 disabled:opacity-50 dark:text-dark-6 dark:hover:bg-dark-3"
                >
                  <Trash2 className="size-5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
