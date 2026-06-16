"use client";

import { apiFetch } from "@/lib/api-client";
import type { Wizard } from "@/types/wizard";
import { useCallback, useEffect, useRef, useState } from "react";

export function WizardModal() {
  const [current, setCurrent] = useState<Wizard | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const hasStarted = useRef(false);

  // Fetches the next wizard to show. The backend returns 204 once every
  // wizard has been shown to the current user, which closes the modal.
  const fetchNext = useCallback(async () => {
    try {
      const response = await apiFetch("/api/admin/wizards/next", {
        cache: "no-store",
      });

      if (response.status === 204) {
        setCurrent(null);
        return;
      }

      if (!response.ok) {
        // Do not trap the user behind a broken modal.
        console.error(`Failed to load wizard (${response.status})`);
        setCurrent(null);
        return;
      }

      setCurrent((await response.json()) as Wizard);
      setStepIndex(0);
    } catch (e) {
      console.error(e instanceof Error ? e.message : "Failed to load wizard");
      setCurrent(null);
    }
  }, []);

  useEffect(() => {
    // Guard against the double-invocation of effects in React strict mode so
    // we only request the first wizard once per session entry.
    if (hasStarted.current) return;
    hasStarted.current = true;
    void fetchNext();
  }, [fetchNext]);

  if (!current || current.steps.length === 0) {
    return null;
  }

  const step = current.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === current.steps.length - 1;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card md:w-1/3">
        {/* Graphics on top */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/admin/wizards/images/${encodeURIComponent(step.image)}`}
          alt=""
          className="aspect-video w-full bg-gray-1 object-cover dark:bg-dark-2"
        />

        {/* Text below */}
        <div className="flex flex-col gap-4 px-6 py-5">
          <p className="text-dark dark:text-white">{step.text}</p>

          <div className="flex items-center justify-between">
            <div>
              {!isFirst && (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => i - 1)}
                  className="rounded-lg border border-stroke px-5 py-2 font-medium text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Previous
                </button>
              )}
            </div>

            <span className="text-sm text-dark-5 dark:text-dark-6">
              {stepIndex + 1} / {current.steps.length}
            </span>

            {isLast ? (
              <button
                type="button"
                onClick={() => void fetchNext()}
                className="rounded-lg bg-primary px-5 py-2 font-medium text-white transition hover:bg-opacity-90"
              >
                Complete
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((i) => i + 1)}
                className="rounded-lg bg-primary px-5 py-2 font-medium text-white transition hover:bg-opacity-90"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
