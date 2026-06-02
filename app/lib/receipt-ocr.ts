export type ParsedReceiptUnitType = "pcs" | "case" | "unknown";

export type ParsedReceiptItem = {
  rawLine: string;
  rawProductName: string;
  normalizedProductName: string;
  quantity: number;
  unitType: ParsedReceiptUnitType;
  confidence: number;
  matchedProductId?: string;
  matchedProductName?: string;
  needsReview: boolean;
};

export type ReceiptMatchProduct = {
  id: string;
  name: string;
  active?: boolean;
};

export type ParsedReceiptOcr = ParsedReceiptItem[] & {
  ignoredRows: string[];
  ignoredLines: string[];
};

const MIN_ITEM_CONFIDENCE = 55;
const AUTO_MATCH_THRESHOLD = 0.82;

const serviceMarkers = [
  /\bBARRACUDA\b/,
  /\bBEACH\s+RESORT\b/,
  /\bP\s*B\s*NO\b/,
  /\bPB\s*NO\b/,
  /\bUMM\s+AL\s+QWAIN\b/,
  /\bU\s*\.?\s*A\s*\.?\s*E\b/,
  /\bWHATSAPP\b/,
  /\bTEL\b/,
  /\bEMAIL\b/,
  /\bVAT\b/,
  /\bREG\b/,
  /\bSLIP\b/,
  /\bSTAFF\b/,
  /\bDATE\b/,
  /\bTIME\b/,
  /\bSUSPENDED\b/,
  /\bDESCRIPTION\b/,
  /\bQUANTITY\b/,
  /\bTOTAL\b/,
  /\bTHANK\b/,
  /\bVISITING\b/
];

const blockEndMarkers = [
  /\bGRAND\s+TOTAL\b/,
  /\bTOTAL\b/,
  /\bTHANK\s+YOU\b/,
  /\bTHANK\b/,
  /\bBARCODE\b/,
  /\bVAT\b/
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
  "BLANC",
  "ROSE",
  "PCS",
  "PC",
  "PES",
  "POS",
  "OCS",
  "ML",
  "CL",
  "LTR",
  "LT",
  "L",
  "X",
  "24X",
  "24"
]);

