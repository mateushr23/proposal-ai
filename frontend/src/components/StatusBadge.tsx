import type { ProposalStatus } from "@/types";

interface StatusBadgeProps {
  status: ProposalStatus;
}

const statusConfig: Record<
  ProposalStatus,
  { label: string; classes: string }
> = {
  draft: {
    label: "Rascunho",
    classes: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
  },
  sent: {
    label: "Enviada",
    classes: "bg-[var(--color-accent-light)] text-[var(--color-accent)]",
  },
  accepted: {
    label: "Aceita",
    classes: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  },
  rejected: {
    label: "Recusada",
    classes: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-(--radius-badge) px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
