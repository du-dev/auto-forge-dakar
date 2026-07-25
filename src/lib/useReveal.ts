import { useEffect, useRef, useState } from "react";

/**
 * Hook qui déclenche une animation quand l'élément entre dans le viewport.
 * @param options - seuil de visibilité, réinitialisation possible
 * @returns [ref, revealed] – attachez ref à l'élément à observer
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; once?: boolean } = {},
) {
  const { threshold = 0.15, once = true } = options;
  const ref = useRef<T>(null!);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, revealed };
}

/**
 * Compteur animé : de 0 à `end` en `duration` ms.
 */
export function useCountUp(end: number, start = 0, duration = 1500) {
  const [value, setValue] = useState(start);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLSpanElement>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const step = Math.max(1, Math.floor((end - start) / (duration / 16)));
    let current = start;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(current);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, end, start, duration]);

  return { ref, value };
}
