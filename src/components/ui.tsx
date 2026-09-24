import { Fragment, type ReactNode } from "react";

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
    primary: "bg-wood-light text-white hover:bg-wood",
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

export function Avatar({
  url,
  name,
  size = 40,
}: {
  url?: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-wood flex items-center justify-center font-serif font-bold text-white flex-shrink-0"
    >
      {initials || "?"}
    </div>
  );
}

export function StarPicker({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue?: number;
  required?: boolean;
}) {
  return (
    <div className="star-picker">
      {[5, 4, 3, 2, 1].map((n) => (
        <Fragment key={n}>
          <input
            type="radio"
            name={name}
            id={`${name}-${n}`}
            value={n}
            required={required}
            defaultChecked={defaultValue === n}
          />
          <label htmlFor={`${name}-${n}`}>★</label>
        </Fragment>
      ))}
    </div>
  );
}

const STATUS_STEPS: { key: string; label: string }[] = [
  { key: "orcado", label: "Orçado" },
  { key: "pendente_aprovacao", label: "Pendente aprovação" },
  { key: "aprovado", label: "Aprovado" },
  { key: "concluido", label: "Concluído" },
  { key: "avaliado", label: "Avaliado" },
];

export function StatusStepper({ status }: { status: string }) {
  const currentIndex = Math.max(
    0,
    STATUS_STEPS.findIndex((s) => s.key === status)
  );

  return (
    <div className="flex items-start">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STATUS_STEPS.length - 1;
        return (
          <div key={step.key} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5" style={{ width: 72 }}>
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  done ? "bg-green-500 border-green-500" : "bg-transparent border-wood/40"
                }`}
              />
              <span
                className={`text-[9px] text-center leading-tight ${
                  done ? "text-green-400 font-semibold" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 -mt-4 ${i < currentIndex ? "bg-green-500" : "bg-wood/25"}`}
              />
            )}
          </div>
        );
      })}
    </div>
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
