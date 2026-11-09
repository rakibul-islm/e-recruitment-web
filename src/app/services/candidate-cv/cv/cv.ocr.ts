import { PdfItem } from './cv.model';

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  descender?: number;
}

const OCR_SCALES = [2, 4];
const OCR_MAX_PAGES = 3;
const MIN_CONFIDENCE = 30;
const DESCENDING_CHARS = /[gjpqy,;()[\]]/;

export function ocrWordsToItems(words: OcrWord[], pageHeight: number, scale: number): PdfItem[] {
  return words
    .filter(w => w.text && w.text.trim() && !/^[|=~_]+$/.test(w.text.trim()) && w.confidence >= MIN_CONFIDENCE)
    .map(w => {
      const drop = DESCENDING_CHARS.test(w.text) ? (w.descender || 0) * 0.75 : 0;
      return {
        str: w.text.trim(),
        x: w.bbox.x0 / scale,
        x2: w.bbox.x1 / scale,
        y: pageHeight - (w.bbox.y1 - drop) / scale,
        h: Math.max((w.bbox.y1 - w.bbox.y0 - drop) / scale / 0.72, 6)
      };
    });
}

function wordsOf(blocks: any[] | null): OcrWord[] {
  const words: OcrWord[] = [];
  (blocks || []).forEach(block => block.paragraphs.forEach((p: any) => p.lines.forEach((l: any) => l.words.forEach((w: any) => {
    words.push({ text: w.text, confidence: w.confidence, bbox: w.bbox, descender: l.rowAttributes?.descenders });
  }))));
  return words;
}

function absolute(path: string): string {
  return new URL(path, document.baseURI).href;
}

const IMAGE_LONG_SIDES = [2200, 3200];
const PAGE_WIDTH_POINTS = 595;

async function withWorker<T>(run: (recognize: (canvas: HTMLCanvasElement) => Promise<OcrWord[]>) => Promise<T>): Promise<T> {
  const tesseract = await import('tesseract.js/dist/tesseract.min.js');
  const createWorker = tesseract.createWorker || tesseract.default.createWorker;
  const base = absolute('assets/tesseract');
  const worker = await createWorker('eng', 1, { workerPath: `${base}/worker.min.js`, corePath: base, langPath: `${base}/lang`, gzip: true });
  try {
    return await run(async canvas => wordsOf((await worker.recognize(canvas, {}, { blocks: true })).data.blocks));
  } finally {
    await worker.terminate();
  }
}

export function ocrPdfPageSets(pdf: any): Promise<PdfItem[][][]> {
  return withWorker(async recognize => {
    const sets: PdfItem[][][] = [];
    for (const scale of OCR_SCALES) {
      const pages: PdfItem[][] = [];
      for (let pageNo = 1; pageNo <= Math.min(pdf.numPages, OCR_MAX_PAGES); pageNo++) {
        const page = await pdf.getPage(pageNo);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext('2d') as CanvasRenderingContext2D, viewport }).promise;
        pages.push(ocrWordsToItems(await recognize(canvas), viewport.height / scale, scale));
      }
      sets.push(pages);
    }
    return sets;
  });
}

export function ocrImageSets(file: File): Promise<PdfItem[][][]> {
  return withWorker(async recognize => {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const sets: PdfItem[][][] = [];
    try {
      for (const longSide of IMAGE_LONG_SIDES) {
        const ratio = longSide / Math.max(bitmap.width, bitmap.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * ratio);
        canvas.height = Math.round(bitmap.height * ratio);
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.filter = 'grayscale(1) contrast(1.35)';
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const scale = canvas.width / PAGE_WIDTH_POINTS;
        sets.push([ocrWordsToItems(await recognize(canvas), canvas.height / scale, scale)]);
      }
    } finally {
      bitmap.close();
    }
    return sets;
  });
}
