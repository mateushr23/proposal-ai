"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/proposals", label: "Propostas" },
  { href: "/proposals/new", label: "Nova proposta" },
  { href: "/routines", label: "Rotinas" },
];

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="lg:hidden">
      <header className="fixed top-0 left-0 right-0 z-50 h-14 glass flex items-center justify-between px-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[var(--color-foreground)] p-1"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>

        <span className="text-base font-semibold text-[var(--color-foreground)]">
          ProposalAI
        </span>

        <div className="w-8" />
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--color-background)] pt-14">
          <nav className="flex flex-col p-6 gap-2">
            {navItems.map((item, index) => {
              const isActive =
                item.href === "/proposals"
                  ? pathname === "/proposals"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-4 py-3 rounded-[var(--radius-button)] text-base font-medium
                    transition-all duration-200 animate-fade-in-up
                    ${
                      isActive
                        ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                        : "text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
                    }
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="mt-4 px-4 py-3 rounded-[var(--radius-button)] text-base font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/5 text-left transition-all animate-fade-in-up"
              style={{ animationDelay: `${navItems.length * 100}ms` }}
            >
              Sair
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
