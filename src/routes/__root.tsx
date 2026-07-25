import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { Toaster } from "sonner";
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
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // silent — PWA is optional
      });
    }
  }, []);
  return null;
}

function FloatingWhatsApp() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="https://wa.me/221778000000?text=Bonjour%20AutoForge%20!%20J%27ai%20besoin%20d%27une%20pi%C3%A8ce%20auto%20%C3%A0%20Dakar."
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-xl hover:rotate-6 ${
        show ? "translate-y-0 opacity-100 scale-100 animate-pulse-ring" : "translate-y-4 opacity-0 scale-75 pointer-events-none"
      }`}
      aria-label="Contacter AutoForge sur WhatsApp"
    >
      💬
    </a>
  );
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1565C0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="AutoForge" />
      </head>
      <body>
        {children}
        <PwaRegister />
        <FloatingWhatsApp />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
              padding: "12px 16px",
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
            },
          }}
          richColors
          closeButton
        />
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("autoforge-dark-mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  /* Sync dark class & localStorage */
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("autoforge-dark-mode", String(dark));
  }, [dark]);

  /* Bloquer le scroll arrière-plan quand le menu mobile est ouvert */
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

  /* Fermer le menu quand on clique sur un lien */
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMenu} className="group flex items-center gap-2 transition-transform hover:scale-105">
          <span className="text-2xl transition-transform duration-300 group-hover:animate-float" aria-hidden>🔧</span>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Auto<span className="text-brand">Forge</span>
          </span>
        </Link>

        {/* Desktop nav */}
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
          <Link to="/contact" activeProps={active} className={linkBase}>
            Contact
          </Link>

          {/* Dark mode toggle — desktop */}
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

        {/* Hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-all hover:bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand/30 sm:hidden"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-sm sm:hidden animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile nav panel */}
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
            to="/contact"
            activeProps={mobileActive}
            className={mobileLinkBase}
            onClick={closeMenu}
          >
            ✉️ Contact
          </Link>

          {/* Dark mode toggle — mobile */}
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
    <footer className="border-t border-border bg-foreground text-background/90 dark:bg-card dark:text-foreground/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <span className="text-lg font-extrabold">AutoForge</span>
          </div>
          <p className="mt-3 text-sm text-background/70 dark:text-foreground/60">
            La plateforme de référence des pièces détachées automobiles à Dakar.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-background dark:text-foreground">Contact</h3>
          <ul className="mt-3 space-y-1 text-sm text-background/70 dark:text-foreground/60">
            <li>Route de Diamniadio, Zone Industrielle, Dakar</li>
            <li>contact@autoforge.sn</li>
            <li>+221 33 800 00 00</li>
            <li>
              <a
                href="https://wa.me/221778000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-background hover:underline dark:hover:text-foreground"
              >
                <span aria-hidden>💬</span>
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-background dark:text-foreground">Mentions légales</h3>
          <p className="mt-3 text-sm text-background/70 dark:text-foreground/60">
            © {new Date().getFullYear()} AutoForge SARL — RC Dakar. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
