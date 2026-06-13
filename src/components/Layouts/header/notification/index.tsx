"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { formatMessageTime } from "@/lib/format-message-time";
import { getNotificationStyle } from "@/lib/notification-style";
import type { Notification } from "@/types/notification";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BellIcon } from "./icons";

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    try {
      const response = await apiFetch("/api/admin/notifications", {
        cache: "no-store",
      });
      if (!response.ok) return;
      setItems((await response.json()) as Notification[]);
    } catch {
      // best-effort: leave the list as-is on transient errors
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = items.filter((item) => !item.read).length;

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    try {
      await apiFetch(`/api/admin/notifications/${id}/read`, { method: "POST" });
    } catch {
      // optimistic update already applied; ignore transient failure
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (open) void load();
      }}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {items.length === 0 && (
            <li className="px-2 py-4 text-center text-sm text-dark-5 dark:text-dark-6">
              No notifications
            </li>
          )}
          {items.slice(0, 5).map((item) => {
            const { Icon, iconClassName } = getNotificationStyle(item.type);
            return (
              <li key={item.id} role="menuitem">
                <Link
                  href="/notifications"
                  onClick={() => {
                    if (!item.read) void markRead(item.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full bg-gray-2 dark:bg-dark-3",
                      iconClassName,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm font-medium text-dark dark:text-white">
                      {item.title}
                    </strong>
                    <span className="block truncate text-sm font-medium text-dark-5 dark:text-dark-6">
                      {item.message}
                    </span>
                    <span className="text-xs text-dark-5 dark:text-dark-6">
                      {formatMessageTime(item.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/notifications"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          See all notifications
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
