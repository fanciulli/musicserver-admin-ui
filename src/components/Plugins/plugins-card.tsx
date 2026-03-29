"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PluginStatus = "loaded" | "started" | "error" | "disabled" | "unknown";

type PluginItem = {
  id: string;
  name: string;
  category: string;
  status: PluginStatus;
};

type PluginAction = "start" | "stop" | "scan";

type ActionState = {
  pluginId: string;
  action: PluginAction;
};

type PluginVariableType = "string" | "number" | "boolean";

type PluginVariableEntry = {
  name: string;
  type: PluginVariableType;
};

type PluginSettingsResponse = {
  pluginId: string;
  settings: {
    variables: Array<Record<string, string>>;
    values: Record<string, unknown>;
  };
};

function canScan(plugin: PluginItem): boolean {
  return (
    plugin.category === "music_services" || plugin.category === "music_sources"
  );
}

function statusClass(status: PluginStatus): string {
  if (status === "started") {
    return "bg-[#219653]/[0.08] text-[#219653]";
  }

  if (status === "unknown") {
    return "bg-[#FFA70B]/[0.08] text-[#FFA70B]";
  }

  if (status === "error") {
    return "bg-[#D34053]/[0.08] text-[#D34053]";
  }

  return "bg-slate-500/10 text-slate-600 dark:text-slate-300";
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function normalizeVariableType(value: string): PluginVariableType {
  const lower = value.trim().toLowerCase();

  if (lower === "number" || lower === "int" || lower === "float") {
    return "number";
  }

  if (lower === "boolean" || lower === "bool") {
    return "boolean";
  }

  return "string";
}

function parsePluginVariables(
  rawVariables: Array<Record<string, string>>,
): PluginVariableEntry[] {
  const parsed: PluginVariableEntry[] = [];

  for (const variableRecord of rawVariables) {
    for (const [name, type] of Object.entries(variableRecord)) {
      parsed.push({
        name,
        type: normalizeVariableType(type),
      });
    }
  }

  return parsed;
}

function formatVariableLabel(variableName: string): string {
  return variableName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

export function PluginsCard() {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState | null>(null);
  const [configurePlugin, setConfigurePlugin] = useState<PluginItem | null>(
    null,
  );
  const [configureVariables, setConfigureVariables] = useState<
    PluginVariableEntry[]
  >([]);
  const [configureValues, setConfigureValues] = useState<
    Record<string, unknown>
  >({});
  const [configureLoading, setConfigureLoading] = useState<boolean>(false);
  const [configureSaving, setConfigureSaving] = useState<boolean>(false);
  const [configureError, setConfigureError] = useState<string | null>(null);
  const cancelConfigureRef = useRef<HTMLButtonElement | null>(null);

  const loadPlugins = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch("/api/admin/plugins", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load plugins (${response.status})`);
      }

      const data = (await response.json()) as PluginItem[];
      setPlugins(data);
    } catch (loadError) {
      setError(toErrorMessage(loadError, "Failed to load plugins"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlugins();
  }, [loadPlugins]);

  const busyLabel = useMemo(() => {
    if (actionState === null) {
      return null;
    }

    if (actionState.action === "start") {
      return "Starting...";
    }

    if (actionState.action === "stop") {
      return "Stopping...";
    }

    return "Scanning...";
  }, [actionState]);

  const runAction = useCallback(
    async (plugin: PluginItem, action: PluginAction) => {
      setActionState({ pluginId: plugin.id, action });
      setError(null);

      try {
        const endpoint =
          action === "start"
            ? "/api/admin/plugins/start"
            : action === "stop"
              ? "/api/admin/plugins/stop"
              : "/api/admin/scan";

        const payload =
          action === "scan" ? { id: plugin.id } : { pluginId: plugin.id };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Action ${action} failed (${response.status})`);
        }

        await loadPlugins();
      } catch (actionError) {
        setError(toErrorMessage(actionError, `Action ${action} failed`));
      } finally {
        setActionState(null);
      }
    },
    [loadPlugins],
  );

  useEffect(() => {
    if (configurePlugin !== null) {
      cancelConfigureRef.current?.focus();
    }
  }, [configurePlugin]);

  useEffect(() => {
    if (configurePlugin === null) {
      setConfigureVariables([]);
      setConfigureValues({});
      setConfigureError(null);
      setConfigureLoading(false);
      setConfigureSaving(false);
      return;
    }

    let isMounted = true;

    const loadPluginConfiguration = async () => {
      setConfigureLoading(true);
      setConfigureError(null);

      try {
        const response = await fetch(
          `/api/admin/plugins/${encodeURIComponent(configurePlugin.id)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load plugin configuration (${response.status})`,
          );
        }

        const payload = (await response.json()) as PluginSettingsResponse;
        if (!isMounted) {
          return;
        }

        setConfigureVariables(parsePluginVariables(payload.settings.variables));
        setConfigureValues(payload.settings.values ?? {});
      } catch (configError) {
        if (!isMounted) {
          return;
        }

        setConfigureError(
          toErrorMessage(configError, "Failed to load plugin configuration"),
        );
      } finally {
        if (isMounted) {
          setConfigureLoading(false);
        }
      }
    };

    void loadPluginConfiguration();

    return () => {
      isMounted = false;
    };
  }, [configurePlugin]);

  const updateConfigureValue = useCallback(
    (fieldName: string, fieldType: PluginVariableType, rawValue: string) => {
      setConfigureValues((previousValues) => {
        if (fieldType === "number") {
          return {
            ...previousValues,
            [fieldName]: rawValue === "" ? "" : Number(rawValue),
          };
        }

        return {
          ...previousValues,
          [fieldName]: rawValue,
        };
      });
    },
    [],
  );

  const savePluginConfiguration = useCallback(async () => {
    if (configurePlugin === null) {
      return;
    }

    setConfigureSaving(true);
    setConfigureError(null);

    try {
      const response = await fetch(
        `/api/admin/plugins/${encodeURIComponent(configurePlugin.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            settings: configureValues,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to save plugin configuration (${response.status})`,
        );
      }

      await loadPlugins();
      setConfigurePlugin(null);
    } catch (saveError) {
      setConfigureError(
        toErrorMessage(saveError, "Failed to save plugin configuration"),
      );
    } finally {
      setConfigureSaving(false);
    }
  }, [configurePlugin, configureValues, loadPlugins]);

  return (
    <section className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            Installed Plugins
          </h2>
          <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
            Manage plugin lifecycle and scans.
          </p>
        </div>

        <button
          className="inline-flex items-center rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-dark transition hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          onClick={() => {
            setLoading(true);
            void loadPlugins();
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

      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[190px]">Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow className="border-[#eee] dark:border-dark-3">
              <TableCell
                colSpan={4}
                className="py-6 text-center text-dark-4 dark:text-dark-6"
              >
                Loading plugins...
              </TableCell>
            </TableRow>
          ) : plugins.length === 0 ? (
            <TableRow className="border-[#eee] dark:border-dark-3">
              <TableCell
                colSpan={4}
                className="py-6 text-center text-dark-4 dark:text-dark-6"
              >
                No plugins found.
              </TableCell>
            </TableRow>
          ) : (
            plugins.map((plugin) => {
              const isBusy = actionState?.pluginId === plugin.id;

              return (
                <TableRow
                  key={plugin.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell>
                    <p className="text-dark dark:text-white">{plugin.name}</p>
                    <p className="mt-1 text-xs text-dark-4 dark:text-dark-6">
                      {plugin.id}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {plugin.category}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
                        statusClass(plugin.status),
                      )}
                    >
                      {plugin.status}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {plugin.status === "started" ? (
                        <>
                          <button
                            disabled={isBusy}
                            onClick={() => {
                              setConfigurePlugin(plugin);
                            }}
                            className="rounded-lg border border-stroke px-3 py-2 text-xs font-semibold text-dark transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                          >
                            Configure
                          </button>
                          <button
                            disabled={isBusy || !canScan(plugin)}
                            onClick={() => {
                              void runAction(plugin, "scan");
                            }}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy && actionState?.action === "scan"
                              ? busyLabel
                              : "Scan"}
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={() => {
                              void runAction(plugin, "stop");
                            }}
                            className="rounded-lg border border-[#D34053] px-3 py-2 text-xs font-semibold text-[#D34053] transition hover:bg-[#D34053]/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy && actionState?.action === "stop"
                              ? busyLabel
                              : "Stop"}
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={isBusy}
                          onClick={() => {
                            void runAction(plugin, "start");
                          }}
                          className="rounded-lg border border-[#219653] px-3 py-2 text-xs font-semibold text-[#219653] transition hover:bg-[#219653]/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy && actionState?.action === "start"
                            ? busyLabel
                            : "Start"}
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {configurePlugin !== null && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center bg-dark/60 px-4"
          onClick={() => {
            setConfigurePlugin(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="configure-plugin-title"
            className="w-full max-w-lg rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <h3
              id="configure-plugin-title"
              className="text-lg font-semibold text-dark dark:text-white"
            >
              Configure plugin {configurePlugin.name}
            </h3>

            {configureError && (
              <div className="mt-4 rounded-lg border border-[#D34053]/30 bg-[#D34053]/10 px-3 py-2 text-sm text-[#D34053]">
                {configureError}
              </div>
            )}

            {configureLoading ? (
              <p className="mt-4 text-sm text-dark-4 dark:text-dark-6">
                Loading configuration...
              </p>
            ) : configureVariables.length === 0 ? (
              <p className="mt-4 text-sm text-dark-4 dark:text-dark-6">
                No configurable fields found.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {configureVariables.map((variable) => {
                  const value = configureValues[variable.name];

                  if (variable.type === "boolean") {
                    return (
                      <label key={variable.name} className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-dark-4 dark:text-dark-6">
                          {formatVariableLabel(variable.name)}
                        </span>
                        <select
                          value={value === true ? "true" : "false"}
                          onChange={(event) => {
                            setConfigureValues((previousValues) => ({
                              ...previousValues,
                              [variable.name]: event.target.value === "true",
                            }));
                          }}
                          className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      </label>
                    );
                  }

                  return (
                    <label key={variable.name} className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-dark-4 dark:text-dark-6">
                        {formatVariableLabel(variable.name)}
                      </span>
                      <input
                        type={variable.type === "number" ? "number" : "text"}
                        value={
                          value === undefined || value === null
                            ? ""
                            : String(value)
                        }
                        onChange={(event) => {
                          updateConfigureValue(
                            variable.name,
                            variable.type,
                            event.target.value,
                          );
                        }}
                        className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      />
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                ref={cancelConfigureRef}
                disabled={configureSaving}
                className="rounded-lg border border-stroke px-3 py-2 text-xs font-semibold text-dark transition hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                onClick={() => {
                  setConfigurePlugin(null);
                }}
              >
                Cancel
              </button>
              <button
                disabled={configureLoading || configureSaving}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                onClick={() => {
                  void savePluginConfiguration();
                }}
              >
                {configureSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
