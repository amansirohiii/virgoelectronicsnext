"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { controlFrame, cx } from "@/components/ui/control";
import { FieldShell, fieldIds, type FieldChrome } from "@/components/ui/field-shell";
import { CheckIcon, ChevronIcon } from "@/components/ui/icons";

export type SelectProps = FieldChrome & {
  /** Posted with the form through a hidden input */
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  /** Shown on the button while nothing is chosen */
  placeholder?: string;
  /** Adds a first option with this label that sets the value back to "" */
  emptyOption?: string;
  /** Called when focus leaves the control and its list */
  onBlur?: () => void;
  disabled?: boolean;
  /** Lists longer than this get a filter box at the top */
  filterAbove?: number;
};

type Item = { value: string; label: string };

/** Height the open list needs: filter box plus the list's max height (max-h-64). */
const POPOVER_HEIGHT = 320;
const TYPEAHEAD_RESET_MS = 600;

const isPrintable = (e: KeyboardEvent) => e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey;

/** Items whose label contains the query, those starting with it first. */
function filterItems(items: Item[], query: string): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const starts = items.filter((i) => i.label.toLowerCase().startsWith(q));
  const contains = items.filter((i) => !i.label.toLowerCase().startsWith(q) && i.label.toLowerCase().includes(q));
  return [...starts, ...contains];
}

/**
 * Our own select: a button that shows the choice and opens a listbox.
 * Follows the WAI-ARIA select-only combobox pattern. Focus stays on the button
 * and the active option is announced through aria-activedescendant; long lists
 * move focus into a filter box that does the same.
 */
