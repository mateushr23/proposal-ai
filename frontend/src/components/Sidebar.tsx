"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/proposals",
    label: "Propostas",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="2" width="14" height="16" rx="2" />
        <path d="M7 6h6M7 10h6M7 14h4" />
      </svg>
    ),
  },
  {
    href: "/proposals/new",
    label: "Nova proposta",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v6M7 10h6" />
      </svg>
    ),
  },
  {
    href: "/routines",
    label: "Rotinas",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l2.5 2.5" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string): boolean => {
    if (href === "/proposals") {
      return pathname === "/proposals";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 glass z-40">
      <div className="p-6">
        <span className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
          ProposalAI
        </span>
      </div>

      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button)] text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-sm font-medium text-[var(--color-accent)]">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--color-muted)] truncate">
              {user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            aria-label="Sair"
            title="Sair"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 15H4a2 2 0 01-2-2V5a2 2 0 012-2h2" />
              <path d="M11 12l3-3-3-3" />
              <path d="M14 9H7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
