import { CvBlock, CvCell, HEADER_TOKENS, PdfItem, STRONG_HEADER_TOKENS, YEAR_REGEX, editDistanceAtMostOne, headingKeyOf, normalizeText } from './cv.model';

function groupRows(cells: CvCell[]): CvCell[][] {
  const sorted = [...cells].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: CvCell[][] = [];
  for (const cell of sorted) {
    const row = rows.find(r => Math.abs(r[0].y - cell.y) <= Math.max(2.5, 0.3 * cell.h));
    if (row) row.push(cell);
    else rows.push([cell]);
  }
  rows.forEach(r => r.sort((a, b) => a.x - b.x));
  return rows;
}

function buildCells(items: PdfItem[]): CvCell[] {
  const pieces = items.filter(i => i.str && i.str.trim());
  const sorted = [...pieces].sort((a, b) => b.y - a.y || a.x - b.x);
  const bands: PdfItem[][] = [];
  for (const item of sorted) {
    const band = bands.find(b => Math.abs(b[0].y - item.y) <= Math.max(2.5, 0.3 * item.h));
    if (band) band.push(item);
    else bands.push([item]);
  }
  const cells: CvCell[] = [];
  for (const band of bands) {
    band.sort((a, b) => a.x - b.x);
    let current: CvCell | null = null;
    for (const item of band) {
      const h = Math.max(item.h, 6);
      const text = item.str.replace(/\s+/g, ' ');
      if (current) {
        const gap = item.x - current.x2;
        if (gap < 0.9 * h) {
          const glue = gap < 0.15 * h && !/\s$/.test(current.text) && !/^\s/.test(text) ? '' : ' ';
          current.text += glue + text;
          current.x2 = Math.max(current.x2, item.x2);
          current.h = Math.max(current.h, h);
          continue;
        }
        cells.push(current);
      }
      current = { text, x: item.x, x2: item.x2, y: band[0].y, h };
    }
    if (current) cells.push(current);
  }
  cells.forEach(c => c.text = c.text.replace(/\s+/g, ' ').trim());
  return cells.filter(c => c.text);
}

interface Gutter { x1: number; x2: number; }

function findGutter(cells: CvCell[]): Gutter | null {
  if (cells.length < 12) return null;
  const minX = Math.min(...cells.map(c => c.x));
  const maxX = Math.max(...cells.map(c => c.x2));
  const width = maxX - minX;
  if (width < 200) return null;
  const tolerance = Math.max(3, Math.floor(cells.length * 0.06));
  const runs: Gutter[] = [];
  let start: number | null = null;
  for (let x = minX + 0.12 * width; x <= maxX - 0.12 * width; x += 2) {
    const covering = cells.reduce((n, c) => n + (c.x < x && c.x2 > x ? 1 : 0), 0);
    if (covering <= tolerance) {
      if (start === null) start = x;
    } else if (start !== null) {
      runs.push({ x1: start, x2: x });
      start = null;
    }
  }
  if (start !== null) runs.push({ x1: start, x2: maxX - 0.12 * width });
  runs.sort((a, b) => (b.x2 - b.x1) - (a.x2 - a.x1));
  for (const run of runs) {
    if (run.x2 - run.x1 < 8) continue;
    const mid = (run.x1 + run.x2) / 2;
    const left = cells.filter(c => c.x2 <= mid);
    const right = cells.filter(c => c.x >= mid);
    if (left.length < cells.length * 0.1 || right.length < cells.length * 0.1) continue;
    const leftEdge = Math.min(...left.map(c => c.x));
    const rightEdge = Math.min(...right.map(c => c.x));
    const leftHeadings = left.filter(c => c.x <= leftEdge + 35 && headingKeyOf(c.text)).length;
    const rightHeadings = right.filter(c => c.x <= rightEdge + 35 && headingKeyOf(c.text)).length;
    if (leftHeadings >= 1 && rightHeadings >= 1 && leftHeadings + rightHeadings >= 3) return run;
  }
  return null;
}

function rowsToBlocks(rows: CvCell[][]): CvBlock[] {
  const isLeftHeading = (row: CvCell[]) => row.length >= 2 && !!headingKeyOf(row[0].text) && row[1].x - row[0].x2 >= 12;
  const marked = rows.filter(isLeftHeading);
  const distinct = new Set(marked.map(r => headingKeyOf(r[0].text))).size;
  const aligned = distinct >= 3 && Math.max(...marked.map(r => r[1].x)) - Math.min(...marked.map(r => r[1].x)) <= 8;
  return rows.flatMap(row => (aligned && isLeftHeading(row) ? [blockFromCells([row[0]]), blockFromCells(row.slice(1))] : [rowToBlock(row)]));
}

