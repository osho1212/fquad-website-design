"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface Group {
  id: string;
  label: string;
}

/**
 * The selected project category lives in the URL (?category=ongoing), so the
 * navbar dropdown, the toggle and a shared link all agree. An unknown or
 * hidden category falls back to the first available one.
 */
export function useActiveGroup(groups: Group[]) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const requested = params.get("category");
  const active =
    groups.find((g) => g.id === requested)?.id ?? groups[0]?.id ?? "";

  const select = useCallback(
    (id: string) => {
      router.replace(`${pathname}?category=${encodeURIComponent(id)}`, {
        scroll: false,
      });
    },
    [router, pathname]
  );

  // Links saved before the toggle existed point at /past-projects#commercial.
  // Honour them once, by moving the choice into the query string.
  useEffect(() => {
    if (requested) return;
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && groups.some((g) => g.id === hash)) select(hash);
  }, [requested, groups, select]);

  return { active, select };
}
