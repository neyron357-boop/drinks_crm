"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  Home,
  ImageDown,
  ImagePlus,
  MoreHorizontal,
  Package,
  PackagePlus,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Truck,
  Upload,
  WalletCards,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  calculateCash,
  calculateCashTotal,
  calculateDashboard,
  calculateReportLines,
  calculateReportRevenue,
  countProblems,
  getReport,
  getReportWarnings,
  money
} from "./lib/calculations";
import { applyCarryoverAfterClose } from "./lib/carryover";
import { downloadBlob } from "./lib/download";
import { createExcelReportFile } from "./lib/excel";
import { importExcelReport } from "./lib/excel-import";
import { formatDecimal, parseDecimal, parseOptionalDecimal } from "./lib/numbers";
import { productSortNumber } from "./lib/product-order";
import { parseReceiptOcrText } from "./lib/receipt-ocr";
import { CASH_COLUMN_KEYS } from "./lib/template-data";
import { createEmptyReport, createInitialState, reportId, STORAGE_KEY } from "./lib/seed";
import { loadState, saveState } from "./lib/storage";
import type {
  AppState,
  CashColumnKey,
  CashInput,
  DailyReport,
  ImportMode,
  Product,
  ReportItemInput,
  ReportLine,
  Transfer
} from "./lib/types";

type Tab = "home" | "inventory" | "receipts" | "transfers" | "finance" | "more";
type StockFilter = "all" | "empty" | "issues" | "request" | "sold";
type ItemField = "incoming" | "movement" | "homeRest" | "extraRequest";
type ProductField = "price" | "norm" | "quantityStep";

type ProductDraft = {
  name: string;
  price: string;
  norm: string;
  quantityStep: string;
  allowDecimal: boolean;
};

type ShortageImageDriver = {
  columnKey: CashColumnKey;
  driverName: string;
  shouldHandOver: number;
  handedOver: number;
  shortage: number;
};

type ShortageImagePoint = {
  pointId: string;
  pointName: string;
  hasReport: boolean;
  total: number;
  drivers: ShortageImageDriver[];
};

type ShortageImageData = {
  date: string;
  total: number;
  affectedPoints: number;
  affectedDrivers: number;
  points: ShortageImagePoint[];
};

type FileShareData = {
  files?: File[];
  title?: string;
  text?: string;
};

type FileShareNavigator = Navigator & {
  canShare?: (data: FileShareData) => boolean;
  share?: (data: FileShareData) => Promise<void>;
};

const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shortDate = (date: string) => date.split("-").reverse().join(".");
const num = (value: number | undefined) => formatDecimal(value);
const currency = (value: number) => `${value.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} AED`;
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function buildShortageImageData(state: AppState, date: string): ShortageImageData {
  const points = state.points
    .filter((point) => point.active)
    .map<ShortageImagePoint>((point) => {
      const report = getReport(state, date, point.id);
      const drivers =
        report
          ? CASH_COLUMN_KEYS.map((columnKey) => {
              const cash = calculateCash(safeCash(report, columnKey));
              return {
                columnKey,
                driverName: cash.driverName || `Колонка ${columnKey}`,
                shouldHandOver: cash.shouldHandOver,
                handedOver: cash.handedOver,
                shortage: money(Math.abs(Math.min(cash.shortageOrPlus, 0)))
              };
            }).filter((driver) => driver.shortage > 0.01)
          : [];

      return {
        pointId: point.id,
        pointName: point.name,
        hasReport: Boolean(report),
        drivers,
        total: money(drivers.reduce((sum, driver) => sum + driver.shortage, 0))
      };
    });

  return {
    date,
    points,
    total: money(points.reduce((sum, point) => sum + point.total, 0)),
    affectedPoints: points.filter((point) => point.total > 0.01).length,
    affectedDrivers: points.reduce((sum, point) => sum + point.drivers.length, 0)
  };
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke?: string
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function truncateCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let next = text;
  while (next.length > 1 && ctx.measureText(`${next}...`).width > maxWidth) {
    next = next.slice(0, -1);
  }
  return `${next}...`;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Не удалось создать PNG."));
    }, "image/png");
  });
}