function rowToBlock(row: CvCell[]): CvBlock {
  const parts = row.map(c => c.text);
  return { text: normalizeText(parts.join(' ')), parts, cells: row };
}

function blockFromCells(cells: CvCell[]): CvBlock {
  const parts = cells.map(c => c.text);
  return { text: normalizeText(parts.join(' ')), parts, cells };
}

export function splitGridBlocks(blocks: CvBlock[]): CvBlock[] {
  const rows = blocks.filter(b => b.cells && b.cells.length);
  if (rows.length < 3 || rows.length !== blocks.length) return blocks;
  const candidates: number[] = [];
  rows.forEach(row => {
    const cells = row.cells as CvCell[];
    for (let i = 1; i < cells.length; i++) {
      if (cells[i].x - cells[i - 1].x2 >= 12) candidates.push((cells[i - 1].x2 + cells[i].x) / 2);
    }
  });
  let best: { x: number; score: number; both: number } | null = null;
  for (const x of candidates) {
    let both = 0;
    let crossing = 0;
    rows.forEach(row => {
      const cells = row.cells as CvCell[];
      if (cells.some(c => c.x < x && c.x2 > x)) crossing++;
      else if (cells.some(c => c.x2 <= x) && cells.some(c => c.x >= x)) both++;
    });
    const score = both - 5 * crossing;
    if (crossing === 0 && both >= 3 && both >= rows.length * 0.3 && (!best || score > best.score)) best = { x, score, both };
  }
  if (!best) return blocks;
  const x = best.x;
  const left: CvBlock[] = [];
  const right: CvBlock[] = [];
  rows.forEach(row => {
    const cells = row.cells as CvCell[];
    const l = cells.filter(c => c.x2 <= x);
    const r = cells.filter(c => c.x >= x);
    if (l.length) left.push(blockFromCells(l));
    if (r.length) right.push(blockFromCells(r));
  });
  return [...left, ...right];
}

function gutterFits(cells: CvCell[], gutter: Gutter): boolean {
  const mid = (gutter.x1 + gutter.x2) / 2;
  const crossing = cells.filter(c => c.x < mid && c.x2 > mid).length;
  const left = cells.filter(c => c.x2 <= mid).length;
  const right = cells.filter(c => c.x >= mid).length;
  return crossing <= Math.max(2, Math.floor(cells.length * 0.06)) && left >= 2 && right >= 2;
}

function pageStreams(cells: CvCell[], gutter: Gutter | null): { main: CvBlock[]; side: CvBlock[] } {
  if (!gutter) return { main: rowsToBlocks(groupRows(cells)), side: [] };
  const mid = (gutter.x1 + gutter.x2) / 2;
  const isSpan = (c: CvCell) => c.x < mid && c.x2 > mid;
  const rows = groupRows(cells);
  const main: CvBlock[] = [];
  const side: CvBlock[] = [];
  let zone: CvCell[] = [];
  const flushZone = () => {
    const left = zone.filter(c => c.x2 <= mid);
    const right = zone.filter(c => c.x >= mid);
    main.push(...rowsToBlocks(groupRows(left)));
    side.push(...rowsToBlocks(groupRows(right)));
    zone = [];
  };
  for (const row of rows) {
    if (row.some(isSpan)) {
      flushZone();
      main.push(rowToBlock(row));
    } else {
      zone.push(...row);
    }
  }
  flushZone();
  return { main, side };
}

function pageGutters(pageCells: CvCell[][]): (Gutter | null)[] {
  const own = pageCells.map(cells => findGutter(cells));
  const shared = own.find(g => g !== null) || null;
  return pageCells.map((cells, i) => own[i] || (shared && gutterFits(cells, shared) ? shared : null));
}

export function pdfPagesToBlocks(pages: PdfItem[][], splitColumns: boolean): CvBlock[] {
  const main: CvBlock[] = [];
  const side: CvBlock[] = [];
  const pageCells = pages.map(items => buildCells(items));
  const gutters = splitColumns ? pageGutters(pageCells) : pageCells.map(() => null);
  pageCells.forEach((cells, i) => {
    const streams = pageStreams(cells, gutters[i]);
    main.push(...streams.main);
    side.push(...streams.side);
  });
  if (!side.length) return main;
  return [...main, { text: '', parts: [], separator: true }, ...side];
}