export function Select({
  id,
  label,
  optional,
  hint,
  error,
  className,
  name,
  value,
  onValueChange,
  options,
  placeholder = "Choose one",
  emptyOption,
  onBlur,
  disabled = false,
  filterAbove = 10,
}: SelectProps) {
  const items: Item[] = [
    ...(emptyOption === undefined ? [] : [{ value: "", label: emptyOption }]),
    ...options.map((o) => ({ value: o, label: o })),
  ];
  const filterable = items.length > filterAbove;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [above, setAbove] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const typed = useRef({ text: "", at: 0 });
  // Opened by a finger: leave the filter box unfocused so the phone keyboard does not cover the list.
  const openedByTouch = useRef(false);

  const { labelId, describedBy } = fieldIds(id, hint, error);
  const listId = `${id}-listbox`;
  const optionId = (v: string) => `${id}-option-${items.findIndex((i) => i.value === v)}`;
  const visible = filterable ? filterItems(items, query) : items;
  const selected = items.find((i) => i.value === value);
  const activeId = open && active !== null && visible.some((i) => i.value === active) ? optionId(active) : undefined;

  const openList = (activeValue: string = value) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setAbove(below < POPOVER_HEIGHT && rect.top > below);
    }
    setQuery("");
    setActive(items.some((i) => i.value === activeValue) ? activeValue : (items[0]?.value ?? null));
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    setQuery("");
    if (returnFocus) buttonRef.current?.focus();
  };

  const choose = (v: string) => {
    if (v !== value) onValueChange(v);
    close(true);
  };

  /** Next option whose label starts with the letters typed in quick succession. */
  const matchTyped = (key: string): string | null => {
    const now = Date.now();
    const t = typed.current;
    t.text = now - t.at > TYPEAHEAD_RESET_MS ? key.toLowerCase() : t.text + key.toLowerCase();
    t.at = now;
    const sameLetter = [...t.text].every((c) => c === t.text[0]);
    const search = sameLetter ? t.text.charAt(0) : t.text;
    const from = visible.findIndex((i) => i.value === (open ? active : value));
    // A repeated letter steps to the next match; a longer word may stay on the current one.
    const start = sameLetter ? from + 1 : Math.max(from, 0);
    const ordered = [...visible.slice(start), ...visible.slice(0, start)];
    return ordered.find((i) => i.label.toLowerCase().startsWith(search))?.value ?? null;
  };

  const moveActive = (index: number) => {
    const item = visible[Math.min(Math.max(index, 0), visible.length - 1)];
    if (item) setActive(item.value);
  };

  /** Keys while the list is open, from the button or from the filter box. */
  const handleListKey = (e: KeyboardEvent, fromFilter: boolean) => {
    const index = visible.findIndex((i) => i.value === active);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(index + 1);
        return;
      case "ArrowUp":
        e.preventDefault();
        moveActive(index - 1);
        return;
      case "PageDown":
        e.preventDefault();
        moveActive(index + 6);
        return;
      case "PageUp":
        e.preventDefault();
        moveActive(index - 6);
        return;
      case "Home":
      case "End":
        if (fromFilter) return; // moves the caret in the filter box
        e.preventDefault();
        moveActive(e.key === "Home" ? 0 : visible.length - 1);
        return;
      case "Enter":
        e.preventDefault();
        if (active !== null && index >= 0) choose(active);
        else close(true);
        return;
      case " ":
        if (fromFilter) return;
        e.preventDefault();
        if (active !== null && index >= 0) choose(active);
        return;
      case "Escape":
        e.preventDefault();
        close(true);
        return;
      case "Tab":
        // Step back to the button first so Tab moves on from the select itself.
        if (fromFilter) buttonRef.current?.focus();
        close(false);
        return;
      default:
        if (!fromFilter && isPrintable(e)) {
          const match = matchTyped(e.key);
          if (match !== null) setActive(match);
        }
    }
  };

  const handleButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    openedByTouch.current = false;
    if (open) {
      handleListKey(e, false);
      return;
    }
    const last = items[items.length - 1]?.value;
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        openList();
        return;
      case "ArrowUp":
      case "End":
        e.preventDefault();
        openList(e.key === "End" || !value ? last : value);
        return;
      case "Home":
        e.preventDefault();
        openList(items[0]?.value);
        return;
      default:
        if (!isPrintable(e)) return;
        e.preventDefault();
        if (filterable) {
          openList();
          setQuery(e.key);
          setActive(filterItems(items, e.key)[0]?.value ?? null);
        } else {
          openList(matchTyped(e.key) ?? value);
        }
    }
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && wrapperRef.current?.contains(e.relatedTarget)) return;
    if (open) close(false);
    onBlur?.();
  };

  // Long lists: move focus into the filter box with the caret at the end.
  useEffect(() => {
    const input = filterRef.current;
    if (!open || !input || openedByTouch.current) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [open]);

  // Keep the active option in view inside the list's own scroll.
  useEffect(() => {
    const list = listRef.current;
    const option = activeId ? document.getElementById(activeId) : null;
    if (!list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [activeId]);

  // A press anywhere outside closes the list (Safari does not always move focus on click).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !wrapperRef.current?.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <div ref={wrapperRef} onBlur={handleBlur} className="relative">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-activedescendant={filterable ? undefined : activeId}
          aria-invalid={error ? true : undefined}
          aria-required={optional ? undefined : true}
          disabled={disabled}
          onPointerDown={(e) => {
            openedByTouch.current = e.pointerType === "touch";
          }}
          onClick={() => {
            if (open) {
              close(true);
              return;
            }
            buttonRef.current?.focus();
            openList();
          }}
          onKeyDown={handleButtonKey}
          // Firefox fires a click on Space key-up; the key-down already handled it.
          onKeyUp={(e) => {
            if (e.key === " ") e.preventDefault();
          }}
          className={cx(controlFrame(Boolean(error)), "min-h-[3.1875rem] cursor-pointer gap-3 px-3.5 text-left")}
        >
          <span className={cx("min-w-0 flex-1 self-center truncate", !selected || selected.value === "" ? "text-steel" : undefined)}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronIcon
            className={cx(
              "size-5 shrink-0 self-center text-steel transition-transform duration-150 motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
        </button>

        <div
          hidden={!open}
          className={cx(
            "absolute inset-x-0 z-30 border-[1.5px] border-ink bg-white shadow-[0_12px_28px_-16px_rgb(22_24_27/0.45)]",
            "transition-[opacity,translate] duration-150 ease-out starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none",
            above ? "bottom-full mb-1" : "top-full mt-1",
          )}
        >
          {filterable ? (
            <div className="border-b border-line p-2">
              <input
                ref={filterRef}
                type="text"
                role="combobox"
                tabIndex={-1}
                aria-label="Type to filter the list"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={activeId}
                autoComplete="off"
                spellCheck={false}
                placeholder="Type to filter"
                value={query}
                onChange={(e) => {
                  const q = e.currentTarget.value;
                  setQuery(q);
                  setActive(filterItems(items, q)[0]?.value ?? null);
                }}
                onKeyDown={(e) => handleListKey(e, true)}
                className="block min-h-11 w-full border-[1.5px] border-line bg-white px-3 text-base text-ink outline-none transition-[border-color] duration-150 placeholder:text-steel focus:border-ink motion-reduce:transition-none"
              />
            </div>
          ) : null}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            tabIndex={-1}
            // Keep focus on the button or filter box while an option is pressed.
            onMouseDown={(e) => e.preventDefault()}
            className="relative max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {visible.map((item) => {
              const isSelected = item.value === value;
              const isActive = item.value === active;
              return (
                <li
                  key={item.value || "empty"}
                  id={optionId(item.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(item.value)}
                  onPointerMove={() => {
                    if (!isActive) setActive(item.value);
                  }}
                  className={cx(
                    "flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2",
                    isActive && "bg-paper",
                    isSelected && "font-semibold",
                    item.value === "" && "text-steel",
                  )}
                >
                  <span>{item.label}</span>
                  {isSelected ? <CheckIcon className="size-5 shrink-0" /> : null}
                </li>
              );
            })}
          </ul>
          {visible.length === 0 ? <p className="px-3.5 py-3 text-steel">Nothing matches</p> : null}
        </div>

        <input type="hidden" name={name} value={value} />
      </div>
    </FieldShell>
  );
}
