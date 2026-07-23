import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

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

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  const linkBase =
    "text-sm font-medium text-foreground/70 hover:text-brand transition-colors";
  const active = { className: "text-brand font-semibold" };
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>🔧</span>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Auto<span className="text-brand">Forge</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
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
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <span className="text-lg font-extrabold">AutoForge</span>
          </div>
          <p className="mt-3 text-sm text-background/70">
            La plateforme de référence des pièces détachées automobiles à Dakar.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-background">Contact</h3>
          <ul className="mt-3 space-y-1 text-sm text-background/70">
            <li>Route de Diamniadio, Zone Industrielle, Dakar</li>
            <li>contact@autoforge.sn</li>
            <li>+221 33 800 00 00</li>
            <li>
              <a
                href="https://wa.me/221778000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-background hover:underline"
              >
                <span aria-hidden>💬</span>
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-background">Mentions légales</h3>
          <p className="mt-3 text-sm text-background/70">
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
