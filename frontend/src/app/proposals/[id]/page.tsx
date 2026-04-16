"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { SectionEditor } from "@/components/SectionEditor";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import type { Proposal, ProposalContent } from "@/types";

const SECTION_ORDER: (keyof ProposalContent)[] = [
  "introduction",
  "scope",
  "investment",
  "next_steps",
];

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

function SkeletonDetail() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-[200px] p-6" />
      <div className="skeleton h-[200px] p-6" />
      <div className="skeleton h-[200px] p-6" />
      <div className="skeleton h-[200px] p-6" />
    </div>
  );
}

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editedContent, setEditedContent] = useState<ProposalContent | null>(null);

  const fetchProposal = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Proposal>(`/api/proposals/${id}`);
      setProposal(data);
      if (data.content) {
        setEditedContent({ ...data.content });
      }
    } catch {
      showToast("Erro ao carregar proposta", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const data = await api.post<{ content: ProposalContent }>(
        `/api/proposals/${id}/generate`
      );
      setProposal((prev) =>
        prev ? { ...prev, content: data.content } : prev
      );
      setEditedContent({ ...data.content });
      showToast("Proposta gerada com sucesso", "success");
    } catch {
      showToast("Erro ao gerar proposta. Tente novamente.", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!editedContent) return;
    setSaving(true);
    try {
      const data = await api.put<Proposal>(`/api/proposals/${id}`, {
        content: editedContent,
      });
      setProposal(data);
      showToast("Proposta salva", "success");
    } catch {
      showToast("Erro ao salvar. Tente novamente.", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleSectionSave(section: keyof ProposalContent, content: string) {
    setEditedContent((prev) => (prev ? { ...prev, [section]: content } : prev));
  }

  async function handleExportPDF() {
    if (!proposal || !editedContent) return;
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = 20;

      // Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ProposalAI", margin, y);
      y += 12;

      doc.setFontSize(16);
      doc.text(proposal.client_name, margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 113, 108);
      doc.text(
        `${proposal.segment} | ${proposal.service} | ${formatCurrency(proposal.estimated_value)} | Prazo: ${formatDate(proposal.deadline)}`,
        margin,
        y
      );
      y += 6;
      doc.text(`Status: ${proposal.status} | Data: ${formatDate(proposal.created_at)}`, margin, y);
      y += 12;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Sections
      const sectionLabels: Record<string, string> = {
        introduction: "Introducao",
        scope: "Escopo do projeto",
        investment: "Investimento",
        next_steps: "Proximos passos",
      };

      doc.setTextColor(28, 25, 23);
      for (const section of SECTION_ORDER) {
        const text = editedContent[section];
        if (!text) continue;

        // Check if we need a new page
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(sectionLabels[section] ?? section, margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        for (const line of lines as string[]) {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 5;
        }
        y += 8;
      }

      const clientSlug = proposal.client_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const dateSlug = new Date().toISOString().split("T")[0];
      doc.save(`proposal-${clientSlug}-${dateSlug}.pdf`);
      showToast("PDF exportado", "success");
    } catch {
      showToast("Erro ao exportar PDF. Tente novamente.", "error");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <SkeletonDetail />
      </AppShell>
    );
  }

  if (!proposal) {
    return (
      <AppShell>
        <EmptyState
          title="Proposta nao encontrada"
          description="A proposta que voce procura nao existe ou foi removida."
        />
      </AppShell>
    );
  }

  const hasContent = proposal.content !== null;

  return (
    <AppShell>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {proposal.client_name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {proposal.segment} &middot; {proposal.service}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            loading={exporting}
            onClick={handleExportPDF}
            disabled={!hasContent}
            icon={
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v2h8v-2" />
                <path d="M8 2v8" />
                <path d="M5 7l3 3 3-3" />
              </svg>
            }
          >
            {exporting ? "Exportando..." : "Exportar PDF"}
          </Button>
          <StatusBadge status={proposal.status} />
        </div>
      </div>

      {/* Content */}
      {!hasContent && !editedContent ? (
        <GlassCard className="flex flex-col items-center py-16">
          <EmptyState
            title="Proposta ainda sem conteudo"
            description="Clique no botao abaixo para gerar as secoes da proposta com inteligencia artificial."
            action={
              <Button
                variant="primary"
                size="lg"
                loading={generating}
                onClick={handleGenerate}
                icon={
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 2l1.5 4.5L15 8l-4.5 1.5L9 14l-1.5-4.5L3 8l4.5-1.5z" />
                  </svg>
                }
              >
                {generating ? "Gerando proposta..." : "Gerar com IA"}
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {/* Generate / Regenerate button */}
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="md"
              loading={generating}
              onClick={handleGenerate}
              className={generating ? "relative overflow-hidden shimmer-effect" : ""}
              icon={
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2l1.2 3.6L13 7l-3.8 1.4L8 12l-1.2-3.6L3 7l3.8-1.4z" />
                </svg>
              }
            >
              {generating ? "Gerando proposta..." : "Gerar novamente"}
            </Button>
          </div>

          {/* Section editors */}
          {editedContent &&
            SECTION_ORDER.map((section) => (
              <SectionEditor
                key={section}
                title={section}
                content={editedContent[section]}
                onSave={(content) => handleSectionSave(section, content)}
              />
            ))}

          {/* Save all button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="lg"
              loading={saving}
              onClick={handleSave}
            >
              {saving ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
