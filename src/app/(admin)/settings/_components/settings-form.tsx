"use client";

import { apiFetch } from "@/lib/api-client";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ConfigType = "string" | "boolean";

type ConfigItem = {
  key: string;
  label: string;
  type: ConfigType;
  value: string | boolean;
};

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function SettingsForm() {
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const loadConfig = useCallback(async () => {
    setLoadError(null);

    try {
      const response = await apiFetch("/api/admin/config", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load configuration (${response.status})`);
      }

      const data = (await response.json()) as ConfigItem[];
      setItems(data);
      setValues(
        Object.fromEntries(data.map((item) => [item.key, item.value])),
      );
    } catch (error) {
      setLoadError(toErrorMessage(error, "Failed to load configuration"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const setValue = useCallback((key: string, value: string | boolean) => {
    setSavedNotice(false);
    setValues((previous) => ({ ...previous, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setModalError(null);
    setSavedNotice(false);

    try {
      // PUT returns no body: 2xx on success, 400 (without details) when one or
      // more values are invalid. Reload current config from GET after saving.
      const response = await apiFetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });

      if (!response.ok) {
        setModalError(
          response.status === 400
            ? "One or more configuration values are invalid."
            : `Failed to save configuration (${response.status})`,
        );
        return;
      }

      setSavedNotice(true);
      await loadConfig();
    } catch (error) {
      setModalError(toErrorMessage(error, "Failed to save configuration"));
    } finally {
      setSaving(false);
    }
  }, [values, loadConfig]);

  return (
    <section className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-dark dark:text-white">
          Settings
        </h2>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-[#D34053]/30 bg-[#D34053]/10 px-3 py-2 text-sm text-[#D34053]">
          {loadError}
        </div>
      )}

      {savedNotice && (
        <div className="mb-4 rounded-lg border border-[#219653]/30 bg-[#219653]/10 px-3 py-2 text-sm text-[#219653]">
          Configuration saved.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Loading configuration...
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-dark-4 dark:text-dark-6">
          No configuration parameters found.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const value = values[item.key];

            if (item.type === "boolean") {
              return (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <span className="w-1/3 shrink-0 text-sm font-semibold text-dark dark:text-white">
                    {item.label}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={value === true}
                      onChange={(event) =>
                        setValue(item.key, event.target.checked)
                      }
                    />
                    <div className="h-8 w-14 rounded-full bg-gray-3 peer-checked:bg-primary dark:bg-[#5A616B]" />
                    <div className="absolute left-1 top-1 size-6 rounded-full bg-white transition peer-checked:translate-x-full" />
                  </div>
                </label>
              );
            }

            return (
              <label
                key={item.key}
                className="flex items-center gap-3"
              >
                <span className="w-1/3 shrink-0 text-sm font-semibold text-dark dark:text-white">
                  {item.label}
                </span>
                <input
                  type="text"
                  className="w-2/3 rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) => setValue(item.key, event.target.value)}
                />
              </label>
            );
          })}

          <div className="pt-2">
            <button
              disabled={saving}
              onClick={() => void save()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {modalError !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-99999 flex items-center justify-center bg-dark/60 px-4"
            onClick={() => setModalError(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="config-error-title"
              className="w-full max-w-md rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
              onClick={(event) => event.stopPropagation()}
            >
              <h3
                id="config-error-title"
                className="text-lg font-semibold text-[#D34053]"
              >
                Invalid configuration
              </h3>
              <p className="mt-3 text-sm text-dark dark:text-white">
                {modalError}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setModalError(null)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
