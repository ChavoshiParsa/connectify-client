export async function fileToImageBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    return await createImageBitmap(file);
  }
  const dataUrl = await fileToDataURL(file);
  const img = await dataURLToImage(dataUrl);
  return img;
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, encoded] = dataUrl.split(',');
  const contentType = /^data:([^;]+);base64$/.exec(header)?.[1];
  if (!contentType || !encoded) throw new Error('Invalid image data URL');

  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);

  return new File([bytes], filename, { type: contentType });
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export function dataURLToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function compressImageToTarget(
  file: File,
  {
    targetKB = 50,
    maxWidth = 512,
    maxHeight = 512,
    mimePriority = ['image/webp', 'image/jpeg'] as const,
    qualityMin = 0.5,
    qualityMax = 0.92,
    steps = 6,
  } = {},
): Promise<{ dataUrl: string; bytes: number; mime: string }> {
  const img = await fileToImageBitmap(file);

  const { width: srcW, height: srcH } = 'width' in img ? img : (img as ImageBitmap);
  const scale = Math.min(1, maxWidth / srcW, maxHeight / srcH);
  const dstW = Math.max(1, Math.round(srcW * scale));
  const dstH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = dstW;
  canvas.height = dstH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img as never, 0, 0, dstW, dstH);

  const targetBytes = targetKB * 1024;

  for (const mime of mimePriority) {
    let lo = qualityMin;
    let hi = qualityMax;
    let best: { dataUrl: string; bytes: number } | null = null;

    for (let i = 0; i < steps; i++) {
      const q = i === 0 ? hi : (lo + hi) / 2;
      const dataUrl = canvas.toDataURL(mime, q);
      const bytes = Math.ceil(((dataUrl.length - 'data:image/xxx;base64,'.length) * 3) / 4);

      if (bytes <= targetBytes) {
        best = { dataUrl, bytes };
        lo = q;
      } else {
        hi = q;
      }
    }

    if (best) return { ...best, mime };
  }

  const dataUrl = canvas.toDataURL('image/jpeg', qualityMin);
  const bytes = Math.ceil(((dataUrl.length - 'data:image/xxx;base64,'.length) * 3) / 4);
  return { dataUrl, bytes, mime: 'image/jpeg' };
}