async function createShortageImageBlob(data: ShortageImageData) {
  await document.fonts?.ready;

  const width = 1080;
  const pointHeights = data.points.map((point) => 112 + Math.max(1, point.drivers.length) * 82);
  const height = Math.max(760, 338 + pointHeights.reduce((sum, value) => sum + value, 0) + 74);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступен.");

  const hasShortage = data.total > 0.01;
  const danger = "#b91c1c";
  const dangerSoft = "#fee2e2";
  const good = "#0f766e";
  const goodSoft = "#dcfce7";
  const ink = "#111827";
  const muted = "#64748b";
  const line = "#d8dee8";

  ctx.fillStyle = hasShortage ? "#fff7f7" : "#f6fffb";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = hasShortage ? danger : good;
  ctx.fillRect(0, 0, width, 196);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 62px Segoe UI, Arial, sans-serif";
  ctx.fillText(hasShortage ? "НЕДОСТАЧА ПО КАССЕ" : "НЕДОСТАЧ НЕТ", 54, 86);
  ctx.font = "700 30px Segoe UI, Arial, sans-serif";
  ctx.fillText(`Дата: ${shortDate(data.date)}`, 58, 135);
  ctx.font = "900 44px Segoe UI, Arial, sans-serif";
  ctx.fillText(`ИТОГО: ${currency(data.total)}`, 58, 178);

  const summaryY = 224;
  const summaryCards = [
    ["СУММА НЕДОСТАЧИ", currency(data.total)],
    ["ТОЧЕК С ПРОБЛЕМОЙ", String(data.affectedPoints)],
    ["ВОДИТЕЛЕЙ", String(data.affectedDrivers)]
  ];
  summaryCards.forEach(([label, value], index) => {
    const cardWidth = 306;
    const x = 54 + index * 342;
    drawRoundRect(ctx, x, summaryY, cardWidth, 82, 16, "#ffffff", line);
    ctx.fillStyle = muted;
    ctx.font = "800 20px Segoe UI, Arial, sans-serif";
    ctx.fillText(label, x + 22, summaryY + 30);
    ctx.fillStyle = hasShortage && index === 0 ? danger : ink;
    ctx.font = "900 32px Segoe UI, Arial, sans-serif";
    ctx.fillText(value, x + 22, summaryY + 66);
  });

  let y = 342;
  for (const point of data.points) {
    const pointHasShortage = point.total > 0.01;
    const cardHeight = pointHeights[data.points.indexOf(point)];
    const tone = pointHasShortage ? danger : point.hasReport ? good : "#6b7280";
    const soft = pointHasShortage ? dangerSoft : point.hasReport ? goodSoft : "#f1f5f9";

    drawRoundRect(ctx, 54, y, 972, cardHeight, 18, "#ffffff", line);
    ctx.fillStyle = tone;
    ctx.fillRect(54, y, 12, cardHeight);
    drawRoundRect(ctx, 86, y + 24, 46, 46, 23, soft);
    ctx.fillStyle = tone;
    ctx.font = "900 30px Segoe UI, Arial, sans-serif";
    ctx.fillText(pointHasShortage ? "!" : point.hasReport ? "OK" : "?", 100, y + 58);

    ctx.fillStyle = ink;
    ctx.font = "900 36px Segoe UI, Arial, sans-serif";
    ctx.fillText(truncateCanvasText(ctx, point.pointName, 520), 150, y + 54);
    ctx.fillStyle = tone;
    ctx.textAlign = "right";
    ctx.font = "900 34px Segoe UI, Arial, sans-serif";
    ctx.fillText(pointHasShortage ? `НЕДОСТАЧА ${currency(point.total)}` : point.hasReport ? "НЕДОСТАЧ НЕТ" : "НЕТ ОТЧЕТА", 990, y + 54);
    ctx.textAlign = "left";

    let rowY = y + 92;
    if (!point.drivers.length) {
      drawRoundRect(ctx, 86, rowY, 904, 58, 12, soft);
      ctx.fillStyle = point.hasReport ? good : muted;
      ctx.font = "800 25px Segoe UI, Arial, sans-serif";
      ctx.fillText(point.hasReport ? "По этой точке недостач нет" : "По этой точке отчет за день не создан", 108, rowY + 38);
      rowY += 76;
    } else {
      for (const driver of point.drivers) {
        drawRoundRect(ctx, 86, rowY, 904, 68, 12, "#fff5f5", "#fecaca");
        ctx.fillStyle = ink;
        ctx.font = "900 27px Segoe UI, Arial, sans-serif";
        ctx.fillText(truncateCanvasText(ctx, driver.driverName, 390), 108, rowY + 30);
        ctx.fillStyle = muted;
        ctx.font = "700 20px Segoe UI, Arial, sans-serif";
        ctx.fillText(`Должен сдать: ${currency(driver.shouldHandOver)}    Сдал: ${currency(driver.handedOver)}`, 108, rowY + 56);
        ctx.fillStyle = danger;
        ctx.textAlign = "right";
        ctx.font = "900 31px Segoe UI, Arial, sans-serif";
        ctx.fillText(currency(driver.shortage), 966, rowY + 44);
        ctx.textAlign = "left";
        rowY += 82;
      }
    }

    y += cardHeight + 18;
  }

  drawRoundRect(ctx, 54, height - 58, 972, 38, 12, hasShortage ? "#fee2e2" : "#dcfce7");
  ctx.fillStyle = hasShortage ? danger : good;
  ctx.font = "800 21px Segoe UI, Arial, sans-serif";
  ctx.fillText(hasShortage ? "Проверьте кассу и внесите недостающую сумму сегодня." : "Все точки без недостач по кассе.", 78, height - 33);
  ctx.textAlign = "right";
  ctx.fillText("Drinks CRM", 1002, height - 33);
  ctx.textAlign = "left";

  return canvasToBlob(canvas);
}

const stockFilters: Array<{ id: StockFilter; label: string }> = [
  { id: "all", label: "Все" },
  { id: "empty", label: "Не заполнено" },
  { id: "issues", label: "Ошибки" },
  { id: "request", label: "Заявка" },
  { id: "sold", label: "Продажи" }
];

const navItems: Array<{ id: Exclude<Tab, "more">; label: string; icon: ReactNode }> = [
  { id: "home", label: "Главная", icon: <Home size={19} /> },
  { id: "inventory", label: "Остатки", icon: <Package size={19} /> },
  { id: "receipts", label: "Приход", icon: <PackagePlus size={19} /> },
  { id: "transfers", label: "Перемещения", icon: <Truck size={19} /> },
  { id: "finance", label: "Финансы", icon: <WalletCards size={19} /> }
];

const financeLabels: Array<[keyof CashInput, string]> = [
  ["discounts", "Скидки"],
  ["foodExpenses", "Питание"],
  ["fuel", "Бензин"],
  ["kfc", "KFC"],
  ["forHome", "Для дома"],
  ["carWash", "Мойка"],
  ["tinting", "Тонировка"],
  ["otherExpenses", "Другие расходы"]
];

function firstActivePointId(state: AppState) {
  return state.points.find((point) => point.active)?.id ?? state.points[0]?.id ?? "";
}

function firstDriverId(state: AppState, pointId: string) {
  return (
    state.drivers.find((driver) => driver.active && driver.pointId === pointId)?.id ??
    state.drivers.find((driver) => driver.active)?.id ??
    ""
  );
}

function createReportFor(state: AppState, date: string, pointId: string) {
  return createEmptyReport(date, pointId, firstDriverId(state, pointId), state.products);
}

function upsertReport(state: AppState, report: DailyReport): AppState {
  const exists = state.reports.some((item) => item.id === report.id);
  return {
    ...state,
    reports: exists ? state.reports.map((item) => (item.id === report.id ? report : item)) : [...state.reports, report]
  };
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-|-$/g, "");
  return slug || `product-${makeId()}`;
}

