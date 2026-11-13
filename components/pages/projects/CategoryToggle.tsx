"use client";

import { Suspense, useEffect, useRef } from "react";
import { useActiveGroup, type Group } from "./useActiveGroup";

export interface ToggleGroup extends Group {
  count: number;
}

function ToggleView({
  groups,
  active,
  onSelect,
}: {
  groups: ToggleGroup[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // On very narrow screens the row can still overflow; keep the selected tab in view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Project categories"
      className="flex w-full sm:w-auto sm:inline-flex max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-white/20 bg-[#121212]/80 backdrop-blur-2xl font-display"
      style={{ fontFamily: "var(--font-good-times)" }}
    >
      {groups.map((g) => {
        const selected = g.id === active;
        return (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`tab-${g.id}`}
            aria-selected={selected}
            aria-controls="projects-panel"
            onClick={() => onSelect(g.id)}
            className={`fq-tap flex-1 sm:flex-none whitespace-nowrap px-2.5 sm:px-7 min-h-11 text-[9px] min-[400px]:text-[10px] sm:text-[11px] tracking-[0.1em] min-[400px]:tracking-[0.16em] sm:tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer ${
              selected
                ? "bg-white text-black font-bold"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {g.label}
            <span
              className={`hidden sm:inline ml-2 text-[9px] tracking-[0.1em] ${
                selected ? "text-black/50" : "text-white/35"
              }`}
            >
              {String(g.count).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LiveToggle({ groups }: { groups: ToggleGroup[] }) {
  const { active, select } = useActiveGroup(groups);
  return <ToggleView groups={groups} active={active} onSelect={select} />;
}

/**
 * Switches between the project categories. Only categories that have projects
 * are passed in, so Ongoing never shows as an empty tab. With a single
 * category there is nothing to switch, so it renders nothing.
 */
export function CategoryToggle({ groups }: { groups: ToggleGroup[] }) {
  if (groups.length < 2) return null;
  return (
    // useSearchParams needs a Suspense boundary; until it resolves, the page
    // is server-rendered on the default (first) category.
    <Suspense
      fallback={<ToggleView groups={groups} active={groups[0].id} onSelect={() => {}} />}
    >
      <LiveToggle groups={groups} />
    </Suspense>
  );
}
