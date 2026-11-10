import React from "react";
import Link from "next/link";

/**
 * Action styles shared by the journal, team and awards pages.
 *
 * `.btn-primary` hard-codes a 10px font in globals.css (declared after the
 * Tailwind utilities, so `text-xs` loses to it) — `!text-[11px]` restores the
 * 11px floor, and `min-h-[44px]` lifts it to a comfortable touch target.
 */
const PRIMARY = "btn-primary !text-[11px] min-h-[44px] uppercase font-medium";

const TEXT =
  "inline-flex items-center min-h-[44px] px-1 text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white transition-colors";

export interface ActionSpec {
  label: string;
  /** Internal path, mailto: or absolute URL. Ignored when `startProject` is set. */
  href?: string;
  /** Opens the global "Start a project" modal (see data-start-project). */
  startProject?: boolean;
}

function Anchor({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/** The metallic plate. */
export function PrimaryAction({ action }: { action: ActionSpec }) {
  if (action.startProject) {
    return (
      <button type="button" data-start-project="true" className={PRIMARY}>
        {action.label}
      </button>
    );
  }
  return (
    <Anchor href={action.href ?? "/contact"} className={PRIMARY}>
      {action.label}
    </Anchor>
  );
}

/**
 * A quiet text action. The animated underline lives on an inner span so it
 * hugs the text; the outer element supplies the 44px hit area.
 */
export function TextAction({ action }: { action: ActionSpec }) {
  const label = <span className="fq-link">{action.label}</span>;
  if (action.startProject) {
    return (
      <button type="button" data-start-project="true" className={TEXT}>
        {label}
      </button>
    );
  }
  return (
    <Anchor href={action.href ?? "/contact"} className={TEXT}>
      {label}
    </Anchor>
  );
}
