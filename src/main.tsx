import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { router, queryClient } from "./router";
import "./styles.css";

/*
 * Service worker PWA (optionnel, échoue silencieusement)
 */
function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

/*
 * Bouton WhatsApp flottant
 */
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
        show ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-75 pointer-events-none"
      }`}
      aria-label="Contacter AutoForge sur WhatsApp"
    >
      💬
    </a>
  );
}

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
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
        <PwaRegister />
        <FloatingWhatsApp />
      </QueryClientProvider>
    </StrictMode>
  );
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
