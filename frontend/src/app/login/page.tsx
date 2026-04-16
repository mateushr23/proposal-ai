"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { GlassCard } from "@/components/GlassCard";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Informe seu e-mail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "E-mail invalido";
    }
    if (!password) {
      newErrors.password = "Informe sua senha";
    } else if (password.length < 6) {
      newErrors.password = "A senha precisa ter no minimo 6 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      showToast("Bem-vindo de volta", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "E-mail ou senha incorretos";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel - desktop only */}
      <div className="hidden lg:flex lg:w-[55%] items-center justify-center bg-linear-to-br from-[#2563EB] to-[#1D4ED8] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg aria-hidden="true" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <p className="text-4xl font-semibold text-white tracking-tight">
            ProposalAI
          </p>
          <p className="mt-3 text-lg text-white/80">
            Propostas comerciais com inteligencia artificial
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full lg:w-[45%] items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden text-center">
            <p className="text-2xl font-semibold text-foreground tracking-tight">
              ProposalAI
            </p>
          </div>

          <GlassCard>
            <h1 className="text-xl font-semibold text-foreground mb-6">
              Acesse sua conta
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                onBlur={() => {
                  if (errors.email) validate();
                }}
                error={errors.email}
              />
              <FormField
                label="Senha"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                onBlur={() => {
                  if (errors.password) validate();
                }}
                error={errors.password}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <Link
                href="/register"
                className="text-sm text-accent hover:underline"
              >
                Ainda nao tem conta? Cadastre-se
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
