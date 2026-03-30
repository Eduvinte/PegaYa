import Link from "next/link";
import { cn } from "@/shared/lib/cn";

type AppFooterProps = {
  className?: string;
};

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/jobs", label: "Vacantes" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Crear cuenta" },
  { href: "/forgot-password", label: "Recuperar clave" },
];

export const AppFooter = ({ className }: AppFooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("relative px-4 pb-5 pt-2 sm:px-6 sm:pb-7 sm:pt-4", className)}>
      <div className="liquid-glass w-full rounded-2xl px-4 py-4 sm:rounded-3xl sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Pegaya Chile</p>
            <p className="text-xs text-muted">Vacantes rapidas para empresas y candidatos.</p>
          </div>

          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {FOOTER_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted transition hover:text-brand-soft">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3 text-xs text-muted sm:mt-5">
          © {currentYear} Pegaya. Mercado laboral chileno.
        </div>
      </div>
    </footer>
  );
};
