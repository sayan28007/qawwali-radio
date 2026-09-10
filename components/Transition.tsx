"use client";

import { useEffect, useRef, useState } from "react";

export default function Transition({
  show,
  duration = 200,
  className = "",
  children,
}: {
  show: boolean;
  duration?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const [rendered, setRendered] = useState(show);
  const [entered, setEntered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    timeoutRef.current = setTimeout(() => setRendered(false), duration);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [show, duration]);

  if (!rendered) return null;

  return (
    <div
      className={`transition-all ease-out ${
        entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-1.5 scale-[0.97] opacity-0"
      } ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
