"use client";

import { useRouter } from "next/navigation";
import { GlassCard } from "./GlassCard";
import { StatusBadge } from "./StatusBadge";
import type { Proposal } from "@/types";

interface ProposalCardProps {
  proposal: Proposal;
  style?: React.CSSProperties;
}

function isFollowUpPending(proposal: Proposal): boolean {
  if (proposal.status !== "sent") return false;
  const updatedAt = new Date(proposal.updated_at);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return updatedAt < threeDaysAgo;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function ProposalCard({ proposal, style }: ProposalCardProps) {
  const router = useRouter();
  const showFollowUp = isFollowUpPending(proposal);

  return (
    <div style={style} className="animate-fade-in-up">
      <GlassCard
        hoverable
        onClick={() => router.push(`/proposals/${proposal.id}`)}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-[var(--color-foreground)] truncate">
            {proposal.client_name}
          </h3>
          <StatusBadge status={proposal.status} />
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted)] truncate">
          {proposal.segment} &middot; {proposal.service}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-mono text-[var(--color-foreground)]">
            {formatCurrency(proposal.estimated_value)}
          </span>
          <span className="text-[var(--color-muted)]">
            {formatDate(proposal.deadline)}
          </span>
        </div>
        {showFollowUp && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-warning)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-warning)]" />
            Follow-up pendente
          </div>
        )}
      </GlassCard>
    </div>
  );
}
