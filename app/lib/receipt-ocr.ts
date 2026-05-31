export type ParsedReceiptLine = {
  rawText: string;
  productText: string;
  quantity: number;
};

export type ParsedReceiptOcr = {
  items: ParsedReceiptLine[];
  ignoredLines: string[];
};

const serviceMarkers = [
  /barracuda/,
  /beach resort/,
  /\bp\s*b\s*no\b/,
  /\bpb\s*no\b/,
  /umm al qwain/,
  /\bu\s*a\s*e\b/,
  /whatsapp/,
  /\btel\b/,
  /email/,
  /\bvat\b/,
  /\bslip\b/,
  /\bstaff\b/,
  /\bdate\b/,
  /\btime\b/,
  /suspended/,
  /description/,
  /quantity/,
  /\btotal\b/,
  /\bthank\b/,
  /barcode/
];

const matchStopWords = new Set([
  "VODKA",
  "RUM",
  "WHISKY",
  "WHISKEY",
  "GIN",
  "BEER",
  "CAN",
  "CANS",
  "BTL",
  "BTLS",
  "BOTTLE",
  "CARTA",
  "O",
  "BLANC",
  "PCS",
  "PC"
]);

function compactServiceText(value: string) {
  return value
    .toLowerCase()
    .replace(/[._/\\:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isReceiptServiceLine(line: string) {
  const folded = compactServiceText(line);
  return serviceMarkers.some((marker) => marker.test(folded));
}

function cleanReceiptLine(line: string) {
  return line
    .replace(/\s+/g, " ")
    .replace(/^[\s"'=_|\-]+/g, "")
    .replace(/[\s"'=_|\-]+$/g, "")
    .trim();
}

function cleanProductText(value: string) {
  return value
    .replace(/\bpcs?\b/gi, "")
    .replace(/\b(?:24\s*x|x\s*24)\b/gi, "")
    .replace(/["=_|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseReceiptProductLine(rawLine: string): ParsedReceiptLine | null {
  const rawText = cleanReceiptLine(rawLine);
  if (!rawText || isReceiptServiceLine(rawText)) return null;

  const pcMatch = rawText.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*p\s*c\s*s?$/i);
  const packMatch = rawText.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:24\s*x|x\s*24)$/i);
  const match = pcMatch ?? packMatch;
  if (!match) return null;

  const productText = cleanProductText(match[1]);
  const quantity = Number(match[2].replace(",", "."));
  if (!productText || !/[a-zа-я]/i.test(productText) || !Number.isFinite(quantity) || quantity <= 0) return null;

  return {
    rawText,
    productText,
    quantity
  };
}

export function parseReceiptOcrText(text: string): ParsedReceiptOcr {
  const lines = text
    .split(/\r?\n/)
    .map(cleanReceiptLine)
    .filter(Boolean);
  const ignoredLines: string[] = [];

  const headerIndex = lines.findIndex((line) => /description\s+quantity/i.test(line) || (/description/i.test(line) && /quantity/i.test(line)));
  const fallbackStartIndex = lines.findIndex((line) => Boolean(parseReceiptProductLine(line)));
  const startIndex = headerIndex >= 0 ? headerIndex + 1 : Math.max(fallbackStartIndex, 0);
  const endIndex = lines.findIndex((line, index) => index >= startIndex && /\btotal\b|thank you|barcode/i.test(line));
  const zoneEnd = endIndex >= 0 ? endIndex : lines.length;
  const zone = lines.slice(startIndex, zoneEnd);

  for (const line of lines.slice(0, startIndex)) {
    if (line) ignoredLines.push(line);
  }
  for (const line of lines.slice(zoneEnd)) {
    if (line) ignoredLines.push(line);
  }

  const items: ParsedReceiptLine[] = [];
  for (const line of zone) {
    if (isReceiptServiceLine(line)) {
      ignoredLines.push(line);
      continue;
    }

    const parsed = parseReceiptProductLine(line);
    if (parsed) {
      items.push(parsed);
    } else {
      ignoredLines.push(line);
    }
  }

  return {
    items,
    ignoredLines: ignoredLines.filter(Boolean)
  };
}

function normalizeMatchText(value: string) {
  return value
    .toUpperCase()
    .replace(/JOHNNIE\s+WALKER/g, "JW")
    .replace(/J\s*\/\s*W/g, "JW")
    .replace(/\bBLAK\b/g, "BLACK")
    .replace(/\bBLACK\s+LAB\b/g, "BLACK LABEL")
    .replace(/\bLAB\b/g, "LABEL")
    .replace(/\bJACK\s+DANIEL\b/g, "JACK DANIELS")
    .replace(/\bSAUV\b/g, "SAUVIGNON")
    .replace(/\b1\s*LTR\b/g, "LTR")
    .replace(/\b1LTR\b/g, "LTR")
    .replace(/\bLIT(?:ER|RE)\b/g, "LTR")
    .replace(/\b330\s*ML\b/g, "33")
    .replace(/\b355\s*ML\b/g, "35.5")
    .replace(/\b355\b/g, "35.5")
    .replace(/\b500\s*ML\b/g, "50")
    .replace(/\b700\s*ML\b/g, "70")
    .replace(/\b750\s*ML\b/g, "75")
    .replace(/\b33\s*CL\b/g, "33")
    .replace(/\b35\.5\s*CL\b/g, "35.5")
    .replace(/\b50\s*CL\b/g, "50")
    .replace(/\b70\s*CL\b/g, "70")
    .replace(/\b75\s*CL\b/g, "75")
    .replace(/33\s*\/\s*35/g, "33 35")
    .replace(/[^A-Z0-9.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function receiptMatchTokens(value: string) {
  return normalizeMatchText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && !matchStopWords.has(token));
}

function tokenMatches(left: string, right: string) {
  if (left === right) return true;
  if (left.length <= 2 || right.length <= 2) return false;
  return left.includes(right) || right.includes(left);
}

function countMatches(source: string[], target: string[]) {
  return source.reduce((total, token) => total + (target.some((other) => tokenMatches(token, other)) ? 1 : 0), 0);
}

export function receiptProductConfidence(productText: string, productName: string) {
  const sourceTokens = receiptMatchTokens(productText);
  const productTokens = receiptMatchTokens(productName);
  if (sourceTokens.length === 0 || productTokens.length === 0) return 0;

  const sourceMatches = countMatches(sourceTokens, productTokens);
  const productMatches = countMatches(productTokens, sourceTokens);
  const sourceRatio = sourceMatches / sourceTokens.length;
  const productRatio = productMatches / productTokens.length;
  const brandBonus = tokenMatches(sourceTokens[0], productTokens[0]) ? 8 : 0;

  return Math.min(100, Math.round((sourceRatio * 0.65 + productRatio * 0.35) * 100 + brandBonus));
}