export function hasColumns(pages: PdfItem[][]): boolean {
  return pageGutters(pages.map(items => buildCells(items))).some(g => g !== null);
}


function headerToken(token: string): string | null {
  if (HEADER_TOKENS.has(token)) return token;
  if (token.length < 3) return null;
  for (const known of HEADER_TOKENS) {
    if (known.length >= 3 && editDistanceAtMostOne(known, token)) return known;
  }
  return null;
}

function isHeaderTokens(text: string): boolean {
  const tokens = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(t => t);
  return tokens.length > 0 && tokens.every(t => headerToken(t));
}

export function isHeaderBlock(block: CvBlock): boolean {
  if (block.table || block.parts.length < 2 && block.text.split(' ').length < 3) return false;
  if (!isHeaderTokens(block.text)) return false;
  const tokens = block.text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/);
  return tokens.filter(t => STRONG_HEADER_TOKENS.has(headerToken(t) || '')).length >= 2;
}

interface ColumnRange { x: number; x2: number; label: string; }

function headerColumns(headerCells: CvCell[]): ColumnRange[] {
  const sorted = [...headerCells].sort((a, b) => a.x - b.x);
  const columns: { x: number; x2: number; cells: CvCell[] }[] = [];
  for (const cell of sorted) {
    const overlapping = columns.find(c => cell.x < c.x2 && cell.x2 > c.x);
    if (overlapping) {
      overlapping.x = Math.min(overlapping.x, cell.x);
      overlapping.x2 = Math.max(overlapping.x2, cell.x2);
      overlapping.cells.push(cell);
    } else {
      columns.push({ x: cell.x, x2: cell.x2, cells: [cell] });
    }
  }
  return columns.map(c => ({
    x: c.x,
    x2: c.x2,
    label: c.cells.sort((a, b) => b.y - a.y).map(cell => cell.text).join(' ').replace(/\s+/g, ' ').trim()
  }));
}

function columnOf(cell: CvCell, columns: ColumnRange[]): number {
  let best = 0;
  let bestOverlap = -Infinity;
  columns.forEach((col, index) => {
    const overlap = Math.min(cell.x2, col.x2) - Math.max(cell.x, col.x);
    const distance = Math.abs((cell.x + cell.x2) / 2 - (col.x + col.x2) / 2);
    const score = overlap > 0 ? overlap * 1000 - distance : -distance;
    if (score > bestOverlap) { bestOverlap = score; best = index; }
  });
  return best;
}

function partitionByAnchors(ys: number[], anchors: number[]): number[][] {
  const n = ys.length;
  const m = anchors.length;
  const cost = (from: number, to: number, anchor: number) => {
    if (from === to) return 0;
    const group = ys.slice(from, to);
    const mean = group.reduce((s, y) => s + y, 0) / group.length;
    return Math.abs(mean - anchor) + 0.3 * (group[0] - group[group.length - 1]);
  };
  const best: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(Infinity));
  const from: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  best[0][0] = 0;
  for (let j = 1; j <= m; j++) {
    for (let i = 0; i <= n; i++) {
      for (let k = 0; k <= i; k++) {
        const total = best[k][j - 1] + cost(k, i, anchors[j - 1]);
        if (total < best[i][j]) { best[i][j] = total; from[i][j] = k; }
      }
    }
  }
  const groups: number[][] = [];
  let end = n;
  for (let j = m; j >= 1; j--) {
    const start = from[end][j];
    groups.unshift(Array.from({ length: end - start }, (_v, i) => start + i));
    end = start;
  }
  return groups;
}

function clusterMeans(list: CvCell[], lineHeight: number): number[] {
  const means: number[] = [];
  let group: number[] = [];
  list.forEach((cell, i) => {
    if (i > 0 && list[i - 1].y - cell.y >= lineHeight * 1.6) {
      means.push(group.reduce((s, y) => s + y, 0) / group.length);
      group = [];
    }
    group.push(cell.y);
  });
  if (group.length) means.push(group.reduce((s, y) => s + y, 0) / group.length);
  return means;
}

