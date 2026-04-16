import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
      <svg
        className="mb-4 text-[var(--color-muted)]"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6" y="10" width="36" height="28" rx="4" />
        <path d="M6 18h36" />
        <path d="M16 26h16" />
        <path d="M16 32h10" />
      </svg>
      <h3 className="text-lg font-medium text-[var(--color-foreground)]">
        {title}
      </h3>
      <p className="mt-1 max-w-[40ch] text-center text-sm text-[var(--color-muted)]">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
