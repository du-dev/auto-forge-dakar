import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useReveal, useCountUp } from "../lib/useReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoForge — Trouvez la bonne pièce auto à Dakar" },
      {
        name: "description",
        content:
          "Comparez en temps réel prix, disponibilité et localisation des pièces détachées auto à Dakar. Évitez les déplacements inutiles.",
      },
      { property: "og:title", content: "AutoForge — Trouvez la bonne pièce auto à Dakar" },
      {
        property: "og:description",
        content: "Comparez en temps réel prix, disponibilité et localisation des pièces détachées auto à Dakar. Évitez les déplacements inutiles.",
      },
    ],
  }),
  component: Index,
});

/* ─── Composants réutilisables ─────────────────────── */

function SectionHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, revealed } = useReveal<HTMLHeadingElement>();
  return (
    <h2
      ref={ref}
      className={`text-2xl font-bold text-foreground sm:text-3xl transition-all duration-700 ${className} ${
        revealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </h2>
  );
}

/* ─── Stat avec compteur ─── */

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const suffix = value.replace(/[0-9]/g, "");
  const { ref, value: count } = useCountUp(num);
  const { ref: revealRef, revealed } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={revealRef}
      className={`rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-700 ${
        revealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="text-4xl font-extrabold text-brand sm:text-5xl">
        <span ref={ref}>{count}</span>
        <span>{suffix}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/* ─── Carte d'avantage ─── */

function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-700 hover:shadow-md hover:border-brand/30 hover:scale-[1.02] ${
        revealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

/* ─── Carte de témoignage ─── */

function TestimonialCard({ quote, author, role, delay }: { quote: string; author: string; role: string; delay: number }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-700 hover:shadow-md ${
        revealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex gap-1 text-accent-orange" aria-label="5 étoiles">
        {"★".repeat(5)}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80 italic">"{quote}"</p>
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand">
          {author[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{author}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Carte d'étape ─── */

function StepCard({ n, t, d, delay }: { n: string; t: string; d: string; delay: number }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-border bg-card p-6 text-center sm:text-left transition-all duration-700 hover:shadow-md ${
        revealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground sm:mx-0">
        {n}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{t}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{d}</p>
    </div>
  );
}

/* ─── Section Marque ─── */

const BRANDS = [
  { name: "Toyota", emoji: "🚗" },
  { name: "Peugeot", emoji: "🐉" },
  { name: "Hyundai", emoji: "⚡" },
  { name: "Nissan", emoji: "🌟" },
  { name: "Renault", emoji: "💎" },
  { name: "Mitsubishi", emoji: "🔷" },
  { name: "Universal", emoji: "🔄" },
];

function BrandCard({ name, emoji, delay }: { name: string; emoji: string; delay: number }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all duration-500 hover:shadow-md hover:border-brand/30 hover:scale-105 ${
        revealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-semibold text-foreground">{name}</span>
    </div>
  );
}

const FEATURES = [
  { icon: "📍", title: "Localisation précise", desc: "Chaque pièce est géolocalisée chez nos fournisseurs partenaires à Dakar et sa banlieue." },
  { icon: "💰", title: "Prix en temps réel", desc: "Plus d'intermédiaires. Le prix affiché est le prix du fournisseur, mis à jour en direct." },
  { icon: "⚡", title: "Rapide et fiable", desc: "Trouvez la bonne pièce en 30 secondes et retirez-la chez le fournisseur le plus proche." },
  { icon: "💬", title: "Contact direct WhatsApp", desc: "Discutez directement avec le vendeur. Pas de formulaire, pas d'attente, pas de frais cachés." },
];

const TESTIMONIALS = [
  { quote: "J'ai trouvé un alternateur pour mon Tucson en moins d'une minute. Le vendeur était à 10 minutes de chez moi à Thiaroye.", author: "Mamadou Diallo", role: "Propriétaire Hyundai Tucson" },
  { quote: "Je suis mécanicien à Colobane. AutoForge me fait gagner des heures chaque semaine. Je compare les prix sans bouger de mon garage.", author: "Moussa Ndiaye", role: "Mécanicien, Colobane" },
  { quote: "J'avais besoin de plaquettes de frein pour ma Corolla. 15 000 FCFA chez un fournisseur à 2 km. Livré le jour même.", author: "Awa Diop", role: "Particulière, Dakar" },
];

/* ─── Page principale ─── */

function Index() {
  const { ref: contentRef, revealed: contentRevealed } = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: ctaRef, revealed: ctaRevealed } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <>
      {/* ────── SECTION 1 : BANNER ────── */}
      <section className="bg-brand py-2.5 text-center text-sm font-medium text-brand-foreground shadow-sm dark:bg-brand/90">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 animate-fade-in">
          <span aria-hidden>🔧</span> Plus de 36 pièces suivies en temps réel à Dakar
        </div>
      </section>

      {/* ────── SECTION 2 : HERO ────── */}
      <section className="relative overflow-hidden animated-gradient" style={{ willChange: "background-position" }}>
        {/* Grand halo lumineux central visible */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand/[0.12] via-brand/[0.05] to-transparent blur-3xl max-sm:h-[300px] max-sm:w-[300px]" />

        {/* Grand cercle flou existant */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/[0.12] blur-3xl animate-float max-sm:h-32 max-sm:w-32 max-sm:-right-10 max-sm:-top-10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent-orange/[0.08] blur-3xl animate-float max-sm:h-40 max-sm:w-40 max-sm:-bottom-16 max-sm:-left-8" style={{ animationDelay: "1.5s" }} />

        {/* Cercles flottants décoratifs */}
        <div className="pointer-events-none absolute left-[12%] top-[18%] h-16 w-16 rounded-full bg-brand/[0.07] animate-float" style={{ animationDuration: "5s" }} />
        <div className="pointer-events-none absolute right-[20%] top-[25%] h-10 w-10 rounded-full bg-accent-orange/[0.06] animate-float" style={{ animationDuration: "6s", animationDelay: "1s" }} />
        <div className="pointer-events-none absolute left-[8%] bottom-[30%] h-20 w-20 rounded-full bg-brand/[0.05] animate-float max-sm:h-12 max-sm:w-12" style={{ animationDuration: "7s", animationDelay: "0.5s" }} />
        <div className="pointer-events-none absolute right-[10%] bottom-[20%] h-14 w-14 rounded-full bg-accent-orange/[0.05] animate-float max-sm:hidden" style={{ animationDuration: "4.5s", animationDelay: "2s" }} />

        {/* Gros cercle décoratif derrière le titre */}
        <div className="pointer-events-none absolute left-[5%] top-[10%] h-48 w-48 rounded-full border-2 border-brand/[0.08] animate-float max-sm:h-24 max-sm:w-24" style={{ animationDuration: "8s" }} />

        {/* Lignes diagonales décoratives */}
        <div className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[300px] origin-top-left rotate-12 bg-gradient-to-b from-brand/[0.03] to-transparent max-sm:hidden" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[200px] origin-bottom-right -rotate-12 bg-gradient-to-t from-accent-orange/[0.03] to-transparent max-sm:hidden" />

        {/* Motif de points visible */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle, #1565C0 1.5px, transparent 1.5px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Dégradé de bord pour fondre la transition */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28" ref={contentRef}>
          <div className="max-w-3xl">
            <div className={`transition-all duration-700 ${contentRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                🔧 Dakar · Temps réel
              </span>
            </div>

            <h1
              className={`mt-4 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl transition-all duration-700 ${
                contentRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              La pièce auto qu'il vous faut,{" "}
              <span className="text-brand">à deux pas de chez vous</span>.
            </h1>

            <p
              className={`mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg transition-all duration-700 ${
                contentRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              AutoForge centralise la disponibilité, les prix et la localisation des pièces détachées
              chez les vendeurs et mécaniciens de Dakar. Comparez en un clic, contactez en direct,
              et économisez du temps et de l'argent.
            </p>

            <div
              className={`mt-8 flex flex-col gap-3 sm:flex-row transition-all duration-700 ${
                contentRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "350ms" }}
            >
              <Link
                to="/catalogue"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-brand px-8 py-3.5 text-sm font-semibold text-brand-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="absolute inset-0 animate-shimmer" />
                <span className="relative flex items-center gap-2">
                  🔍 Trouver une pièce
                </span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-lg border-2 border-accent-orange bg-transparent px-8 py-3.5 text-sm font-semibold text-accent-orange transition-all hover:bg-accent-orange hover:text-white hover:-translate-y-0.5 hover:shadow-md"
              >
                🤝 Devenir revendeur partenaire
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────── SECTION 3 : STATS ────── */}
      <section className="border-y border-border bg-background dark:bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading>AutoForge en chiffres</SectionHeading>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <AnimatedStat value="12+" label="Fournisseurs partenaires à Dakar et sa banlieue" />
            <AnimatedStat value="36" label="Références de pièces suivies en temps réel" />
            <AnimatedStat value="8" label="Catégories de pièces couvertes" />
          </div>
        </div>
      </section>

      {/* ────── SECTION 4 : POURQUOI AUTOFORGE ? ────── */}
      <section className="bg-gradient-to-b from-brand-soft/50 to-background dark:from-brand-soft/20 dark:to-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
              Nos atouts
            </span>
            <SectionHeading>Pourquoi choisir AutoForge ?</SectionHeading>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-2xl mx-auto">
              On a pensé à tout pour vous simplifier la vie. Voici ce qui rend AutoForge unique à Dakar.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ────── SECTION 5 : NOS MARQUES PARTENAIRES ────── */}
      <section className="border-y border-border bg-background dark:bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <SectionHeading>Marques disponibles</SectionHeading>
            <p className="mt-2 text-sm text-muted-foreground">
              Des pièces pour toutes les marques courantes à Dakar
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-7">
            {BRANDS.map((brand, i) => (
              <BrandCard key={brand.name} name={brand.name} emoji={brand.emoji} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ────── SECTION 6 : TÉMOIGNAGES ────── */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-accent-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-orange">
              💬 Ils nous font confiance
            </span>
            <SectionHeading>Ce que disent nos utilisateurs</SectionHeading>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.author} quote={t.quote} author={t.author} role={t.role} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ────── SECTION 7 : COMMENT ÇA MARCHE ────── */}
      <section className="border-y border-border bg-gradient-to-b from-brand-soft/30 to-background dark:from-brand-soft/10 dark:to-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading>Comment ça marche</SectionHeading>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <StepCard n="1" t="Cherchez" d="Tapez le nom de votre pièce ou choisissez votre marque dans le catalogue." delay={0} />
            <StepCard n="2" t="Comparez" d="Voyez en direct les prix, la disponibilité et la zone du fournisseur." delay={100} />
            <StepCard n="3" t="Contactez" d="Un clic sur WhatsApp et la pièce vous attend chez le fournisseur. Simple et rapide." delay={200} />
          </div>
        </div>
      </section>

      {/* ────── SECTION 8 : CTA FINAL ────── */}
      <section className="bg-brand relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6" ref={ctaRef}>
          <div className={`text-center transition-all duration-700 ${
            ctaRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <h2 className="text-2xl font-bold text-brand-foreground sm:text-3xl">
              Prêt à trouver la bonne pièce ?
            </h2>
            <p className="mt-3 text-base text-brand-foreground/80 max-w-xl mx-auto">
              Rejoignez les automobilistes et mécaniciens dakarois qui économisent du temps et de l'argent avec AutoForge.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-brand shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                🔍 Explorer le catalogue
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/40 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10 hover:-translate-y-0.5"
              >
                💬 Contactez-nous
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
