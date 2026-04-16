"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import type { Proposal } from "@/types";

interface FormData {
  client_name: string;
  segment: string;
  service: string;
  estimated_value: string;
  deadline: string;
}

const initialForm: FormData = {
  client_name: "",
  segment: "",
  service: "",
  estimated_value: "",
  deadline: "",
};

export default function NewProposalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.client_name.trim()) {
      newErrors.client_name = "Informe o nome do cliente";
    }
    if (!form.segment.trim()) {
      newErrors.segment = "Informe o segmento";
    }
    if (!form.service.trim()) {
      newErrors.service = "Descreva o serviço";
    }
    if (!form.estimated_value) {
      newErrors.estimated_value = "Informe o valor estimado";
    } else if (Number(form.estimated_value) <= 0) {
      newErrors.estimated_value = "O valor precisa ser maior que zero";
    }
    if (!form.deadline) {
      newErrors.deadline = "Selecione o prazo de entrega";
    } else {
      const deadlineDate = new Date(form.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        newErrors.deadline = "A data precisa ser no futuro";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const proposal = await api.post<Proposal>("/api/proposals", {
        client_name: form.client_name.trim(),
        segment: form.segment.trim(),
        service: form.service.trim(),
        estimated_value: Number(form.estimated_value),
        deadline: form.deadline,
      });
      showToast("Proposta criada", "success");
      router.push(`/proposals/${proposal.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar proposta";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Nova proposta
        </h1>
        <p className="mt-1 text-sm text-muted">
          Preencha os dados do cliente para gerar uma proposta
        </p>
      </div>

      {/* Form */}
      <div className="max-w-[640px]">
        <GlassCard>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Two-column row on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                label="Nome do cliente"
                type="text"
                placeholder="Ex: Studio Marca Digital"
                value={form.client_name}
                onChange={(e) => updateField("client_name", (e.target as HTMLInputElement).value)}
                error={errors.client_name}
              />
              <FormField
                label="Segmento"
                type="text"
                placeholder="Ex: Tecnologia, Saúde, Educação"
                value={form.segment}
                onChange={(e) => updateField("segment", (e.target as HTMLInputElement).value)}
                error={errors.segment}
              />
            </div>

            {/* Service - full width textarea */}
            <FormField
              as="textarea"
              label="Serviço oferecido"
              placeholder="Descreva o serviço que sera oferecido ao cliente"
              rows={3}
              value={form.service}
              onChange={(e) => updateField("service", (e.target as HTMLTextAreaElement).value)}
              error={errors.service}
            />

            {/* Two-column row on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                label="Valor estimado"
                type="number"
                placeholder="R$ 0,00"
                min="0"
                step="0.01"
                value={form.estimated_value}
                onChange={(e) => updateField("estimated_value", (e.target as HTMLInputElement).value)}
                error={errors.estimated_value}
              />
              <FormField
                label="Prazo de entrega"
                type="date"
                placeholder="Selecione a data"
                value={form.deadline}
                onChange={(e) => updateField("deadline", (e.target as HTMLInputElement).value)}
                error={errors.deadline}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? "Criando proposta..." : "Criar proposta"}
            </Button>
          </form>
        </GlassCard>
      </div>
    </AppShell>
  );
}
