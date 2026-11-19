const DEFAULT_BG = "#fffaf3";

function toHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

// Corta as margens vazias do logo e descobre a cor de fundo (pelos cantos), para que o cartão
// no celular de patrocinadores mostre o logo grande e sem "caixa" de outra cor ao redor.
// Se algo der errado (SVG, imagem enorme demais, formato estranho), devolve o arquivo original.
export async function trimLogo(file: File): Promise<{ file: File; bgColor: string }> {
  const fallback = { file, bgColor: DEFAULT_BG };
  if (file.type === "image/svg+xml") return fallback;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const { data } = ctx.getImageData(0, 0, w, h);
    const px = (x: number, y: number) => {
      const i = (y * w + x) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    };

    const corners = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)];
    const bg = [0, 1, 2].map((c) => median(corners.map((p) => p[c])));

    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const diff =
          Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]);
        if (diff > 70) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return fallback;

    const padX = Math.max(Math.round((maxX - minX) * 0.06), 6);
    const padY = Math.max(Math.round((maxY - minY) * 0.1), 6);
    const x0 = Math.max(0, minX - padX);
    const y0 = Math.max(0, minY - padY);
    const x1 = Math.min(w, maxX + padX + 1);
    const y1 = Math.min(h, maxY + padY + 1);

    const out = document.createElement("canvas");
    const outScale = Math.min(1, 900 / Math.max(x1 - x0, y1 - y0));
    out.width = Math.max(1, Math.round((x1 - x0) * outScale));
    out.height = Math.max(1, Math.round((y1 - y0) * outScale));
    const octx = out.getContext("2d");
    if (!octx) return fallback;
    octx.drawImage(canvas, x0, y0, x1 - x0, y1 - y0, 0, 0, out.width, out.height);

    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
    if (!blob) return fallback;

    return {
      file: new File([blob], "logo.png", { type: "image/png" }),
      bgColor: toHex(bg[0], bg[1], bg[2]),
    };
  } catch {
    return fallback;
  }
}
