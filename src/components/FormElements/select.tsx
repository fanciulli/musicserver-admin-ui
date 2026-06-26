"use client";

import { CheckIcon, ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type Item = { value: string; label: string };

type PropsType = {
  label?: string;
  items: Item[];
  prefixIcon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  name?: string;
  /** Controlled value. Provide together with `onChange`. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
};

export function Select({
  items,
  label,
  defaultValue,
  value,
  placeholder,
  prefixIcon,
  className,
  triggerClassName,
  name,
  onChange,
}: PropsType) {
  const id = useId();
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const selectedValue = isControlled ? value : internalValue;

  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedItem = items.find((item) => item.value === selectedValue);

  const commit = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setHighlighted(-1);
  }, []);

  const openDropdown = useCallback(() => {
    setOpen(true);
    setHighlighted(
      Math.max(
        0,
        items.findIndex((item) => item.value === selectedValue),
      ),
    );
  }, [items, selectedValue]);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, closeDropdown]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || highlighted < 0) return;
    const node = listRef.current?.children[highlighted] as
      | HTMLElement
      | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [open, highlighted]);

  const selectItem = (item: Item) => {
    commit(item.value);
    closeDropdown();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          openDropdown();
        } else {
          setHighlighted((prev) => Math.min(items.length - 1, prev + 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) setHighlighted((prev) => Math.max(0, prev - 1));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) {
          openDropdown();
        } else if (highlighted >= 0 && items[highlighted]) {
          selectItem(items[highlighted]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          closeDropdown();
        }
        break;
      case "Tab":
        if (open) closeDropdown();
        break;
    }
  };

  const displayLabel = selectedItem?.label ?? placeholder ?? "";
  const showPlaceholder = !selectedItem;

  return (
    <div className={cn("space-y-3", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-body-sm font-medium text-dark dark:text-white"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {prefixIcon && (
          <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
            {prefixIcon}
          </div>
        )}

        <button
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          onClick={() => (open ? closeDropdown() : openDropdown())}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-stroke bg-transparent px-5.5 py-3 text-left outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary",
            open && "border-primary dark:border-primary",
            showPlaceholder
              ? "text-dark-5 dark:text-dark-6"
              : "text-dark dark:text-white",
            prefixIcon && "pl-11.5",
            triggerClassName,
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronUpIcon
            className={cn(
              "ml-2 shrink-0 transition-transform",
              open ? "rotate-0" : "rotate-180",
            )}
          />
        </button>

        {open && (
          <ul
            id={`${id}-listbox`}
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="absolute left-0 top-full z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-lg border border-stroke bg-white py-1.5 shadow-1 dark:border-dark-3 dark:bg-dark-2 dark:shadow-card"
          >
            {items.map((item, index) => {
              const isSelected = item.value === selectedValue;
              const isHighlighted = index === highlighted;

              return (
                <li
                  key={item.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => selectItem(item)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-5.5 py-2.5 text-body-sm text-dark transition dark:text-white",
                    isHighlighted && "bg-primary/5 dark:bg-white/5",
                    isSelected && "font-medium text-primary dark:text-primary",
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  {isSelected && (
                    <CheckIcon className="ml-2 shrink-0 text-primary" />
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {name && (
          <input type="hidden" name={name} value={selectedValue} readOnly />
        )}
      </div>
    </div>
  );
}