function cleanReceiptLine(line: string) {
  return line
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/[|_*~^`]+/g, " ")
    .replace(/[“”"']/g, "")
    .replace(/^[\s=._:/\\-]+/g, "")
    .replace(/[\s=._:/\\-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSearchText(value: string) {
  return cleanReceiptLine(value)
    .toUpperCase()
    .replace(/[^\w\s./&-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isReceiptServiceLine(line: string) {
  const upper = normalizeSearchText(line);
  return serviceMarkers.some((marker) => marker.test(upper));
}

function isBlockHeaderLine(line: string, nextLine?: string) {
  const upper = normalizeSearchText(line);
  const nextUpper = nextLine ? normalizeSearchText(nextLine) : "";
  if (/\bDESCRIPTION\b/.test(upper) && /\bQUANTITY\b/.test(upper)) return { found: true, width: 1 };
  if (/\bDESCRIPTION\b/.test(upper) && /\bQUANTITY\b/.test(nextUpper)) return { found: true, width: 2 };
  return { found: false, width: 0 };
}

function isBlockEndLine(line: string) {
  const upper = normalizeSearchText(line);
  return blockEndMarkers.some((marker) => marker.test(upper));
}

function hasEnoughProductText(value: string) {
  const alnum = value.replace(/[^A-Z0-9]/gi, "");
  const letters = value.replace(/[^A-Z]/gi, "");
  const digits = value.replace(/\D/g, "");
  return value.length >= 4 && letters.length >= 2 && digits.length <= Math.max(letters.length * 2, 8) && alnum.length >= 4;
}

function normalizeProductName(value: string) {
  return value
    .toUpperCase()
    .replace(/\bBUDHEISER\b/g, "BUDWEISER")
    .replace(/\bBONBAY\b/g, "BOMBAY")
    .replace(/\bHETNEKEN\b/g, "HEINEKEN")
    .replace(/\bJOHNNIEE\b|\bJOHNNIE\b|\bJOHANIE\b/g, "JOHNNIE")
    .replace(/\bLABS\b|\bLABE\b|\bLAB\b/g, "LABEL")
    .replace(/\bWHISKEY\b/g, "WHISKY")
    .replace(/\bTEQULS\b/g, "TEQUILA")
    .replace(/\bPOS\b|\bPES\b|\bOCS\b/g, "PCS")
    .replace(/\bJACOBS\s+CREEK\b/g, "JC")
    .replace(/\bCOTES?\s+D\s+PROVENC(?:E)?\b/g, "PROVENCE")
    .replace(/\bWHISPERING\s+ANGEL\b/g, "WHISPERING")
    .replace(/\bGLENFIDDICH\b/g, "GLENDFIDICH")
    .replace(/\b1\s*LTR\b|\b1LTR\b|\bI\s*LTR\b|\bILTR\b/g, "LTR")
    .replace(/\bLIT(?:ER|RE)\b/g, "LTR")
    .replace(/\b(\d+)\s*YRS?\b/g, "$1 YRS")
    .replace(/\b(\d+)YRS?\b/g, "$1 YRS")
    .replace(/\b18Y\b/g, "18 YRS")
    .replace(/\b21Y\b/g, "21 YRS")
    .replace(/\b25YR\b/g, "25 YRS")
    .replace(/\b330\s*ML\b/g, "33")
    .replace(/\b355\s*ML\b/g, "35.5")
    .replace(/\b355\b/g, "35.5")
    .replace(/\b500\s*ML\b/g, "50")
    .replace(/\b700\s*ML\b/g, "70")
    .replace(/\b750\s*ML\b|\b750M\b|\b750\b/g, "75")
    .replace(/\b33\s*CL\b/g, "33")
    .replace(/\b35\.5\s*CL\b/g, "35.5")
    .replace(/\b50\s*CL\b/g, "50")
    .replace(/\b70\s*CL\b/g, "70")
    .replace(/\b75\s*CL\b|\b75C\b/g, "75")
    .replace(/J\s*\/\s*W/g, "JOHNNIE WALKER")
    .replace(/\bJW\b/g, "JOHNNIE WALKER")
    .replace(/\bBLAK\b/g, "BLACK")
    .replace(/\bBLACK\s+LABELEL\b/g, "BLACK LABEL")
    .replace(/\bJACK\s+DANIEL\b/g, "JACK DANIELS")
    .replace(/\bSAUV\b/g, "SAUVIGNON")
    .replace(/33\s*\/\s*35/g, "33 35")
    .replace(/[^A-Z0-9.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function receiptMatchTokens(value: string) {
  return normalizeProductName(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && !matchStopWords.has(token));
}

function canonicalConfusable(value: string) {
  return value.replace(/0/g, "O").replace(/1/g, "I");
}

function levenshtein(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let i = 1; i <= left.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    for (let j = 0; j <= right.length; j += 1) previous[j] = current[j];
  }

  return previous[right.length];
}

function tokenMatches(left: string, right: string) {
  if (left === right) return true;
  const cleanLeft = canonicalConfusable(left);
  const cleanRight = canonicalConfusable(right);
  if (cleanLeft === cleanRight) return true;
  if (cleanLeft.length > 3 && cleanRight.length > 3 && (cleanLeft.includes(cleanRight) || cleanRight.includes(cleanLeft))) return true;

  const longest = Math.max(cleanLeft.length, cleanRight.length);
  if (longest < 5) return false;
  const distance = levenshtein(cleanLeft, cleanRight);
  return distance <= (longest >= 9 ? 2 : 1);
}

function countMatches(source: string[], target: string[]) {
  return source.reduce((total, token) => total + (target.some((other) => tokenMatches(token, other)) ? 1 : 0), 0);
}

function diceCoefficient(left: string, right: string) {
  const a = normalizeProductName(left).replace(/\s+/g, "");
  const b = normalizeProductName(right).replace(/\s+/g, "");
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;

  const grams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i += 1) {
    const gram = a.slice(i, i + 2);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }

  let overlap = 0;
  for (let i = 0; i < b.length - 1; i += 1) {
    const gram = b.slice(i, i + 2);
    const count = grams.get(gram) ?? 0;
    if (count > 0) {
      overlap += 1;
      grams.set(gram, count - 1);
    }
  }

  return (2 * overlap) / (a.length + b.length - 2);
}

function productMatchScore(productText: string, productName: string) {
  const sourceTokens = receiptMatchTokens(productText);
  const productTokens = receiptMatchTokens(productName);
  if (sourceTokens.length === 0 || productTokens.length === 0) return 0;

  const sourceMatches = countMatches(sourceTokens, productTokens);
  const productMatches = countMatches(productTokens, sourceTokens);
  const sourceRatio = sourceMatches / sourceTokens.length;
  const productRatio = productMatches / Math.min(productTokens.length, sourceTokens.length);
  const charRatio = diceCoefficient(productText, productName);
  const brandBonus = tokenMatches(sourceTokens[0], productTokens[0]) ? 0.08 : 0;

  return Math.min(1, sourceRatio * 0.72 + productRatio * 0.18 + charRatio * 0.1 + brandBonus);
}

function findBestProduct(productText: string, products: ReceiptMatchProduct[]) {
  let best: { product: ReceiptMatchProduct; score: number } | null = null;
  for (const product of products.filter((item) => item.active !== false)) {
    const score = productMatchScore(productText, product.name);
    if (!best || score > best.score) best = { product, score };
  }
  return best;
}

function parseQuantityTail(rawLine: string) {
  const pcsMatch = rawLine.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(pcs|pc|pes|pos|ocs)\s*$/i);
  if (pcsMatch) {
    return {
      rawProductName: cleanReceiptLine(pcsMatch[1]),
      quantity: Number(pcsMatch[2].replace(",", ".")),
      unitType: "pcs" as ParsedReceiptUnitType
    };
  }

  const caseMatch = rawLine.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*24\s*x\s*$/i);
  if (caseMatch) {
    return {
      rawProductName: cleanReceiptLine(caseMatch[1]),
      quantity: Number(caseMatch[2].replace(",", ".")),
      unitType: "case" as ParsedReceiptUnitType
    };
  }

  return null;
}

function itemConfidence(matchScore: number, hasMatch: boolean) {
  if (!hasMatch) return 72;
  if (matchScore >= AUTO_MATCH_THRESHOLD) return Math.min(100, Math.round(88 + ((matchScore - AUTO_MATCH_THRESHOLD) / (1 - AUTO_MATCH_THRESHOLD)) * 12));
  return Math.round(68 + matchScore * 15);
}

export function parseReceiptProductLine(rawLine: string, products: ReceiptMatchProduct[] = []): ParsedReceiptItem | null {
  const cleanedLine = cleanReceiptLine(rawLine);
  if (!cleanedLine || isReceiptServiceLine(cleanedLine)) return null;

  const quantityTail = parseQuantityTail(cleanedLine);
  if (!quantityTail) return null;

  const { rawProductName, quantity, unitType } = quantityTail;
  if (!Number.isFinite(quantity) || quantity <= 0 || !hasEnoughProductText(rawProductName)) return null;

  const normalizedProductName = normalizeProductName(rawProductName);
  const best = findBestProduct(normalizedProductName, products);
  const hasAutoMatch = Boolean(best && best.score >= AUTO_MATCH_THRESHOLD);
  const confidence = itemConfidence(best?.score ?? 0, Boolean(best));
  if (confidence < MIN_ITEM_CONFIDENCE) return null;

  return {
    rawLine: cleanedLine,
    rawProductName,
    normalizedProductName,
    quantity,
    unitType,
    confidence,
    matchedProductId: hasAutoMatch ? best?.product.id : undefined,
    matchedProductName: best?.product.name,
    needsReview: !hasAutoMatch
  };
}

function withIgnoredRows(items: ParsedReceiptItem[], ignoredRows: string[]): ParsedReceiptOcr {
  const result = items as ParsedReceiptOcr;
  result.ignoredRows = ignoredRows.filter(Boolean);
  result.ignoredLines = result.ignoredRows;
  return result;
}

export function parseReceiptOcrText(rawText: string, products: ReceiptMatchProduct[] = []): ParsedReceiptOcr {
  const lines = rawText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(cleanReceiptLine)
    .filter(Boolean);

  const ignoredRows: string[] = [];
  const header = lines.reduce<{ index: number; width: number } | null>((found, line, index) => {
    if (found) return found;
    const headerMatch = isBlockHeaderLine(line, lines[index + 1]);
    return headerMatch.found ? { index, width: headerMatch.width } : null;
  }, null);

  if (!header) return withIgnoredRows([], lines);

  ignoredRows.push(...lines.slice(0, header.index + header.width));

  const items: ParsedReceiptItem[] = [];
  for (let index = header.index + header.width; index < lines.length; index += 1) {
    const line = lines[index];

    if (isBlockEndLine(line)) {
      ignoredRows.push(...lines.slice(index));
      break;
    }

    if (isReceiptServiceLine(line)) {
      ignoredRows.push(line);
      continue;
    }

    const parsed = parseReceiptProductLine(line, products);
    if (parsed) {
      items.push(parsed);
    } else {
      ignoredRows.push(line);
    }
  }

  return withIgnoredRows(items, ignoredRows);
}

export function receiptProductConfidence(productText: string, productName: string) {
  return Math.round(productMatchScore(productText, productName) * 100);
}
