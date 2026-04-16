"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AuthGuard } from "@/lib/auth";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Sidebar />
        <TopBar />
        <main className="lg:ml-60 pt-14 lg:pt-0">
          <div className="mx-auto max-w-[1120px] px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
