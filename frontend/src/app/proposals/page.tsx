"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProposalCard } from "@/components/ProposalCard";
import { FilterBar } from "@/components/FilterBar";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import type { Proposal, ProposalStatus } from "@/types";

const filters = [
  { value: "all", label: "Todas" },
  { value: "draft", label: "Rascunho" },
  { value: "sent", label: "Enviadas" },
  { value: "accepted", label: "Aceitas" },
  { value: "rejected", label: "Recusadas" },
];

function SkeletonCard() {
  return (
    <div className="skeleton h-[140px] p-6">
      <div className="flex justify-between mb-3">
        <div className="h-5 w-32 rounded bg-surface-hover" />
        <div className="h-5 w-20 rounded bg-surface-hover" />
      </div>
      <div className="h-4 w-48 rounded bg-surface-hover mb-3" />
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded bg-surface-hover" />
        <div className="h-4 w-20 rounded bg-surface-hover" />
      </div>
    </div>
  );
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ proposals: Proposal[] }>("/api/proposals");
      setProposals(data.proposals);
    } catch {
      // Error handled by api client (401 redirect)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const filtered =
    activeFilter === "all"
      ? proposals
      : proposals.filter((p) => p.status === (activeFilter as ProposalStatus));

  return (
    <AppShell>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Propostas
        </h1>
        <Link href="/proposals/new">
          <Button
            variant="primary"
            size="md"
            icon={
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
            }
          >
            Nova proposta
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mb-6">
        <FilterBar
          filters={filters}
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        activeFilter === "all" && proposals.length === 0 ? (
          <EmptyState
            title="Nenhuma proposta ainda"
            description="Crie sua primeira proposta e deixe a IA montar o texto pra você."
            action={
              <Link href="/proposals/new">
                <Button variant="primary" size="md">
                  Criar primeira proposta
                </Button>
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="Nenhuma proposta encontrada"
            description="Não há propostas com esse filtro."
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((proposal, index) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              style={{ animationDelay: `${index * 80}ms` }}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