function findAnchors(perColumn: CvCell[][], lineHeight: number): number[] | null {
  let best: number[] | null = null;
  let bestLines = Infinity;
  perColumn.forEach(list => {
    if (list.length < 2) return;
    const means = clusterMeans(list, lineHeight);
    if (means.length < 2) return;
    if (!best || means.length > best.length || (means.length === best.length && list.length < bestLines)) {
      best = means;
      bestLines = list.length;
    }
  });
  if (best) return best;
  const counts = perColumn.map(l => l.length).filter(n => n > 0);
  if (counts.length >= 2 && counts.every(n => n === counts[0])) return perColumn.find(l => l.length > 0)!.map(c => c.y);
  return null;
}


function buildPdfTable(headerBlocks: CvBlock[], bodyBlocks: CvBlock[]): string[][] {
  const columns = headerColumns(headerBlocks.flatMap(b => b.cells || []));
  const cells = bodyBlocks.flatMap(b => b.cells || []);
  const perColumn: CvCell[][] = columns.map(() => []);
  cells.forEach(cell => perColumn[columnOf(cell, columns)].push(cell));
  perColumn.forEach(list => list.sort((a, b) => b.y - a.y));
  const heights = cells.map(c => c.h).sort((a, b) => a - b);
  const lineHeight = heights.length ? heights[Math.floor(heights.length / 2)] : 11;
  const anchors = findAnchors(perColumn, lineHeight);
  const table: string[][] = [columns.map(c => c.label)];
  if (!anchors) {
    const flat = [...cells].sort((a, b) => b.y - a.y);
    const rows: CvCell[][] = [];
    flat.forEach((cell, i) => {
      if (i === 0 || flat[i - 1].y - cell.y > lineHeight * 1.8) rows.push([]);
      rows[rows.length - 1].push(cell);
    });
    for (const row of rows) {
      const texts = columns.map(() => '');
      row.forEach(cell => {
        const col = columnOf(cell, columns);
        texts[col] = texts[col] ? `${texts[col]} ${cell.text}` : cell.text;
      });
      table.push(texts.map(t => normalizeText(t)));
    }
    return table;
  }
  const rows = anchors.map(() => columns.map(() => ''));
  perColumn.forEach((list, col) => {
    const groups = partitionByAnchors(list.map(c => c.y), anchors);
    groups.forEach((group, row) => {
      if (group.length) rows[row][col] = group.map(i => list[i].text).join(' ');
    });
  });
  rows.forEach(row => table.push(row.map(t => normalizeText(t))));
  return table;
}


export function tableize(blocks: CvBlock[]): CvBlock[] {
  const result: CvBlock[] = [];
  let index = 0;
  while (index < blocks.length) {
    const block = blocks[index];
    if (block.cells && block.cells.length >= 2 && isHeaderBlock(block)) {
      const headerBlocks = [block];
      while (result.length && result[result.length - 1].cells && isHeaderTokens(result[result.length - 1].text) && result[result.length - 1].text.split(' ').length <= 4) {
        headerBlocks.unshift(result.pop() as CvBlock);
      }
      let next = index + 1;
      while (next < blocks.length && blocks[next].cells && isHeaderTokens(blocks[next].text) && blocks[next].text.split(' ').length <= 4) {
        headerBlocks.push(blocks[next]);
        next++;
      }
      let end = next;
      while (end < blocks.length && !(blocks[end].cells && blocks[end].cells!.length >= 2 && isHeaderBlock(blocks[end]))) end++;
      const body = blocks.slice(next, end).filter(b => b.cells && !b.separator);
      result.push({ text: '', parts: [], table: buildPdfTable(headerBlocks, body) });
      result.push(...blocks.slice(next, end).filter(b => !b.cells && !b.separator));
      index = end;
      continue;
    }
    result.push(block);
    index++;
  }
  return result;
}


