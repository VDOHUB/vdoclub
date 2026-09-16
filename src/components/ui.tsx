import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white/[0.02] border border-wood/30 rounded-2xl p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full bg-wood/10 border border-wood/25 rounded-lg px-3.5 py-2.5 text-sm text-cream placeholder:text-muted focus:outline-none focus:border-cream/40 transition-colors ${className}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full bg-wood/10 border border-wood/25 rounded-lg px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:border-cream/40 transition-colors ${className}`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream/70 mb-1.5">
      {children}
    </label>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const base = "text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50";
  const variants: Record<string, string> = {
    primary: "bg-wood text-white hover:bg-wood-dark",
    ghost: "bg-transparent border border-wood/35 text-cream hover:bg-wood/15",
    danger: "bg-transparent border border-red-900/50 text-red-300 hover:bg-red-950/30",
  };
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "wood" }: { children: ReactNode; tone?: "wood" | "green" | "yellow" | "red" }) {
  const tones: Record<string, string> = {
    wood: "bg-wood/20 border-wood/40 text-[#d4b896]",
    green: "bg-green-500/10 border-green-500/30 text-green-400",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    red: "bg-red-500/10 border-red-500/30 text-red-300",
  };
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="text-[#d4b896] text-sm tracking-wide">
      {"★".repeat(value)}
      <span className="text-wood/40">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-300 bg-red-950/30 border border-red-900/40 rounded-lg px-3.5 py-2.5 mb-4">
      {message}
    </p>
  );
}