function uniqueProductId(products: Product[], base: string) {
  let id = base;
  let index = 2;
  while (products.some((product) => product.id === id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function hasLineIssue(line: ReportLine) {
  return line.warnings.some((warning) => warning.severity !== "info") || line.sale < -0.001;
}

function lineStatus(line: ReportLine) {
  if (hasLineIssue(line)) return "issue";
  if (typeof line.homeRest === "number") return "done";
  return "empty";
}

function itemNumberValue(report: DailyReport, productId: string, field: ItemField) {
  return report.items[productId]?.[field];
}

function emptyItem(productId: string): ReportItemInput {
  return { productId, incoming: 0, movement: 0, extraRequest: 0 };
}

function safeCash(report: DailyReport, columnKey: CashColumnKey): CashInput {
  return report.cashColumns[columnKey] ?? {
    columnKey,
    driverName: "",
    productRevenue: 0,
    foodExpenses: 0,
    weReturnedDebt: 0,
    weOwe: 0,
    clientReturnedDebt: 0,
    clientTookDebt: 0,
    discounts: 0,
    fuel: 0,
    kfc: 0,
    forHome: 0,
    carWash: 0,
    tinting: 0,
    otherExpenses: 0,
    handedOver: 0,
    comment: "",
    customExpenses: []
  };
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "warn" | "bad" }) {
  return (
    <div className={`stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <ShieldCheck size={28} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function HomePage() {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedPointId, setSelectedPointId] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [notice, setNotice] = useState("Готов к работе.");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [financeColumn, setFinanceColumn] = useState<CashColumnKey>("E");
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [receiptText, setReceiptText] = useState("");
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState<string | null>(null);
  const [transferProductId, setTransferProductId] = useState("");
  const [transferFromPointId, setTransferFromPointId] = useState("");
  const [transferToPointId, setTransferToPointId] = useState("");
  const [transferQuantity, setTransferQuantity] = useState("");
  const [transferComment, setTransferComment] = useState("");
  const [productDraft, setProductDraft] = useState<ProductDraft>({
    name: "",
    price: "",
    norm: "",
    quantityStep: "1",
    allowDecimal: false
  });
  const importInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setSelectedPointId(firstActivePointId(loaded));
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (selectedPointId && state.points.some((point) => point.id === selectedPointId && point.active)) return;
    setSelectedPointId(firstActivePointId(state));
  }, [selectedPointId, state]);

  useEffect(() => {
    const pointId = selectedPointId || firstActivePointId(state);
    if (!transferFromPointId) setTransferFromPointId(pointId);
    if (!transferToPointId) {
      const target = state.points.find((point) => point.active && point.id !== pointId)?.id ?? pointId;
      setTransferToPointId(target);
    }
  }, [selectedPointId, state.points, state, transferFromPointId, transferToPointId]);

  useEffect(() => {
    return () => {
      if (receiptPhotoUrl) URL.revokeObjectURL(receiptPhotoUrl);
    };
  }, [receiptPhotoUrl]);

  const activePoints = useMemo(() => state.points.filter((point) => point.active), [state.points]);
  const selectedPoint = activePoints.find((point) => point.id === selectedPointId) ?? activePoints[0] ?? state.points[0];
  const pointId = selectedPoint?.id ?? "";
  const currentReport = useMemo(
    () => getReport(state, selectedDate, pointId) ?? createReportFor(state, selectedDate, pointId),
    [pointId, selectedDate, state]
  );
  const allLines = useMemo(() => calculateReportLines(state, currentReport), [currentReport, state]);
  const dashboard = useMemo(() => calculateDashboard(state, selectedDate), [selectedDate, state]);
  const shortageImageData = useMemo(() => buildShortageImageData(state, selectedDate), [selectedDate, state]);
  const reportRevenue = useMemo(() => calculateReportRevenue(state, currentReport), [currentReport, state]);
  const cashTotal = useMemo(() => calculateCashTotal(currentReport), [currentReport]);
  const warnings = useMemo(() => getReportWarnings(state, currentReport), [currentReport, state]);
  const completedLines = allLines.filter((line) => typeof line.homeRest === "number").length;
  const issueCount = countProblems(allLines);
  const progress = allLines.length ? Math.round((completedLines / allLines.length) * 100) : 0;
  const closeBlockers = useMemo(() => {
    const blockers = warnings.filter((warning) => warning.severity === "error" || warning.code === "REVENUE_MISMATCH");
    if (completedLines < allLines.length) {
      blockers.unshift({
        code: "INCOMPLETE_STOCK",
        severity: "error",
        message: `Заполните остатки: ${completedLines} / ${allLines.length}`
      });
    }
    return blockers;
  }, [allLines.length, completedLines, warnings]);
  const selectedCash = safeCash(currentReport, financeColumn);
  const selectedCashResult = calculateCash(selectedCash);
  const receiptItems = useMemo(() => parseReceiptOcrText(receiptText, state.products), [receiptText, state.products]);

  const filteredLines = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allLines.filter((line) => {
      const matchesQuery =
        !query ||
        line.product.name.toLowerCase().includes(query) ||
        String(line.rowNumber).includes(query);
      if (!matchesQuery) return false;
      if (stockFilter === "empty") return typeof line.homeRest !== "number";
      if (stockFilter === "issues") return hasLineIssue(line);
      if (stockFilter === "request") return line.request > 0 || line.extraRequest > 0;
      if (stockFilter === "sold") return line.sale > 0;
      return true;
    });
  }, [allLines, search, stockFilter]);

  const transferProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return state.products
      .filter((product) => product.active)
      .filter((product) => !query || product.name.toLowerCase().includes(query))
      .sort((a, b) => productSortNumber(a, pointId) - productSortNumber(b, pointId))
      .slice(0, 16);
  }, [pointId, search, state.products]);

  const selectedTransferProduct =
    state.products.find((product) => product.id === transferProductId) ?? transferProducts[0] ?? state.products.find((product) => product.active);

  const transferHistory = useMemo(
    () => state.transfers.filter((transfer) => transfer.date === selectedDate).slice().reverse(),
    [selectedDate, state.transfers]
  );

  function updateReport(mutator: (report: DailyReport) => DailyReport) {
    setState((current) => {
      const base = getReport(current, selectedDate, pointId) ?? createReportFor(current, selectedDate, pointId);
      return upsertReport(current, mutator(base));
    });
  }

  function updateItem(productId: string, field: ItemField, rawValue: string) {
    const value = field === "homeRest" ? parseOptionalDecimal(rawValue) : parseDecimal(rawValue);
    updateReport((report) => {
      const currentItem = report.items[productId] ?? emptyItem(productId);
      return {
        ...report,
        closed: false,
        items: {
          ...report.items,
          [productId]: {
            ...currentItem,
            [field]: value
          }
        }
      };
    });
  }

  function updateProduct(productId: string, field: ProductField, rawValue: string) {
    const value = field === "quantityStep" ? Math.max(parseDecimal(rawValue, 1), 0.01) : parseDecimal(rawValue);
    setState((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === productId ? { ...product, [field]: value } : product))
    }));
  }

  function toggleProduct(productId: string, field: "active" | "allowDecimal") {
    setState((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === productId ? { ...product, [field]: !product[field] } : product))
    }));
  }

  function updateCash(columnKey: CashColumnKey, field: keyof CashInput, rawValue: string) {
    const value = field === "driverName" || field === "comment" ? rawValue : parseDecimal(rawValue);
    updateReport((report) => {
      const currentCash = safeCash(report, columnKey);
      return {
        ...report,
        closed: false,
        cashColumns: {
          ...report.cashColumns,
          [columnKey]: {
            ...currentCash,
            [field]: value
          }
        }
      };
    });
  }

  async function exportExcel(pointScope: "all" | "single" = "all") {
    try {
      setNotice("Готовлю Excel...");
      const file = await createExcelReportFile(state, {
        scope: "day",
        pointScope,
        format: "template",
        date: selectedDate,
        startDate: selectedDate,
        endDate: selectedDate,
        pointId
      });
      downloadBlob(file.blob, file.fileName);
      setNotice(`Excel выгружен за ${shortDate(selectedDate)}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Не удалось выгрузить Excel.");
    }
  }

  async function shareShortageImage() {
    try {
      setNotice("Готовлю картинку недостач...");
      const blob = await createShortageImageBlob(shortageImageData);
      const fileName = `nedostachi-${selectedDate}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const shareData: FileShareData = {
        files: [file],
        title: `Недостачи ${shortDate(selectedDate)}`,
        text:
          shortageImageData.total > 0.01
            ? `Недостачи за ${shortDate(selectedDate)}: ${currency(shortageImageData.total)}`
            : `Недостач за ${shortDate(selectedDate)} нет`
      };
      const shareNavigator = navigator as FileShareNavigator;

      if (shareNavigator.share && (!shareNavigator.canShare || shareNavigator.canShare(shareData))) {
        await shareNavigator.share(shareData);
        setNotice("Картинка недостач открыта для отправки.");
        return;
      }

      downloadBlob(blob, fileName);
      setNotice("PNG недостач скачан. Отправьте этот файл в группу.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("Отправка картинки отменена.");
        return;
      }
      setNotice(error instanceof Error ? error.message : "Не удалось создать картинку недостач.");
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setNotice("Импортирую рабочий Excel...");
      const imported = await importExcelReport(state, file, { date: selectedDate, mode: importMode });
      const importedDate = imported.result.importedDates[0] ?? selectedDate;
      setState(imported.state);
      setSelectedDate(importedDate);
      setNotice(
        `Импорт готов за ${shortDate(importedDate)}: создано ${imported.result.createdReports}, обновлено ${imported.result.updatedReports}.`
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Не удалось импортировать Excel.");
    } finally {
      event.target.value = "";
    }
  }

  function addProduct() {
    const name = productDraft.name.trim();
    if (!name) {
      setNotice("Введите название товара.");
      return;
    }

    const id = uniqueProductId(state.products, slugify(name));
    const nextProduct: Product = {
      id,
      name,
      price: parseDecimal(productDraft.price),
      norm: parseDecimal(productDraft.norm),
      category: "custom",
      active: true,
      shelfOrder: state.products.length + 1,
      allowDecimal: productDraft.allowDecimal,
      quantityStep: Math.max(parseDecimal(productDraft.quantityStep, 1), 0.01)
    };

    setState((current) => ({ ...current, products: [...current.products, nextProduct] }));
    setProductDraft({ name: "", price: "", norm: "", quantityStep: "1", allowDecimal: false });
    setNotice(`Товар добавлен: ${name}.`);
  }

  function applyReceipt() {
    const matched = receiptItems.filter((item) => item.matchedProductId);
    if (!matched.length) {
      setNotice("Нет распознанных строк, которые можно применить автоматически.");
      return;
    }

    updateReport((report) => {
      const nextItems = { ...report.items };
      for (const item of matched) {
        if (!item.matchedProductId) continue;
        const currentItem = nextItems[item.matchedProductId] ?? emptyItem(item.matchedProductId);
        nextItems[item.matchedProductId] = {
          ...currentItem,
          incoming: money((currentItem.incoming ?? 0) + item.quantity)
        };
      }
      return { ...report, closed: false, items: nextItems };
    });
    setNotice(`Приход применен: ${matched.length} строк.`);
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (receiptPhotoUrl) URL.revokeObjectURL(receiptPhotoUrl);
    setReceiptPhotoUrl(URL.createObjectURL(file));
    setNotice("Фото отчета добавлено. Кнопки вынесены за пределы изображения.");
    event.target.value = "";
  }

  function addTransfer() {
    const product = selectedTransferProduct;
    const quantity = parseDecimal(transferQuantity);
    const fromPointId = transferFromPointId || pointId;
    const toPointId = transferToPointId;

    if (!product || !quantity || fromPointId === toPointId) {
      setNotice("Выберите товар, разные точки и количество.");
      return;
    }

    const transfer: Transfer = {
      id: makeId(),
      date: selectedDate,
      fromPointId,
      toPointId,
      productId: product.id,
      quantity,
      comment: transferComment.trim()
    };

    setState((current) => ({ ...current, transfers: [...current.transfers, transfer] }));
    setTransferProductId(product.id);
    setTransferQuantity("");
    setTransferComment("");
    setNotice(`Перемещено: ${product.name}, ${num(quantity)}.`);
  }

  function closeDay() {
    if (closeBlockers.length) {
      setNotice("Закрытие заблокировано. Сначала исправьте проверку дня.");
      return;
    }

    setState((current) => {
      const base = getReport(current, selectedDate, pointId) ?? createReportFor(current, selectedDate, pointId);
      const closedReport: DailyReport = {
        ...base,
        closed: true,
        closedAt: new Date().toISOString()
      };
      return applyCarryoverAfterClose(upsertReport(current, closedReport), closedReport);
    });
    setNotice(`День закрыт: ${selectedPoint?.name ?? ""}, ${shortDate(selectedDate)}.`);
  }

  function resetDraftData() {
    if (!window.confirm("Очистить локальный черновик и вернуть стартовые данные?")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    const fresh = createInitialState();
    setState(fresh);
    setSelectedPointId(firstActivePointId(fresh));
    setNotice("Черновик очищен.");
  }

  function goToProblem() {
    const mismatch = closeBlockers.some((warning) => warning.code === "REVENUE_MISMATCH");
    setActiveTab(mismatch ? "finance" : "inventory");
  }

  const renderHome = () => (
    <div className="screen stack">
      <section className="hero-band">
        <div className="hero-copy">
          <span>Закрытие дня</span>
          <h1>{selectedPoint?.name ?? "Точка"}</h1>
          <p>
            {completedLines} / {allLines.length} строк заполнено, {currency(reportRevenue)} продаж по товарам.
          </p>
        </div>
        <button className="primary-action hero-action" type="button" onClick={() => setActiveTab("inventory")}>
          Продолжить заполнение <ArrowRight size={19} />
        </button>
      </section>

      <div className="stats-grid">
        <Stat label="Готовность" value={`${progress}%`} tone={progress === 100 ? "good" : "neutral"} />
        <Stat label="Проблемы" value={String(issueCount)} tone={issueCount ? "warn" : "good"} />
        <Stat label="Должен сдать" value={currency(cashTotal.shouldHandOver)} tone="neutral" />
        <Stat label="Разница" value={currency(cashTotal.shortageOrPlus)} tone={cashTotal.shortageOrPlus < 0 ? "bad" : "good"} />
      </div>

      <section className="work-panel">
        <SectionTitle
          eyebrow="Очередь"
          title="Что нажать дальше"
          action={
            <button className="secondary-action" type="button" onClick={() => exportExcel("all")}>
              <Download size={17} /> Excel
            </button>
          }
        />
        <div className="task-list">
          <button className="task-row" type="button" onClick={() => setActiveTab("inventory")}>
            <Package size={20} />
            <div>
              <strong>Заполнить остатки</strong>
              <span>{allLines.length - completedLines} строк осталось</span>
            </div>
            <ArrowRight size={18} />
          </button>
          <button className="task-row" type="button" onClick={() => setActiveTab("finance")}>
            <WalletCards size={20} />
            <div>
              <strong>Проверить финансы</strong>
              <span>Сдал: {currency(cashTotal.handedOver)}</span>
            </div>
            <ArrowRight size={18} />
          </button>
          <button className="task-row" type="button" onClick={goToProblem}>
            {closeBlockers.length ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <div>
              <strong>{closeBlockers.length ? "Исправить расхождение" : "Проверка пройдена"}</strong>
              <span>{closeBlockers[0]?.message ?? "Можно закрывать день"}</span>
            </div>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="work-panel close-panel">
        <SectionTitle eyebrow="Финал" title="Закрытие дня" />
        <div className={closeBlockers.length ? "close-status blocked" : "close-status ready"}>
          {closeBlockers.length ? <XCircle size={22} /> : <CheckCircle2 size={22} />}
          <div>
            <strong>{closeBlockers.length ? "Закрытие заблокировано" : "Готово к закрытию"}</strong>
            <span>{closeBlockers[0]?.message ?? "Остатки и финансы не содержат блокирующих ошибок."}</span>
          </div>
        </div>
        <div className="action-row">
          {closeBlockers.length ? (
            <button className="secondary-action" type="button" onClick={goToProblem}>
              Перейти к проверке
            </button>
          ) : (
            <button className="primary-action" type="button" onClick={closeDay}>
              Закрыть день
            </button>
          )}
        </div>
      </section>

      <section className="work-panel">
        <SectionTitle eyebrow="День" title="Сводка по точкам" />
        <div className="point-summary">
          {dashboard.revenueByPoint.map((point) => (
            <div key={point.pointId}>
              <span>{point.name}</span>
              <strong>{currency(point.value)}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderInventory = () => (
    <div className="screen stack">
      <SectionTitle
        eyebrow="Остатки"
        title="Рабочая таблица"
        action={
          <button className="primary-action compact" type="button" onClick={() => setActiveTab("finance")}>
            К финансам <ArrowRight size={17} />
          </button>
        }
      />

      <div className="toolbar">
        <label className="search-box">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск товара или номера" />
        </label>
        <div className="segmented">
          {stockFilters.map((filter) => (
            <button key={filter.id} type="button" className={stockFilter === filter.id ? "active" : ""} onClick={() => setStockFilter(filter.id)}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-shell">
        <div className="data-table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Наименование товара</th>
                <th>Цена</th>
                <th>Норма</th>
                <th>Прошлый день</th>
                <th>Приход</th>
                <th>Перемещение</th>
                <th>Остаток дома</th>
                <th>Продажа</th>
                <th>Сумма</th>
                <th>Заявка</th>
                <th>Доп</th>
              </tr>
            </thead>
            <tbody>
              {filteredLines.map((line) => {
                const status = lineStatus(line);
                const movementInput = itemNumberValue(currentReport, line.product.id, "movement");
                return (
                  <tr key={line.product.id} className={status}>
                    <td className="mono">{line.rowNumber}</td>
                    <td className="product-name-cell">
                      <strong>{line.product.name}</strong>
                      {line.warnings.length > 0 && <span>{line.warnings[0].message}</span>}
                    </td>
                    <td>
                      <input value={num(line.product.price)} inputMode="decimal" onChange={(event) => updateProduct(line.product.id, "price", event.target.value)} />
                    </td>
                    <td>
                      <input value={num(line.product.norm)} inputMode="decimal" onChange={(event) => updateProduct(line.product.id, "norm", event.target.value)} />
                    </td>
                    <td className="readonly-number">{num(line.previousRest)}</td>
                    <td>
                      <input
                        value={num(itemNumberValue(currentReport, line.product.id, "incoming") ?? 0)}
                        inputMode="decimal"
                        onChange={(event) => updateItem(line.product.id, "incoming", event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        value={num(movementInput ?? 0)}
                        inputMode="decimal"
                        onChange={(event) => updateItem(line.product.id, "movement", event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="main-number"
                        value={num(itemNumberValue(currentReport, line.product.id, "homeRest"))}
                        inputMode="decimal"
                        onChange={(event) => updateItem(line.product.id, "homeRest", event.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className={line.sale < 0 ? "readonly-number bad-text" : "readonly-number"}>{num(line.sale)}</td>
                    <td className={line.amount < 0 ? "readonly-number bad-text" : "readonly-number"}>{currency(line.amount)}</td>
                    <td className="readonly-number">{num(line.request)}</td>
                    <td>
                      <input
                        value={num(itemNumberValue(currentReport, line.product.id, "extraRequest") ?? 0)}
                        inputMode="decimal"
                        onChange={(event) => updateItem(line.product.id, "extraRequest", event.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLines.length === 0 && <EmptyState title="Ничего не найдено" text="Смените фильтр или поисковый запрос." />}
        </div>
      </div>

      <div className="bottom-summary">
        <Stat label="Строк" value={`${completedLines}/${allLines.length}`} tone={progress === 100 ? "good" : "neutral"} />
        <Stat label="Продано" value={currency(reportRevenue)} />
        <Stat label="Проблемы" value={String(issueCount)} tone={issueCount ? "warn" : "good"} />
      </div>
    </div>
  );

  const renderReceipts = () => (
    <div className="screen stack">
      <SectionTitle eyebrow="Приход" title="Фото, OCR и ручной ввод" />
      <div className="two-column">
        <section className="work-panel">
          <SectionTitle
            title="Фото отчета"
            action={
              <button className="secondary-action" type="button" onClick={() => photoInputRef.current?.click()}>
                <ImagePlus size={17} /> Добавить фото
              </button>
            }
          />
          <input ref={photoInputRef} className="hidden-input" type="file" accept="image/*" onChange={handlePhoto} />
          {receiptPhotoUrl ? (
            <div className="photo-review">
              <div className="photo-toolbar">
                <button type="button" className="secondary-action" onClick={() => photoInputRef.current?.click()}>
                  Заменить
                </button>
                <button type="button" className="danger-action" onClick={() => setReceiptPhotoUrl(null)}>
                  <Trash2 size={16} /> Убрать
                </button>
              </div>
              <img src={receiptPhotoUrl} alt="Фото отчета" />
            </div>
          ) : (
            <EmptyState title="Фото пока нет" text="Панель управления будет отдельно от изображения и не перекроет обзор." />
          )}
        </section>

        <section className="work-panel">
          <SectionTitle
            title="Текст накладной"
            action={
              <button className="primary-action compact" type="button" onClick={applyReceipt}>
                Применить приход
              </button>
            }
          />
          <textarea
            className="receipt-textarea"
            value={receiptText}
            onChange={(event) => setReceiptText(event.target.value)}
            placeholder="Вставьте распознанный текст накладной: DESCRIPTION / QUANTITY..."
          />
          <div className="receipt-list">
            {receiptItems.slice(0, 10).map((item) => (
              <div key={`${item.rawLine}-${item.quantity}`} className={item.matchedProductId ? "receipt-item matched" : "receipt-item"}>
                <div>
                  <strong>{item.matchedProductName ?? item.rawProductName}</strong>
                  <span>{item.rawLine}</span>
                </div>
                <b>{num(item.quantity)}</b>
              </div>
            ))}
            {receiptText && receiptItems.length === 0 && <EmptyState title="Строки не распознаны" text="Проверьте, что в тексте есть DESCRIPTION и QUANTITY." />}
          </div>
        </section>
      </div>
    </div>
  );

  const renderTransfers = () => (
    <div className="screen stack">
      <SectionTitle eyebrow="Перемещения" title="Переместить товар" />
      <div className="transfer-layout">
        <section className="work-panel">
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск товара" />
          </label>
          <div className="product-picker">
            {transferProducts.map((product) => (
              <button
                key={product.id}
                className={selectedTransferProduct?.id === product.id ? "selected" : ""}
                type="button"
                onClick={() => setTransferProductId(product.id)}
              >
                <strong>{product.name}</strong>
                <span>{currency(product.price)} · норма {num(product.norm)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="work-panel transfer-form">
          <div className="selected-product">
            <span>Выбранный товар</span>
            <strong>{selectedTransferProduct?.name ?? "Не выбран"}</strong>
          </div>
          <div className="form-grid">
            <label>
              Откуда
              <select value={transferFromPointId || pointId} onChange={(event) => setTransferFromPointId(event.target.value)}>
                {activePoints.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Куда
              <select value={transferToPointId || pointId} onChange={(event) => setTransferToPointId(event.target.value)}>
                {activePoints.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Количество
              <input className="large-input" value={transferQuantity} inputMode="decimal" onChange={(event) => setTransferQuantity(event.target.value)} placeholder="0" />
            </label>
            <label>
              Комментарий
              <input value={transferComment} onChange={(event) => setTransferComment(event.target.value)} placeholder="Причина или водитель" />
            </label>
          </div>
          <button className="primary-action wide" type="button" onClick={addTransfer}>
            <Truck size={18} /> Переместить товар
          </button>
        </section>
      </div>

      <section className="work-panel">
        <SectionTitle title="История за день" />
        <div className="history-list">
          {transferHistory.map((transfer) => {
            const product = state.products.find((item) => item.id === transfer.productId);
            const from = state.points.find((point) => point.id === transfer.fromPointId);
            const to = state.points.find((point) => point.id === transfer.toPointId);
            return (
              <div key={transfer.id}>
                <strong>{product?.name ?? transfer.productId}</strong>
                <span>
                  {from?.name} → {to?.name} · {num(transfer.quantity)}
                </span>
              </div>
            );
          })}
          {transferHistory.length === 0 && <EmptyState title="Перемещений нет" text="Созданные перемещения появятся здесь." />}
        </div>
      </section>
    </div>
  );

  const renderFinance = () => (
    <div className="screen stack">
      <SectionTitle eyebrow="Финансы" title="Касса и расхождения" />
      <div className="finance-hero">
        <Stat label="Должен сдать" value={currency(cashTotal.shouldHandOver)} tone="neutral" />
        <Stat label="Сдал" value={currency(cashTotal.handedOver)} tone="good" />
        <Stat label="Разница" value={currency(cashTotal.shortageOrPlus)} tone={cashTotal.shortageOrPlus < 0 ? "bad" : "good"} />
      </div>

      <section className={shortageImageData.total > 0.01 ? "work-panel shortage-share-panel danger" : "work-panel shortage-share-panel clean"}>
        <SectionTitle
          eyebrow="Для группы"
          title={shortageImageData.total > 0.01 ? "Картинка недостач" : "Картинка статуса кассы"}
          action={
            <button className="primary-action compact" type="button" onClick={shareShortageImage}>
              <ImageDown size={17} /> Отправить PNG
            </button>
          }
        />
        <div className="shortage-share-grid">
          <Stat label="Итого недостача" value={currency(shortageImageData.total)} tone={shortageImageData.total > 0.01 ? "bad" : "good"} />
          <Stat label="Точек" value={String(shortageImageData.affectedPoints)} tone={shortageImageData.affectedPoints ? "warn" : "good"} />
          <Stat label="Водителей" value={String(shortageImageData.affectedDrivers)} tone={shortageImageData.affectedDrivers ? "warn" : "good"} />
        </div>
        <div className="shortage-point-list">
          {shortageImageData.points.map((point) => (
            <div key={point.pointId} className={point.total > 0.01 ? "shortage-point-row danger" : point.hasReport ? "shortage-point-row clean" : "shortage-point-row muted"}>
              <strong>{point.pointName}</strong>
              <span>
                {point.total > 0.01
                  ? `${point.drivers.length} вод. · ${currency(point.total)}`
                  : point.hasReport
                    ? "недостач нет"
                    : "отчет не создан"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="driver-tabs">
        {CASH_COLUMN_KEYS.map((columnKey) => {
          const cash = safeCash(currentReport, columnKey);
          const result = calculateCash(cash);
          return (
            <button key={columnKey} className={financeColumn === columnKey ? "active" : ""} type="button" onClick={() => setFinanceColumn(columnKey)}>
              <strong>{cash.driverName || columnKey}</strong>
              <span>{currency(result.shortageOrPlus)}</span>
            </button>
          );
        })}
      </div>

      <section className="work-panel">
        <div className="finance-form-head">
          <div>
            <span>Колонка {financeColumn}</span>
            <h2>{selectedCash.driverName || "Без водителя"}</h2>
          </div>
          <button className="secondary-action" type="button" onClick={() => updateCash(financeColumn, "productRevenue", String(reportRevenue))}>
            Подставить продажи
          </button>
        </div>
        <div className="form-grid finance-grid">
          <label>
            Водитель
            <input value={selectedCash.driverName} onChange={(event) => updateCash(financeColumn, "driverName", event.target.value)} />
          </label>
          <label>
            Выручка по товарам
            <input value={num(selectedCash.productRevenue)} inputMode="decimal" onChange={(event) => updateCash(financeColumn, "productRevenue", event.target.value)} />
          </label>
          <label>
            Должен сдать
            <input value={num(selectedCashResult.shouldHandOver)} readOnly />
          </label>
          <label>
            Сдал
            <input value={num(selectedCash.handedOver)} inputMode="decimal" onChange={(event) => updateCash(financeColumn, "handedOver", event.target.value)} />
          </label>
        </div>

        <details className="expense-details">
          <summary>Расходы и скидки</summary>
          <div className="form-grid finance-grid">
            {financeLabels.map(([field, label]) => (
              <label key={field}>
                {label}
                <input value={num(Number(selectedCash[field] ?? 0))} inputMode="decimal" onChange={(event) => updateCash(financeColumn, field, event.target.value)} />
              </label>
            ))}
          </div>
        </details>

        <details className="expense-details">
          <summary>Долги</summary>
          <div className="form-grid finance-grid">
            <label>
              Мы вернули долг
              <input value={num(selectedCash.weReturnedDebt)} inputMode="decimal" onChange={(event) => updateCash(financeColumn, "weReturnedDebt", event.target.value)} />
            </label>
            <label>
              Мы должны
              <input value={num(selectedCash.weOwe)} inputMode="decimal" onChange={(event) => updateCash(financeColumn, "weOwe", event.target.value)} />
            </label>
            <label>
              Клиент вернул
              <input value={num(selectedCash.clientReturnedDebt)} inputMode="decimal" onChange={(event) => updateCash(financeColumn, "clientReturnedDebt", event.target.value)} />
            </label>
            <label>
              Клиент взял долг
              <input value={num(selectedCash.clientTookDebt)} inputMode="decimal" onChange={(event) => updateCash(financeColumn, "clientTookDebt", event.target.value)} />
            </label>
          </div>
        </details>

        <label>
          Комментарий
          <textarea value={selectedCash.comment} onChange={(event) => updateCash(financeColumn, "comment", event.target.value)} />
        </label>
      </section>

      <section className={closeBlockers.length ? "work-panel warning-panel" : "work-panel success-panel"}>
        <SectionTitle title="Проверка перед закрытием" />
        {closeBlockers.length ? (
          <>
            {closeBlockers.map((warning) => (
              <div key={`${warning.code}-${warning.message}`} className="warning-row">
                <AlertTriangle size={18} />
                <span>{warning.message}</span>
              </div>
            ))}
            <button className="secondary-action" type="button" onClick={goToProblem}>
              Перейти к проверке
            </button>
          </>
        ) : (
          <button className="primary-action wide" type="button" onClick={closeDay}>
            Закрыть день
          </button>
        )}
      </section>
    </div>
  );

  const renderMore = () => (
    <div className="screen stack">
      <SectionTitle eyebrow="Еще" title="Операции и справочники" />
      <div className="settings-grid">
        <section className="work-panel action-group">
          <h3>Импорт и отчеты</h3>
          <button type="button" onClick={() => importInputRef.current?.click()}>
            <Upload size={18} /> Импортировать рабочий Excel
          </button>
          <button type="button" onClick={() => exportExcel("all")}>
            <FileSpreadsheet size={18} /> Выгрузить все точки
          </button>
          <button type="button" onClick={() => exportExcel("single")}>
            <Download size={18} /> Выгрузить текущую точку
          </button>
          <label className="inline-toggle">
            <input type="checkbox" checked={importMode === "replace"} onChange={(event) => setImportMode(event.target.checked ? "replace" : "merge")} />
            Импорт заменяет существующий день
          </label>
        </section>

        <section className="work-panel action-group">
          <h3>Проверка данных</h3>
          <button type="button" onClick={() => setActiveTab("inventory")}>
            <ClipboardCheck size={18} /> Проверить остатки
          </button>
          <button type="button" onClick={() => setActiveTab("finance")}>
            <WalletCards size={18} /> Проверить финансы
          </button>
          <button type="button" onClick={goToProblem}>
            <AlertTriangle size={18} /> Найти блокер закрытия
          </button>
          <button type="button" onClick={shareShortageImage}>
            <ImageDown size={18} /> Картинка недостач для группы
          </button>
        </section>

        <section className="work-panel action-group">
          <h3>Настройки системы</h3>
          <button type="button" onClick={resetDraftData}>
            <RefreshCcw size={18} /> Сбросить локальный черновик
          </button>
          <button type="button" onClick={() => setNotice("Данные сохраняются локально в браузере.")}>
            <Settings size={18} /> Статус хранения
          </button>
        </section>
      </div>

      <section className="work-panel">
        <SectionTitle
          eyebrow="Справочник"
          title="Товары"
          action={
            <button className="primary-action compact" type="button" onClick={addProduct}>
              <Plus size={17} /> Добавить товар
            </button>
          }
        />
        <div className="product-add-row">
          <input value={productDraft.name} onChange={(event) => setProductDraft((draft) => ({ ...draft, name: event.target.value }))} placeholder="Название товара" />
          <input value={productDraft.price} inputMode="decimal" onChange={(event) => setProductDraft((draft) => ({ ...draft, price: event.target.value }))} placeholder="Цена" />
          <input value={productDraft.norm} inputMode="decimal" onChange={(event) => setProductDraft((draft) => ({ ...draft, norm: event.target.value }))} placeholder="Норма" />
          <input
            value={productDraft.quantityStep}
            inputMode="decimal"
            onChange={(event) => setProductDraft((draft) => ({ ...draft, quantityStep: event.target.value }))}
            placeholder="Шаг"
          />
          <label className="inline-toggle">
            <input
              type="checkbox"
              checked={productDraft.allowDecimal}
              onChange={(event) => setProductDraft((draft) => ({ ...draft, allowDecimal: event.target.checked }))}
            />
            Дробный
          </label>
        </div>
        <div className="data-table-scroll">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Цена</th>
                <th>Норма</th>
                <th>Дробный товар</th>
                <th>Шаг</th>
                <th>Активен</th>
              </tr>
            </thead>
            <tbody>
              {state.products
                .slice()
                .sort((a, b) => productSortNumber(a, pointId) - productSortNumber(b, pointId))
                .map((product) => (
                  <tr key={product.id} className={product.active ? "" : "disabled-row"}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>
                      <input value={num(product.price)} inputMode="decimal" onChange={(event) => updateProduct(product.id, "price", event.target.value)} />
                    </td>
                    <td>
                      <input value={num(product.norm)} inputMode="decimal" onChange={(event) => updateProduct(product.id, "norm", event.target.value)} />
                    </td>
                    <td>
                      <label className="switch-cell">
                        <input type="checkbox" checked={Boolean(product.allowDecimal)} onChange={() => toggleProduct(product.id, "allowDecimal")} />
                      </label>
                    </td>
                    <td>
                      <input value={num(product.quantityStep ?? 1)} inputMode="decimal" onChange={(event) => updateProduct(product.id, "quantityStep", event.target.value)} />
                    </td>
                    <td>
                      <label className="switch-cell">
                        <input type="checkbox" checked={product.active} onChange={() => toggleProduct(product.id, "active")} />
                      </label>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  return (
    <main className="ops-app">
      <input ref={importInputRef} className="hidden-input" type="file" accept=".xlsx,.xlsm" onChange={handleImport} />

      <aside className="side-nav" aria-label="Основная навигация">
        <div className="brand">
          <span>DC</span>
          <div>
            <strong>Drinks CRM</strong>
            <small>рабочий терминал</small>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <button key={item.id} type="button" className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="app-workspace">
        <header className="topbar">
          <div className="context-controls">
            <label>
              Дата
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>
            <label>
              Точка
              <select value={pointId} onChange={(event) => setSelectedPointId(event.target.value)}>
                {activePoints.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="status-strip">
            <span className={closeBlockers.length ? "status-dot warn" : "status-dot ok"} />
            <span>{notice}</span>
          </div>
          <button className={activeTab === "more" ? "more-button active" : "more-button"} type="button" onClick={() => setActiveTab("more")}>
            <MoreHorizontal size={20} />
            <span>Еще</span>
          </button>
        </header>

        <div className="content-scroll">
          {activeTab === "home" && renderHome()}
          {activeTab === "inventory" && renderInventory()}
          {activeTab === "receipts" && renderReceipts()}
          {activeTab === "transfers" && renderTransfers()}
          {activeTab === "finance" && renderFinance()}
          {activeTab === "more" && renderMore()}
        </div>
      </section>

      <nav className="bottom-nav" aria-label="Быстрая навигация">
        {navItems.map((item) => (
          <button key={item.id} type="button" className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
