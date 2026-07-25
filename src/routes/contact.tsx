import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { useReveal } from "../lib/useReveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AutoForge Dakar" },
      {
        name: "description",
        content:
          "Contactez AutoForge : Route de Diamniadio, Zone Industrielle, Dakar. Devenez revendeur partenaire ou posez-nous vos questions.",
      },
      { property: "og:title", content: "Contact AutoForge" },
      {
        property: "og:description",
        content: "Écrivez-nous depuis Dakar — réponses sous 24h ouvrées.",
      },
    ],
  }),
  component: ContactPage,
});

/* ─── Trust card animée ─── */

function TrustCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-700 hover:shadow-md hover:scale-[1.03] hover:border-brand/30 ${
        revealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-2xl transition-transform duration-300 group-hover:scale-110" aria-hidden>
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

/* ─── Sidebar info animée ─── */

function InfoCard({ children, delay }: { children: ReactNode; delay: number }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-border p-6 transition-all duration-700 ${
        revealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Page principale ─── */

function ContactPage() {
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem("autoforge-contact");
      return saved ? JSON.parse(saved) : { name: "", email: "", phone: "", message: "" };
    } catch {
      return { name: "", email: "", phone: "", message: "" };
    }
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    localStorage.setItem("autoforge-contact", JSON.stringify(next));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const messages = JSON.parse(localStorage.getItem("autoforge-messages") || "[]");
    messages.push({ ...form, date: new Date().toISOString() });
    localStorage.setItem("autoforge-messages", JSON.stringify(messages));
    setForm({ name: "", email: "", phone: "", message: "" });
    localStorage.removeItem("autoforge-contact");
    toast.success("Message envoyé ✅", {
      description: "Nous vous répondrons sous 24h ouvrées.",
      duration: 4000,
    });
  };

  const inputCls =
    "mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 hover:border-brand/50";

  const { ref: titleRef, revealed: titleRevealed } = useReveal<HTMLDivElement>();
  const { ref: descRef, revealed: descRevealed } = useReveal<HTMLDivElement>();
  const { ref: headingRef, revealed: headingRevealed } = useReveal<HTMLHeadingElement>();
  const { ref: formRef, revealed: formRevealed } = useReveal<HTMLFormElement>();

  const trustItems = [
    {
      icon: "✅",
      title: "Pièces vérifiées avant mise en ligne",
      desc: "Chaque référence est contrôlée qualité par nos fournisseurs partenaires.",
    },
    {
      icon: "🚚",
      title: "Livraison rapide à Diamniadio",
      desc: "Retrait en zone industrielle ou livraison express sur Dakar et ses environs.",
    },
    {
      icon: "💬",
      title: "Support WhatsApp 7j/7",
      desc: "Une question ? Nos experts vous répondent directement sur WhatsApp, tous les jours.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 dark:bg-card/30">
      <header className="mb-8 max-w-2xl" ref={titleRef}>
        <h1
          className={`text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl transition-all duration-700 ${
            titleRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Contactez AutoForge
        </h1>
        <p
          ref={descRef}
          className={`mt-2 text-sm text-muted-foreground sm:text-base transition-all duration-700 ${
            descRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "150ms" }}
        >
          Une question, un besoin spécifique, ou l'envie de devenir revendeur partenaire ?
          Écrivez-nous — notre équipe basée à Dakar vous répond sous 24h ouvrées.
        </p>
      </header>

      {/* Trust section */}
      <div className="mb-10">
        <h2
          ref={headingRef}
          className={`mb-4 text-lg font-semibold text-foreground transition-all duration-700 ${
            headingRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Pourquoi nous faire confiance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustItems.map((item, i) => (
            <TrustCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} delay={i * 100} />
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Form */}
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className={`md:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-700 dark:border-brand/10 ${
            formRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">Nom complet</span>
              <input
                required
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="Ex. Awa Diop"
                className={inputCls + " dark:bg-background dark:placeholder:text-muted-foreground"}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">E-mail</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="vous@exemple.com"
                className={inputCls + " dark:bg-background dark:placeholder:text-muted-foreground"}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Téléphone</span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder="+221 77 000 00 00"
                className={inputCls + " dark:bg-background dark:placeholder:text-muted-foreground"}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">Message</span>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={update("message")}
                placeholder="Décrivez la pièce recherchée, le modèle du véhicule…"
                className={inputCls + " resize-y dark:bg-background dark:placeholder:text-muted-foreground"}
              />
            </label>
          </div>

          <button
            type="submit"
            className="group relative mt-6 inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
          >
            <span className="absolute inset-0 animate-shimmer" />
            <span className="relative whitespace-nowrap">Envoyer le message</span>
          </button>
        </form>

        {/* Info */}
        <aside className="md:col-span-2 space-y-4">
          <InfoCard delay={100}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand">
              Notre adresse
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden>📍</span>
                <div>
                  <p className="text-base font-semibold text-foreground">AutoForge SARL</p>
                  <p className="mt-0.5 text-sm text-foreground/80">
                    Route de Diamniadio,<br />
                    Zone Industrielle,<br />
                    Dakar, Sénégal
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard delay={200}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand">
              Nous joindre
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li className="flex items-center gap-3 transition-all hover:translate-x-1">
                <span>📞</span>
                <span>+221 33 800 00 00</span>
              </li>
              <li className="flex items-center gap-3 transition-all hover:translate-x-1">
                <span>✉️</span>
                <span>contact@autoforge.sn</span>
              </li>
              <li className="flex items-center gap-3 transition-all hover:translate-x-1">
                <span>🕒</span>
                <span>Lun. – Sam. · 8h – 19h</span>
              </li>
            </ul>
          </InfoCard>
        </aside>
      </div>
    </section>
  );
}
