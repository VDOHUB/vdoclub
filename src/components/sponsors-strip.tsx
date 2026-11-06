type Sponsor = { id: string; name: string; logo_url: string; link_url: string | null };

function Item({ sponsor }: { sponsor: Sponsor }) {
  const card = (
    <div className="bg-[#fffaf3] rounded-xl h-14 w-32 flex items-center justify-center p-2.5">
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

const MIN_ITEMS_PER_HALF = 6;

// Faixa horizontal em loop infinito para telas onde o celular lateral não cabe
// (celular e notebook). Fica oculta em telas largas, onde o mockup já aparece.
export function SponsorsStrip({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;

  const repeat = Math.max(1, Math.ceil(MIN_ITEMS_PER_HALF / sponsors.length));
  const half = Array.from({ length: repeat }, () => sponsors).flat();
  const duration = Math.max(20, half.length * 4);

  const renderHalf = (suffix: string) =>
    half.map((s, i) => (
      <div key={`${suffix}-${s.id}-${i}`} className="pr-3 flex-shrink-0">
        <Item sponsor={s} />
      </div>
    ));

  return (
    <section aria-label="Patrocinadores do VDO CLUB" className="min-[1700px]:hidden mt-8">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4b896] mb-3">
        Patrocinadores
      </h2>
      <div
        className="sponsor-marquee-wrap overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div
          className="sponsor-marquee-x flex w-max"
          style={{ ["--sponsor-duration" as string]: `${duration}s` }}
        >
          {renderHalf("a")}
          <div aria-hidden="true" className="flex">
            {renderHalf("b")}
          </div>
        </div>
      </div>
    </section>
  );
}
