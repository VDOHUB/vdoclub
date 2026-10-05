type Sponsor = { id: string; name: string; logo_url: string; link_url: string | null };

function Logo({ sponsor }: { sponsor: Sponsor }) {
  const card = (
    <div className="bg-[#fffaf3] rounded-xl h-16 flex items-center justify-center p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sponsor.logo_url}
        alt={sponsor.name}
        loading="lazy"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );

  return sponsor.link_url ? (
    <a href={sponsor.link_url} target="_blank" rel="noopener noreferrer sponsored" className="block">
      {card}
    </a>
  ) : (
    card
  );
}

function Placeholder() {
  return (
    <div className="rounded-xl h-16 flex items-center justify-center border border-dashed border-wood/50 text-[10px] uppercase tracking-widest text-muted">
      Seu logo aqui
    </div>
  );
}

const MIN_ITEMS_PER_HALF = 6;

export function PhoneSponsors({ sponsors }: { sponsors: Sponsor[] }) {
  const base: (Sponsor | null)[] = sponsors.length > 0 ? sponsors : [null, null, null, null];
  const repeat = Math.max(1, Math.ceil(MIN_ITEMS_PER_HALF / base.length));
  const half = Array.from({ length: repeat }, () => base).flat();
  const duration = Math.max(18, half.length * 4);

  const renderHalf = (suffix: string) =>
    half.map((s, i) => (
      <div key={`${suffix}-${s?.id ?? "ph"}-${i}`} className="pb-3">
        {s ? <Logo sponsor={s} /> : <Placeholder />}
      </div>
    ));

  return (
    <aside
      aria-label="Patrocinadores do VDO CLUB"
      className="hidden min-[1700px]:block [@media(max-height:660px)]:hidden fixed top-24 z-30 w-64"
      style={{ left: "calc((100vw - 64rem) / 2 - 18rem)" }}
    >
      <div className="relative rounded-[2.4rem] bg-[#0a0501] p-[7px] border border-wood/40 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <div className="relative rounded-[2rem] overflow-hidden bg-ink h-[520px] flex flex-col">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black z-10" />

          <div className="h-9 flex-shrink-0" />

          <div className="flex items-center justify-between px-4 py-2.5 border-b border-wood/25 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-wood flex items-center justify-center font-serif text-[9px] font-bold text-white">
                VC
              </div>
              <span className="font-serif text-xs font-bold text-white">VDO CLUB</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>

          <div className="px-4 pt-3 pb-1 flex-shrink-0">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d4b896]">
              Patrocinadores
            </div>
            <div className="text-[10px] text-muted mt-0.5">Empresas que fazem o Club acontecer</div>
          </div>

          <div
            className="sponsor-marquee-wrap relative flex-1 overflow-hidden px-4"
            style={{
              maskImage: "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
            }}
          >
            <div className="sponsor-marquee pt-2" style={{ ["--sponsor-duration" as string]: `${duration}s` }}>
              {renderHalf("a")}
              <div aria-hidden="true">{renderHalf("b")}</div>
            </div>
          </div>

          <div className="h-6 flex items-center justify-center flex-shrink-0">
            <div className="w-20 h-1 rounded-full bg-cream/30" />
          </div>
        </div>
      </div>
    </aside>
  );
}
