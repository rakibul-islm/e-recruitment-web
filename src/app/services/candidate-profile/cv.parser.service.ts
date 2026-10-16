import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { hasColumns, htmlToBlocks, pdfPagesToBlocks, routeTabColumns, textToBlocks } from './cv/cv.layout';
import { CvBlock, ParsedCv, PdfItem } from './cv/cv.model';
import { ocrImageSets, ocrPdfPageSets } from './cv/cv.ocr';
import { bestScored, parseBlocks, pickBest } from './cv/cv.parser';

export type { ParsedCv } from './cv/cv.model';

@Injectable({ providedIn: 'root' })
export class CvParserService {
  static readonly MAX_BYTES = 5 * 1024 * 1024;
  private static readonly MIN_TEXT_CHARS = 40;

  async parseFile(file: File): Promise<ParsedCv> {
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) return this.parsePdf(file);
    if (name.endsWith('.docx')) return this.parseDocx(file);
    if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp)$/.test(name)) return this.parseImage(file);
    throw new Error('unsupported');
  }

  private async parseImage(file: File): Promise<ParsedCv> {
    const scanned = (await ocrImageSets(file)).filter(set => this.hasText(set));
    if (!scanned.length) throw new Error('empty');
    return bestScored(scanned.map(set => this.parsePages(set)));
  }

  parseText(text: string): ParsedCv {
    return parseBlocks(textToBlocks(text));
  }

  private async parsePdf(file: File): Promise<ParsedCv> {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';
    const pdf = await (pdfjsLib as any).getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = await this.textPages(pdf);
    if (this.hasText(pages)) return this.parsePages(pages);
    const scanned = (await ocrPdfPageSets(pdf)).filter(set => this.hasText(set));
    if (!scanned.length) throw new Error('empty');
    return bestScored(scanned.map(set => this.parsePages(set)));
  }

  private parsePages(pages: PdfItem[][]): ParsedCv {
    const candidates: CvBlock[][] = [pdfPagesToBlocks(pages, true)];
    if (hasColumns(pages)) candidates.push(pdfPagesToBlocks(pages, false));
    return pickBest(candidates.map(blocks => parseBlocks(blocks)));
  }

  private async parseDocx(file: File): Promise<ParsedCv> {
    const mammoth = await import('mammoth/mammoth.browser.min.js');
    const skipImages = mammoth.images.imgElement(async () => ({ src: '' }));
    const html = (await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() }, { convertImage: skipImages })).value;
    const plain = htmlToBlocks(html);
    if (!plain.length) throw new Error('empty');
    const routed = routeTabColumns(plain);
    return pickBest((routed ? [routed, plain] : [plain]).map(blocks => parseBlocks(blocks)));
  }

  private async textPages(pdf: any): Promise<PdfItem[][]> {
    const pages: PdfItem[][] = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      pages.push((content.items as any[])
        .filter(item => item.str && item.str.trim())
        .map(item => ({ str: item.str, x: item.transform[4], x2: item.transform[4] + item.width, y: item.transform[5], h: item.height || Math.hypot(item.transform[2], item.transform[3]) })));
    }
    return pages;
  }

  private hasText(pages: PdfItem[][]): boolean {
    const chars = pages.reduce((total, items) => total + items.reduce((n, item) => n + item.str.length, 0), 0);
    return chars >= CvParserService.MIN_TEXT_CHARS;
  }
}
