"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import type { RoutineLog } from "@/types";

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "-";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function StatusBadgeLog({ status }: { status: RoutineLog["status"] }) {
  const config: Record<RoutineLog["status"], { label: string; classes: string }> = {
    running: {
      label: "Em execucao",
      classes: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] animate-pulse-soft",
    },
    completed: {
      label: "Concluida",
      classes: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    },
    failed: {
      label: "Falhou",
      classes: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
    },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center rounded-[var(--radius-badge)] px-2 py-0.5 text-xs font-medium ${c.classes}`}>
      {c.label}
    </span>
  );
}

function TriggerBadge({ triggeredBy }: { triggeredBy: RoutineLog["triggered_by"] }) {
  const config: Record<RoutineLog["triggered_by"], { label: string; classes: string }> = {
    cron: {
      label: "Automatica",
      classes: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
    },
    manual: {
      label: "Manual",
      classes: "bg-[var(--color-accent-light)] text-[var(--color-accent)]",
    },
  };
  const c = config[triggeredBy];
  return (
    <span className={`inline-flex items-center rounded-[var(--radius-badge)] px-2 py-0.5 text-xs font-medium ${c.classes}`}>
      {c.label}
    </span>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-0 divide-y divide-[var(--color-border)]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 px-4">
          <div className="h-4 w-32 rounded bg-[var(--color-surface-hover)]" />
          <div className="h-4 w-20 rounded bg-[var(--color-surface-hover)]" />
          <div className="h-4 w-20 rounded bg-[var(--color-surface-hover)]" />
          <div className="h-4 w-12 rounded bg-[var(--color-surface-hover)]" />
          <div className="h-4 w-28 rounded bg-[var(--color-surface-hover)]" />
          <div className="h-4 w-16 rounded bg-[var(--color-surface-hover)]" />
        </div>
      ))}
    </div>
  );
}

export default function RoutinesPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ logs: RoutineLog[] }>("/api/routines/logs");
      setLogs(data.logs);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function handleTrigger() {
    setConfirmOpen(false);
    setTriggering(true);
    try {
      await api.post("/api/routines/follow-up/trigger");
      showToast("Rotina de follow-up iniciada", "success");
      // Refresh logs after a short delay
      setTimeout(fetchLogs, 1000);
    } catch {
      showToast("Erro ao iniciar rotina. Tente novamente.", "error");
    } finally {
      setTriggering(false);
    }
  }

  return (
    <AppShell>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Rotinas de follow-up
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Rotina automatica roda diariamente as 09:00
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          loading={triggering}
          onClick={() => setConfirmOpen(true)}
          icon={
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5,3 13,8 5,13" />
            </svg>
          }
        >
          {triggering ? "Iniciando..." : "Rodar agora"}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <GlassCard padding="p-0">
          <SkeletonRows />
        </GlassCard>
      ) : logs.length === 0 ? (
        <EmptyState
          title="Nenhuma execucao registrada"
          description="A rotina roda automaticamente todo dia as 09:00 ou voce pode iniciar manualmente."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <GlassCard padding="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left">
                      <th className="px-4 py-3 font-medium text-[var(--color-muted)]">Rotina</th>
                      <th className="px-4 py-3 font-medium text-[var(--color-muted)]">Disparada por</th>
                      <th className="px-4 py-3 font-medium text-[var(--color-muted)]">Status</th>
                      <th className="px-4 py-3 font-medium text-[var(--color-muted)]">Propostas afetadas</th>
                      <th className="px-4 py-3 font-medium text-[var(--color-muted)]">Inicio</th>
                      <th className="px-4 py-3 font-medium text-[var(--color-muted)]">Duracao</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-[var(--color-surface-hover)] transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-[var(--color-foreground)]">
                          {log.routine_name}
                        </td>
                        <td className="px-4 py-3">
                          <TriggerBadge triggeredBy={log.triggered_by} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadgeLog status={log.status} />
                        </td>
                        <td className="px-4 py-3 font-mono text-[var(--color-foreground)]">
                          {log.proposals_affected}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-muted)]">
                          {formatDateTime(log.started_at)}
                        </td>
                        <td className="px-4 py-3 font-mono text-[var(--color-muted)]">
                          {formatDuration(log.started_at, log.finished_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {logs.map((log) => (
              <GlassCard key={log.id} padding="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-[var(--color-foreground)]">
                    {log.routine_name}
                  </span>
                  <StatusBadgeLog status={log.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--color-muted)]">Disparada por: </span>
                    <TriggerBadge triggeredBy={log.triggered_by} />
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Afetadas: </span>
                    <span className="font-mono">{log.proposals_affected}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Inicio: </span>
                    <span>{formatDateTime(log.started_at)}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Duracao: </span>
                    <span className="font-mono">{formatDuration(log.started_at, log.finished_at)}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Rodar rotina de follow-up"
        message="Isso vai disparar a rotina de follow-up agora. Propostas com status 'Enviada' ha mais de 3 dias serao processadas. Continuar?"
        confirmLabel="Rodar agora"
        cancelLabel="Cancelar"
        onConfirm={handleTrigger}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}
