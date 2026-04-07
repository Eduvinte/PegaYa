"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { LogoutButton } from "@/features/auth/logout/components/LogoutButton";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import type { AppShellUser } from "@/features/app-shell/services/getCurrentAppUser";
import { cn } from "@/shared/lib/cn";
import { Button, LightParticles } from "@/shared/ui";

type AppShellProps = {
  user: AppShellUser;
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
};

const CANDIDATE_NAV_ITEMS: NavItem[] = [
  { href: "/jobs", label: "Feed de vacantes" },
  { href: "/applications", label: "Mis postulaciones" },
  { href: "/messages", label: "Mensajes" },
  { href: "/profile", label: "Mi perfil" },
];

const COMPANY_NAV_ITEMS: NavItem[] = [
  { href: "/jobs", label: "Feed de vacantes" },
  { href: "/company/jobs/new", label: "Publicar vacante" },
  { href: "/company/jobs", label: "Mis vacantes" },
  { href: "/messages", label: "Mensajes" },
  { href: "/company/profile", label: "Perfil empresa" },
];

const COMPANY_ONBOARDING_NAV_ITEMS: NavItem[] = [
  { href: "/jobs", label: "Feed de vacantes" },
  { href: "/company/onboarding", label: "Crear empresa" },
];

export const AppShell = ({ user, children }: AppShellProps) => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = useMemo(
    () => {
      if (user.role === "candidate") {
        return CANDIDATE_NAV_ITEMS;
      }

      if (!user.companyId) {
        return COMPANY_ONBOARDING_NAV_ITEMS;
      }

      return COMPANY_NAV_ITEMS;
    },
    [user.role, user.companyId]
  );

  const displayName = user.fullName ?? user.companyName ?? user.email.split("@")[0] ?? "Usuario";
  const initials = getInitials(displayName);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LightParticles level="low" className="opacity-45" />

      <div className="relative z-10 flex min-h-screen">
        <aside
          className={cn(
            "liquid-glass hidden border-r border-white/10 p-3 transition-all duration-300 lg:flex lg:h-screen lg:flex-col",
            isExpanded ? "lg:w-72" : "lg:w-24"
          )}
        >
          <SidebarContent
            user={user}
            displayName={displayName}
            initials={initials}
            pathname={pathname}
            navigationItems={navigationItems}
            compact={!isExpanded}
            onToggle={() => setIsExpanded((current) => !current)}
          />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Abrir menu"
              >
                Menu
              </Button>
              <p className="text-sm text-muted">{displayName}</p>
            </div>

            <div className="ml-auto">
              <NotificationCenter />
            </div>
          </header>

          <main className="w-full px-4 pb-6 pt-1 sm:px-6 lg:px-8 lg:pb-8 lg:pt-4">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#021218]/75 backdrop-blur-[2px]"
            aria-label="Cerrar menu"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="liquid-glass-strong absolute inset-y-0 left-0 z-50 w-[86%] max-w-[340px] p-3">
            <SidebarContent
              user={user}
              displayName={displayName}
              initials={initials}
              pathname={pathname}
              navigationItems={navigationItems}
              compact={false}
              onToggle={() => setIsMobileOpen(false)}
              mobile
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
};

type SidebarContentProps = {
  user: AppShellUser;
  displayName: string;
  initials: string;
  pathname: string;
  navigationItems: NavItem[];
  compact: boolean;
  onToggle: () => void;
  mobile?: boolean;
};

const SidebarContent = ({
  user,
  displayName,
  initials,
  pathname,
  navigationItems,
  compact,
  onToggle,
  mobile = false,
}: SidebarContentProps) => {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        {compact ? (
          <span className="mx-auto text-sm font-semibold uppercase tracking-[0.2em] text-brand-soft">
            PG
          </span>
        ) : (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-soft">Pegaya</p>
            <p className="text-xs text-muted">Panel privado</p>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="liquid-focus-ring rounded-xl border border-white/20 bg-white/5 px-2 py-1 text-xs text-muted hover:text-foreground"
          aria-label={mobile ? "Cerrar menu" : compact ? "Expandir menu" : "Colapsar menu"}
        >
          {mobile ? "X" : compact ? ">>" : "<<"}
        </button>
      </div>

      <div className={cn("mb-5 rounded-2xl border border-white/15 bg-white/[0.04] p-3", compact && "p-2")}>
        <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt="Avatar usuario"
              className="h-11 w-11 rounded-full border border-white/20 object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-brand/20 text-sm font-semibold text-brand-soft">
              {initials}
            </div>
          )}

          {!compact ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-brand-soft">
                {user.role === "company" ? "Empresa" : "Candidato"}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const active = isRouteActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "liquid-focus-ring block rounded-xl border px-3 py-2 text-sm transition",
                active
                  ? "border-brand/55 bg-brand/15 text-brand-soft"
                  : "border-white/15 bg-white/[0.03] text-muted hover:border-white/30 hover:text-foreground",
                compact && "px-2 text-center text-xs"
              )}
            >
              {compact ? item.label.slice(0, 3) : item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <LogoutButton fullWidth={!compact} compact={compact} />
      </div>
    </div>
  );
};

const isRouteActive = (pathname: string, href: string) => {
  if (href === "/company/jobs" && pathname.startsWith("/company/jobs/new")) {
    return false;
  }

  if (pathname === href) {
    return true;
  }

  return href !== "/" && pathname.startsWith(`${href}/`);
};

const getInitials = (value: string) => {
  const words = value.trim().split(/\s+/).slice(0, 2);
  const text = words.map((word) => word.charAt(0)).join("");
  return text.toUpperCase() || "US";
};
