import { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Essayez d'actualiser la page ou retournez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AutoForge — Trouvez la bonne pièce auto à Dakar" },
      {
        name: "description",
        content:
          "Comparez en temps réel prix, disponibilité et localisation des pièces détachées auto à Dakar. Évitez les déplacements inutiles.",
      },
      { name: "author", content: "AutoForge" },
      { property: "og:title", content: "AutoForge — Trouvez la bonne pièce auto à Dakar" },
      {
        property: "og:description",
        content: "Comparez en temps réel prix, disponibilité et localisation des pièces détachées auto à Dakar. Évitez les déplacements inutiles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AutoForge — Trouvez la bonne pièce auto à Dakar" },
      { name: "twitter:description", content: "Comparez en temps réel prix, disponibilité et localisation des pièces détachées auto à Dakar. Évitez les déplacements inutiles." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f556b1e7-1252-458b-b62a-22f9328a93cf/id-preview-ffa764ea--4fdf57e8-7166-49b0-8c37-09d86bdaae3e.lovable.app-1784748194966.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f556b1e7-1252-458b-b62a-22f9328a93cf/id-preview-ffa764ea--4fdf57e8-7166-49b0-8c37-09d86bdaae3e.lovable.app-1784748194966.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/icon.svg" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("autoforge-dark-mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("autoforge-dark-mode", String(dark));
  }, [dark]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const linkBase =
    "relative text-sm font-medium text-foreground/70 transition-all duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-brand after:transition-all after:duration-300 hover:text-brand hover:after:w-full";
  const mobileLinkBase =
    "block text-base font-medium text-foreground/80 transition-colors duration-200 hover:text-brand px-4 py-3 rounded-lg hover:bg-brand/5";
  const active = { className: "text-brand font-semibold after:w-full" };
  const mobileActive = { className: "text-brand font-semibold bg-brand/10" };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMenu} className="group flex items-center gap-2 transition-transform hover:scale-105">
          <svg className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hdrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1565C0"/>
                <stop offset="100%" stop-color="#0D47A1"/>
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="92" fill="#1565C0" opacity="0.06"/>
            <g transform="translate(100,95)">
              <circle cx="0" cy="0" r="24" fill="none" stroke="#1565C0" stroke-width="3.5" opacity="0.3"/>
              <g fill="#1565C0" opacity="0.4">
                <rect x="-3" y="-30" width="6" height="9" rx="1.5"/>
                <rect x="-3" y="21" width="6" height="9" rx="1.5"/>
                <rect x="-30" y="-3" width="9" height="6" rx="1.5"/>
                <rect x="21" y="-3" width="9" height="6" rx="1.5"/>
                <rect x="15" y="-24" width="6" height="9" rx="1.5" transform="rotate(45,18,-19.5)"/>
                <rect x="-21" y="-24" width="6" height="9" rx="1.5" transform="rotate(-45,-18,-19.5)"/>
                <rect x="15" y="15" width="6" height="9" rx="1.5" transform="rotate(-45,18,19.5)"/>
                <rect x="-21" y="15" width="6" height="9" rx="1.5" transform="rotate(45,-18,19.5)"/>
              </g>
              <circle cx="0" cy="0" r="14" fill="#1565C0" opacity="0.15"/>
              <circle cx="0" cy="0" r="8" fill="#1565C0"/>
            </g>
            <text x="100" y="148" textAnchor="middle" fontFamily="Inter, 'Segoe UI', Arial, sans-serif" fontSize="44" fontWeight="800" fill="#1565C0" letterSpacing="-1">AF</text>
            <rect x="72" y="155" width="56" height="3" rx="1.5" fill="#F59E0B"/>
          </svg>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Auto<span className="text-brand">Forge</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 sm:flex sm:gap-6">
          <Link to="/" activeOptions={{ exact: true }} activeProps={active} className={linkBase}>
            Accueil
          </Link>
          <Link to="/catalogue" activeProps={active} className={linkBase}>
            Catalogue
          </Link>
          <Link to="/saisie" activeProps={active} className={linkBase}>
            Saisie
          </Link>
          <Link to="/fournisseurs" activeProps={active} className={linkBase}>
            Fournisseurs
          </Link>
          <Link to="/contact" activeProps={active} className={linkBase}>
            Contact
          </Link>

          <button
            onClick={() => setDark((d) => !d)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground/70 transition-all duration-200 hover:border-brand hover:text-brand hover:bg-brand/5"
            aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            <span className="text-lg leading-none transition-transform duration-300 hover:rotate-12">
              {dark ? "☀️" : "🌙"}
            </span>
          </button>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-all hover:bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand/30 sm:hidden"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-sm sm:hidden animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-x-0 top-16 z-50 border-b border-border bg-background shadow-lg sm:hidden transition-all duration-300 ${
          menuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={mobileActive}
            className={mobileLinkBase}
            onClick={closeMenu}
          >
            🏠 Accueil
          </Link>
          <Link
            to="/catalogue"
            activeProps={mobileActive}
            className={mobileLinkBase}
            onClick={closeMenu}
          >
            🔧 Catalogue
          </Link>
          <Link
            to="/saisie"
            activeProps={mobileActive}
            className={mobileLinkBase}
            onClick={closeMenu}
          >
            📝 Saisie
          </Link>
          <Link
            to="/fournisseurs"
            activeProps={mobileActive}
            className={mobileLinkBase}
            onClick={closeMenu}
          >
            🏪 Fournisseurs
          </Link>
          <Link
            to="/contact"
            activeProps={mobileActive}
            className={mobileLinkBase}
            onClick={closeMenu}
          >
            ✉️ Contact
          </Link>

          <button
            onClick={() => {
              setDark((d) => !d);
              closeMenu();
            }}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground/80 transition-colors duration-200 hover:text-brand hover:bg-brand/5"
          >
            <span className="text-lg">{dark ? "☀️" : "🌙"}</span>
            {dark ? "Mode clair" : "Mode sombre"}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground/80 dark:bg-card dark:text-foreground/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <svg className="h-8 w-8" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="92" fill="currentColor" opacity="0.08"/>
              <g transform="translate(100,95)">
                <circle cx="0" cy="0" r="24" fill="none" stroke="currentColor" stroke-width="3.5" opacity="0.3"/>
                <g fill="currentColor" opacity="0.4">
                  <rect x="-3" y="-30" width="6" height="9" rx="1.5"/>
                  <rect x="-3" y="21" width="6" height="9" rx="1.5"/>
                  <rect x="-30" y="-3" width="9" height="6" rx="1.5"/>
                  <rect x="21" y="-3" width="9" height="6" rx="1.5"/>
                  <rect x="15" y="-24" width="6" height="9" rx="1.5" transform="rotate(45,18,-19.5)"/>
                  <rect x="-21" y="-24" width="6" height="9" rx="1.5" transform="rotate(-45,-18,-19.5)"/>
                  <rect x="15" y="15" width="6" height="9" rx="1.5" transform="rotate(-45,18,19.5)"/>
                  <rect x="-21" y="15" width="6" height="9" rx="1.5" transform="rotate(45,-18,19.5)"/>
                </g>
                <circle cx="0" cy="0" r="14" fill="currentColor" opacity="0.15"/>
                <circle cx="0" cy="0" r="8" fill="currentColor"/>
              </g>
              <text x="100" y="148" textAnchor="middle" fontFamily="Inter, 'Segoe UI', Arial, sans-serif" fontSize="44" fontWeight="800" fill="currentColor" letterSpacing="-1">AF</text>
              <rect x="72" y="155" width="56" height="3" rx="1.5" fill="#F59E0B" opacity="0.8"/>
            </svg>
            <span className="text-lg font-extrabold">AutoForge</span>
          </div>
          <p className="mt-3 text-sm text-foreground/70">
            La plateforme de référence des pièces détachées automobiles à Dakar.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Contact</h3>
          <ul className="mt-3 space-y-1 text-sm text-foreground/70">
            <li>Route de Diamniadio, Zone Industrielle, Dakar</li>
            <li>contact@autoforge.sn</li>
            <li>+221 33 800 00 00</li>
            <li>
              <a
                href="https://wa.me/221778000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-brand hover:underline"
              >
                <span aria-hidden>💬</span>
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Mentions légales</h3>
          <p className="mt-3 text-sm text-foreground/70">
            © {new Date().getFullYear()} AutoForge SARL — RC Dakar. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