const ENTITIES: { [key: string]: string } = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(+code))
    .replace(/&#x([0-9a-f]+);/gi, (_m, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

function lineBlock(text: string, bold: boolean): CvBlock | null {
  const parts: string[] = [];
  const tabs: number[] = [];
  let pendingTabs = 0;
  for (const token of text.split(/(\t+)/)) {
    if (/^\t+$/.test(token)) {
      pendingTabs += token.length;
      continue;
    }
    const part = normalizeText(token);
    if (!part) continue;
    parts.push(part);
    tabs.push(pendingTabs);
    pendingTabs = 0;
  }
  if (!parts.length) return null;
  return { text: normalizeText(parts.join(' ')), parts, tabs, bold };
}

const TAB_STOP = 36;

function partWidth(text: string): number {
  const letters = text.replace(/[^A-Za-z]/g, '');
  return text.length * (letters && letters === letters.toUpperCase() ? 7 : 5.3);
}

function partStarts(block: CvBlock): number[] {
  let position = 0;
  return block.parts.map((part, i) => {
    for (let t = 0; t < (block.tabs as number[])[i]; t++) position = (Math.floor(position / TAB_STOP) + 1) * TAB_STOP;
    const start = position;
    position += partWidth(part);
    return start;
  });
}

function looksLikeEducation(text: string): boolean {
  return /^(institute|institution|university|board|subject|group|major|concentration|result|cgpa|gpa|passing year|pass year|year)\b[^:]*:/i.test(text)
    || /^\(?\s*(ssc|hsc|bsc|msc|bba|mba|diploma|bachelor|master)\b/i.test(text)
    || YEAR_REGEX.test(text);
}

export function routeTabColumns(blocks: CvBlock[]): CvBlock[] | null {
  const main: CvBlock[] = [];
  const side: CvBlock[] = [];
  let active = false;
  let splitX = 0;
  const state = { side: 'L' as 'L' | 'R', leftKey: null as string | null };
  const put = (block: CvBlock, parts: string[], target: 'L' | 'R', tabs?: number[]) => {
    if (!parts.length) return;
    const piece = { text: normalizeText(parts.join(' ')), parts, tabs: tabs || parts.map(() => 0), bold: block.bold };
    (target === 'L' ? main : side).push(piece);
    state.side = target;
    const key = headingKeyOf(parts[0]);
    if (target === 'L' && key) state.leftKey = key;
  };
  for (const block of blocks) {
    if (block.table || !block.tabs) {
      (active && state.side === 'R' ? side : main).push(block);
      continue;
    }
    const starts = partStarts(block);
    const headings = block.parts.map(p => !!headingKeyOf(p));
    if (block.parts.length >= 2 && headings.every(h => h)) {
      active = true;
      splitX = starts[starts.length - 1];
      put(block, block.parts.slice(0, -1), 'L');
      put(block, block.parts.slice(-1), 'R');
      continue;
    }
    if (!active) {
      main.push(block);
      continue;
    }
    if (block.parts.length === 1 && block.tabs[0] < 3) {
      const text = block.parts[0];
      const key = headingKeyOf(text);
      let target = state.side;
      if (!key && state.leftKey === 'education') target = looksLikeEducation(text) ? 'L' : 'R';
      put(block, block.parts, target);
      continue;
    }
    const left: string[] = [];
    const right: string[] = [];
    let seenRight = false;
    block.parts.forEach((part, i) => {
      const bareYear = i > 0 && /^(?:19|20)\d{2}$/.test(part);
      const toRight = seenRight || headings[i] || (i === 0 && block.tabs![0] >= 3) || (!bareYear && starts[i] >= splitX - 18);
      if (toRight) seenRight = true;
      (toRight ? right : left).push(part);
    });
    put(block, left, 'L');
    put(block, right, 'R');
    if (!right.length) state.side = 'L';
  }
  if (!active) return null;
  return side.length ? [...main, { text: '', parts: [], separator: true }, ...side] : main;
}

function flattenRow(row: string[]): CvBlock[] {
  const filled = row.filter(c => c.trim());
  if (filled.length >= 2 && headingKeyOf(normalizeText(filled[0]))) {
    const content = filled.slice(1).flatMap(cell => flattenRow([cell]));
    return [{ text: normalizeText(filled[0]), parts: [normalizeText(filled[0])] }, ...content];
  }
  if (filled.length === 1 && filled[0].includes('\n')) {
    return filled[0].split('\n').map(line => normalizeText(line)).filter(line => line).map(line => ({ text: line, parts: [line] }));
  }
  const parts = row.map(c => normalizeText(c)).filter(c => c);
  return parts.length ? [{ text: parts.join(' '), parts }] : [];
}

interface TableContext { layout: boolean; rows: string[][]; rowCells: string[]; cellText: string; }

function nestedTableFlags(tokens: string[]): boolean[] {
  const flags: boolean[] = tokens.map(() => false);
  const open: number[] = [];
  tokens.forEach((token, index) => {
    if (/^<table[\s>]/i.test(token)) {
      if (open.length) flags[open[open.length - 1]] = true;
      open.push(index);
    } else if (/^<\/table/i.test(token)) {
      open.pop();
    }
  });
  return flags;
}

export function htmlToBlocks(html: string): CvBlock[] {
  const tokens = html.replace(/<img[^>]*>/gi, '').match(/<\/?[a-z][^>]*>|[^<]+/gi) || [];
  const nested = nestedTableFlags(tokens);
  const blocks: CvBlock[] = [];
  const tables: TableContext[] = [];
  const listStack: { ordered: boolean; count: number }[] = [];
  let paragraph = '';
  let boldChars = 0;
  let boldDepth = 0;
  let prefix = '';
  let inParagraph = false;

  const flushParagraph = () => {
    if (!inParagraph) return;
    inParagraph = false;
    const lines = paragraph.split('\n');
    const bold = paragraph.trim().length > 0 && boldChars >= paragraph.replace(/\s/g, '').length * 0.8;
    const table = tables[tables.length - 1];
    if (table && !table.layout) {
      table.cellText += '\n' + lines.join(' ');
    } else {
      lines.forEach((line, i) => {
        const block = lineBlock((i === 0 ? prefix : '') + line, bold);
        if (block) blocks.push(block);
      });
    }
    paragraph = '';
    boldChars = 0;
    prefix = '';
  };

  const finishTable = (table: TableContext) => {
    const rows = table.rows.map(r => r.map(c => c.trim())).filter(r => r.some(c => c));
    if (!rows.length) return;
    const firstRow = rows[0].filter(c => c);
    if (rows.length > 1 && firstRow.length >= 2 && isHeaderBlock({ text: firstRow.join(' '), parts: firstRow })) {
      blocks.push({ text: '', parts: [], table: rows.map(r => r.map(c => normalizeText(c))) });
      return;
    }
    rows.forEach(r => blocks.push(...flattenRow(r)));
  };

  tokens.forEach((token, tokenIndex) => {
    if (token[0] !== '<') {
      const text = decodeEntities(token);
      const table = tables[tables.length - 1];
      if (inParagraph || (table && !table.layout)) {
        if (!inParagraph) { inParagraph = true; paragraph = ''; }
        paragraph += text;
        if (boldDepth > 0) boldChars += text.replace(/\s/g, '').length;
      }
      return;
    }
    const match = token.match(/^<(\/?)([a-z0-9]+)/i);
    if (!match) return;
    const closing = match[1] === '/';
    const tag = match[2].toLowerCase();
    const table = tables[tables.length - 1];
    if (tag === 'br') {
      if (inParagraph) paragraph += '\n';
    } else if (tag === 'strong' || tag === 'b') {
      boldDepth = Math.max(0, boldDepth + (closing ? -1 : 1));
    } else if (tag === 'ol' || tag === 'ul') {
      if (closing) listStack.pop();
      else listStack.push({ ordered: tag === 'ol', count: 0 });
    } else if (tag === 'p' || /^h[1-6]$/.test(tag) || tag === 'li') {
      flushParagraph();
      if (!closing) {
        inParagraph = true;
        paragraph = '';
        if (tag === 'li' && listStack.length) {
          const list = listStack[listStack.length - 1];
          list.count++;
          prefix = list.ordered ? `${list.count}. ` : '• ';
        }
      }
    } else if (tag === 'table') {
      flushParagraph();
      if (closing) {
        const finished = tables.pop();
        if (finished && !finished.layout) finishTable(finished);
      } else {
        tables.push({ layout: nested[tokenIndex], rows: [], rowCells: [], cellText: '' });
      }
    } else if (tag === 'tr' && table && !table.layout) {
      flushParagraph();
      if (closing) {
        if (table.rowCells.length) table.rows.push(table.rowCells);
        table.rowCells = [];
      } else {
        table.rowCells = [];
      }
    } else if ((tag === 'td' || tag === 'th') && table && !table.layout) {
      flushParagraph();
      if (closing) {
        table.rowCells.push(table.cellText.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim());
      }
      table.cellText = '';
    }
  });
  flushParagraph();
  return blocks;
}


export function textToBlocks(text: string): CvBlock[] {
  return text.replace(/\r/g, '').split('\n').map(line => {
    const parts = line.split(/\s{3,}|\t+/).map(p => normalizeText(p)).filter(p => p);
    return parts.length ? { text: normalizeText(parts.join(' ')), parts } as CvBlock : null;
  }).filter((b): b is CvBlock => !!b);
}
