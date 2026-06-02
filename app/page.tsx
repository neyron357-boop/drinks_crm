"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Download,
  Eraser,
  ImageDown,
  ImagePlus,
  Home as HomeIcon,
  Lock,
  Minus,
  MoreHorizontal,
  Package,
  PackagePlus,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Truck,
  Upload,
  Volume2,
  VolumeX,
  WalletCards,
  Wifi,
  X
} from "lucide-react";
import { startTransition, useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  calculateCash,
  calculateCashColumns,
  calculateCashTotal,
  calculateReportLines,
  calculateReportRevenue,
  canCloseReport,
  countProblems,
  getReport,
  getReportWarnings
} from "./lib/calculations";
import { applyCarryoverAfterClose } from "./lib/carryover";
import { createExcelReportFile } from "./lib/excel";
import { importExcelReport } from "./lib/excel-import";
import { formatDecimal, parseDecimal, parseOptionalDecimal } from "./lib/numbers";
import { productSortNumber } from "./lib/product-order";
import { parseReceiptOcrText } from "./lib/receipt-ocr";
import { createEmptyReport, createInitialState, emptyCash, reportId } from "./lib/seed";
import { loadState, saveState } from "./lib/storage";
import type {
  AppState,
  CashColumnKey,
  CashInput,
  CustomExpense,
  DailyReport,
  Driver,
  ExportOptions,
  ImportMode,
  Point,
  Product,
  ReportItemInput,
  ReportLine,
  Transfer
} from "./lib/types";

type Tab = "home" | "inventory" | "receipts" | "transfers" | "finance" | "more";
type CategoryId = "spirits" | "beer" | "wine" | "sparkling" | "premium";
type InventoryView = "quick" | "list";
type LineTone = "empty" | "done" | "warn";
type ServerCheck = { status: "idle" | "checking" | "ok" | "error"; message: string };
type PhotoTransform = { scale: number; x: number; y: number };
type ReceiptCandidate = {
  id: string;
  rawText: string;
  productText: string;
  productId: string;
  quantity: string;
  confidence: number;
  confirmed: boolean;
};

const categoryDefs: Array<{
  id: CategoryId;
  title: string;
  icon: string;
  matcher: RegExp;
}> = [
  {
    id: "spirits",
    title: "Крепкий алкоголь",
    icon: "🥃",
    matcher:
      /absolut|vodka|whisk|whisky|jack|j\/w|johnnie|chivas|gin|rum|tequila|cognac|hennessy|raki|arak|patron|don julio|aperol|belvedere|beluga|cirok|smirnoff|bacardi|macallan|glen/i
  },
  {
    id: "beer",
    title: "Пиво",
    icon: "🍺",
    matcher: /beer|heineken|corona|stella|budweiser|carlsberg|amstel|peroni|guinness|hoegarden|asahi|red horse|can|btl/i
  },
  {
    id: "wine",
    title: "Вино",
    icon: "🍷",
    matcher:
      /wine|chardonnay|merlot|sauv|cabernet|pinot|shiraz|malbec|rioj|chablis|gavi|sancerre|bourgogne|campo|oyster|ksara|mateus|calvet|castel|chateau|rose/i
  },
  {
    id: "sparkling",
    title: "Шампанское",
    icon: "🍾",
    matcher: /champagne|moet|veuve|prosecco|asti|bottega|ruinart|dom perignon|brut|sparkling|zonin/i
  },
  {
    id: "premium",
    title: "Премиум",
    icon: "⭐",
    matcher:
      /blue label|gold label|xo|vsop|royal salute|chivas 18|chivas 25|macallan|dom perignon|clase azul|don julio 1942|grey goose|cirok|veuve|ruinart|patron/i
  }
];

const favoriteNeedles = ["ABSOLUT", "JACK DANIELS", "CHIVAS", "HEINEKEN", "CORONA"];

type CashNumberField =
  | "discounts"
  | "foodExpenses"
  | "fuel"
  | "kfc"
  | "forHome"
  | "carWash"
  | "tinting"
  | "otherExpenses";

const cashFields: Array<[CashNumberField, string]> = [
  ["discounts", "Скидки"],
  ["foodExpenses", "Питание"],
  ["fuel", "Бензин"],
  ["kfc", "KFC"],
  ["forHome", "Для дома"],
  ["carWash", "Мойка"],
  ["tinting", "Тонировка"],
  ["otherExpenses", "Другие расходы"]
];

const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shortDate = (date: string) => date.split("-").reverse().join("/");

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const currency = (value: number) => `${value.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} AED`;
const num = formatDecimal;
const parseNumber = parseDecimal;
const parseOptionalNumber = parseOptionalDecimal;

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-|-$/g, "") || `item-${makeId()}`
  );
}

function nextUniqueId(items: Array<{ id: string }>, base: string) {
  let id = base;
  let index = 2;
  while (items.some((item) => item.id === id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function addDaysIso(date: string, days: number) {
  const cursor = new Date(`${date}T12:00:00`);
  cursor.setDate(cursor.getDate() + days);
  return cursor.toISOString().slice(0, 10);
}

function hasCashValues(cash: CashInput) {
  return (
    cash.productRevenue ||
    cash.foodExpenses ||
    cash.weReturnedDebt ||
    cash.weOwe ||
    cash.clientReturnedDebt ||
    cash.clientTookDebt ||
    cash.discounts ||
    cash.fuel ||
    cash.kfc ||
    cash.forHome ||
    cash.carWash ||
    cash.tinting ||
    cash.otherExpenses ||
    cash.handedOver ||
    (cash.customExpenses?.length ?? 0) > 0
  );
}

function lineTone(line: ReportLine): LineTone {
  if (typeof line.homeRest !== "number") return "empty";
  if (line.homeRest > line.available || line.warnings.some((warning) => warning.severity !== "info")) return "warn";
  return "done";
}

function lineStatusText(line: ReportLine) {
  const tone = lineTone(line);
  if (tone === "empty") return "Не заполнено";
  if (tone === "warn") return "Проверьте данные";
  return "Заполнено";
}

function productMatchesCategory(product: Product, categoryId: CategoryId) {
  const name = product.name.toLowerCase();
  const category = categoryDefs.find((item) => item.id === categoryId);
  if (!category) return true;
  if (category.matcher.test(name)) return true;
  if (categoryId === "spirits") return !categoryDefs.some((item) => item.id !== "spirits" && item.id !== "premium" && item.matcher.test(name));
  return false;
}

function allowsDecimalProduct(product: Product) {
  return Boolean(product.allowDecimal);
}

function quantityStep(product: Product | undefined) {
  if (!product || !allowsDecimalProduct(product)) return 1;
  return typeof product.quantityStep === "number" && product.quantityStep > 0 ? product.quantityStep : 0.5;
}

function normalizeQuantityInput(value: string, product: Product) {
  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
  if (allowsDecimalProduct(product)) return normalized;
  return normalized.split(".")[0];
}

function parseOptionalQuantity(value: string, product: Product) {
  const normalized = normalizeQuantityInput(value, product);
  if (normalized === "") return undefined;
  const parsed = parseOptionalNumber(normalized);
  if (typeof parsed !== "number") return undefined;
  if (!allowsDecimalProduct(product)) return Math.max(0, Math.round(parsed));
  const step = quantityStep(product);
  return Math.max(0, parseNumber(String(Math.round(parsed / step) * step)));
}

function parseQuantity(value: string, product: Product, fallback = 0) {
  const parsed = parseOptionalQuantity(value, product);
  return typeof parsed === "number" ? parsed : fallback;
}

function formatQuantity(value: number | undefined, product: Product) {
  if (typeof value !== "number") return "";
  return allowsDecimalProduct(product) ? num(value) : String(Math.round(value));
}

function replaceReport(state: AppState, nextReport: DailyReport): AppState {
  const exists = state.reports.some((report) => report.id === nextReport.id);
  return {
    ...state,
    reports: exists ? state.reports.map((report) => (report.id === nextReport.id ? nextReport : report)) : [...state.reports, nextReport]
  };
}

function ensureReport(state: AppState, date: string, pointId: string, driverId: string): AppState {
  const id = reportId(date, pointId);
  if (state.reports.some((report) => report.id === id)) return state;
  return {
    ...state,
    reports: [...state.reports, createEmptyReport(date, pointId, driverId, state.products)]
  };
}

export default function Home() {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [inventoryView, setInventoryView] = useState<InventoryView>("quick");
  const [quickIndex, setQuickIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedPointId, setSelectedPointId] = useState("jvc");
  const [selectedDriverId, setSelectedDriverId] = useState("driver-farrukh");
  const [selectedCashColumn, setSelectedCashColumn] = useState<CashColumnKey>("F");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [preparedDownload, setPreparedDownload] = useState<{ url: string; fileName: string } | null>(null);
  const [lastSaved, setLastSaved] = useState("");
  const [progressOpen, setProgressOpen] = useState(false);
  const [receiptSearch, setReceiptSearch] = useState("");
  const [transferSearch, setTransferSearch] = useState("");
  const [newPointName, setNewPointName] = useState("");
  const [newDriver, setNewDriver] = useState({ name: "", pointId: "jvc" });
  const [newProduct, setNewProduct] = useState({ name: "", price: "", norm: "", category: "Напитки" });
  const [newCustomExpense, setNewCustomExpense] = useState({ label: "", amount: "" });
  const [productAdminSearch, setProductAdminSearch] = useState("");
  const [quickPreviewRest, setQuickPreviewRest] = useState<number | undefined>(undefined);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [bulkRestValue, setBulkRestValue] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [serverCheck, setServerCheck] = useState<ServerCheck>({ status: "idle", message: "Проверка не запускалась" });
  const [uiSoundEnabled, setUiSoundEnabled] = useState(true);
  const [reportPhotoUrl, setReportPhotoUrl] = useState("");
  const [reportPhotoTransform, setReportPhotoTransform] = useState<PhotoTransform>({ scale: 1, x: 0, y: 0 });
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isOverrideConfirmed, setIsOverrideConfirmed] = useState(false);
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState("");
  const [receiptOcrBusy, setReceiptOcrBusy] = useState(false);
  const [receiptCandidates, setReceiptCandidates] = useState<ReceiptCandidate[]>([]);
  const [receiptIgnoredLines, setReceiptIgnoredLines] = useState<string[]>([]);
  const [receiptIgnoredOpen, setReceiptIgnoredOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromPointId: "jvc",
    toPointId: "business-bay",
    productId: "absolut-blue-ltr",
    quantity: 1,
    comment: ""
  });

  const quickInputRef = useRef<HTMLInputElement>(null);
  const quickDraftRef = useRef("");
  const quickCommitTimerRef = useRef<number | undefined>(undefined);
  const pendingQuickCommitRef = useRef<{ productId: string; value: number | undefined } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const reportPhotoInputRef = useRef<HTMLInputElement>(null);
  const receiptPhotoInputRef = useRef<HTMLInputElement>(null);
  const reportPhotoImageRef = useRef<HTMLImageElement>(null);
  const reportPhotoContainerRef = useRef<HTMLDivElement>(null);
  const reportPhotoTransformRef = useRef<PhotoTransform>({ scale: 1, x: 0, y: 0 });
  const animationFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reportPhotoPointersRef = useRef(new Map<number, { x: number; y: number }>());
  const reportPhotoGestureRef = useRef<{
    startDistance: number;
    startScale: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    const loaded = loadState();
    const firstPoint = loaded.points.find((point) => point.active)?.id ?? "jvc";
    const firstDriver = loaded.drivers.find((driver) => driver.active && driver.pointId === firstPoint)?.id ?? loaded.drivers[0]?.id ?? "";
    setState(loaded);
    setSelectedPointId(firstPoint);
    setSelectedDriverId(firstDriver);
    setNewDriver((current) => ({ ...current, pointId: firstPoint }));
    setTransferForm((current) => ({
      ...current,
      fromPointId: firstPoint,
      toPointId: loaded.points.find((point) => point.active && point.id !== firstPoint)?.id ?? firstPoint,
      productId: loaded.products.find((product) => product.active && (!product.pointIds || product.pointIds.includes(firstPoint)))?.id ?? current.productId
    }));
    setUiSoundEnabled(window.localStorage.getItem("drink-ledger-ui-sound") !== "off");
    setSpeechEnabled(window.localStorage.getItem("drinks_crm_speech_enabled") !== "false");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => {
      saveState(state);
      setLastSaved(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    }, 180);
    return () => window.clearTimeout(id);
  }, [state, hydrated]);

  useEffect(() => {
    return () => {
      if (preparedDownload) URL.revokeObjectURL(preparedDownload.url);
    };
  }, [preparedDownload]);

  useEffect(() => {
    return () => {
      if (reportPhotoUrl) URL.revokeObjectURL(reportPhotoUrl);
    };
  }, [reportPhotoUrl]);

  useEffect(() => {
    return () => {
      if (receiptPhotoUrl) URL.revokeObjectURL(receiptPhotoUrl);
    };
  }, [receiptPhotoUrl]);

  useEffect(() => {
    if (!hydrated) return;
    setState((current) => ensureReport(current, selectedDate, selectedPointId, selectedDriverId));
  }, [hydrated, selectedDate, selectedPointId, selectedDriverId]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  const currentReport = useMemo(
    () => getReport(state, selectedDate, selectedPointId) ?? createEmptyReport(selectedDate, selectedPointId, selectedDriverId, state.products),
    [selectedDate, selectedDriverId, selectedPointId, state]
  );
  const reportLines = useMemo(() => calculateReportLines(state, currentReport), [currentReport, state]);
  const inventoryLines = useMemo(() => [...reportLines].sort((a, b) => a.rowNumber - b.rowNumber), [reportLines]);
  const revenue = useMemo(
    () => (activeTab === "home" || activeTab === "finance" || activeTab === "more" ? calculateReportRevenue(state, currentReport) : 0),
    [activeTab, currentReport, state]
  );
  const cashColumns = useMemo(() => calculateCashColumns(currentReport), [currentReport]);
  const cashTotal = useMemo(() => calculateCashTotal(currentReport), [currentReport]);
  const reportWarningList = useMemo(() => getReportWarnings(state, currentReport), [currentReport, state]);
  const errorWarningCount = reportWarningList.filter((warning) => warning.severity === "error").length;
  const selectedPoint = state.points.find((point) => point.id === selectedPointId);
  const canEditReport = !currentReport.closed;
  const filledCount = inventoryLines.filter((line) => typeof line.homeRest === "number").length;
  const missingCount = Math.max(inventoryLines.length - filledCount, 0);
  const problemCount = countProblems(inventoryLines);
  const visibleCashColumns = cashColumns.filter((cash) => cash.driverName || hasCashValues(cash));
  const cashColumnKeys = (visibleCashColumns.length ? visibleCashColumns : cashColumns.filter((cash) => cash.columnKey === "F")).map(
    (cash) => (cash.columnKey ?? "F") as CashColumnKey
  );
  const selectedCashInput = currentReport.cashColumns?.[selectedCashColumn] ?? emptyCash(selectedCashColumn);
  const selectedCash = useMemo(() => calculateCash(selectedCashInput), [selectedCashInput]);
  const filledLines = useMemo(() => inventoryLines.filter((line) => typeof line.homeRest === "number"), [inventoryLines]);
  const missingLines = useMemo(() => inventoryLines.filter((line) => typeof line.homeRest !== "number"), [inventoryLines]);
  const financeRevenueGap = useMemo(() => parseNumber(String(cashTotal.productRevenue - revenue)), [cashTotal.productRevenue, revenue]);
  const discrepancyLines = useMemo(
    () => inventoryLines.filter((line) => currentReport.items[line.product.id]?.flagged),
    [currentReport.items, inventoryLines]
  );

  const favoriteLines = useMemo(
    () =>
      favoriteNeedles
        .map((needle) => inventoryLines.find((line) => line.product.name.toUpperCase().includes(needle)))
        .filter((line): line is ReportLine => Boolean(line)),
    [inventoryLines]
  );

  const quickLines = inventoryLines;

  const quickLine = quickLines[quickIndex] ?? null;

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return inventoryLines
      .filter((line) => line.product.name.toLowerCase().includes(query) || line.product.id.includes(query))
      .slice(0, 12);
  }, [inventoryLines, search]);
  const visibleInventoryLines = search ? searchResults : inventoryLines;

  const receiptLines = useMemo(() => {
    const query = receiptSearch.trim().toLowerCase();
    return query
      ? inventoryLines.filter((line) => line.product.name.toLowerCase().includes(query) || line.product.id.includes(query))
      : inventoryLines;
  }, [inventoryLines, receiptSearch]);

  const transferProduct = state.products.find((product) => product.id === transferForm.productId);
  const transferProductOptions = useMemo(() => {
    const query = transferSearch.trim().toLowerCase();
    const base = query
      ? inventoryLines.filter((line) => line.product.name.toLowerCase().includes(query) || line.product.id.includes(query))
      : [...favoriteLines, ...inventoryLines.filter((line) => line.product.id === transferForm.productId)];
    return Array.from(new Map(base.map((line) => [line.product.id, line])).values()).slice(0, 8);
  }, [favoriteLines, inventoryLines, transferForm.productId, transferSearch]);

  const todaysTransfers = useMemo(
    () => state.transfers.filter((transfer) => transfer.date === selectedDate),
    [selectedDate, state.transfers]
  );

  const transferValue = useMemo(
    () =>
      todaysTransfers
        .filter((transfer) => transfer.fromPointId === selectedPointId || transfer.toPointId === selectedPointId)
        .reduce((total, transfer) => {
          const product = state.products.find((item) => item.id === transfer.productId);
          return total + transfer.quantity * (product?.price ?? 0);
        }, 0),
    [selectedPointId, state.products, todaysTransfers]
  );

  const financeTotals = useMemo(() => {
    const columns = calculateCashColumns(currentReport);
    const discounts = columns.reduce((total, cash) => total + cash.discounts, 0);
    const expenses = columns.reduce(
      (total, cash) =>
        total +
        cash.foodExpenses +
        cash.fuel +
        cash.kfc +
        cash.forHome +
        cash.carWash +
        cash.tinting +
        cash.otherExpenses +
        (cash.customExpenses ?? []).reduce((sum, expense) => sum + expense.amount, 0),
      0
    );
    return { discounts, expenses };
  }, [currentReport]);

  const analytics = useMemo(() => {
    const weekStart = addDaysIso(selectedDate, -6);
    const monthStart = `${selectedDate.slice(0, 7)}-01`;
    const until = selectedDate;

    const collect = (from: string) => {
      const pointMap = new Map<string, { id: string; name: string; value: number }>();
      const driverMap = new Map<string, { id: string; name: string; value: number; point: string }>();
      let total = 0;

      for (const report of state.reports) {
        if (report.date < from || report.date > until) continue;
        const point = state.points.find((item) => item.id === report.pointId);
        const revenueValue = calculateReportRevenue(state, report);
        total += revenueValue;

        const pointEntry = pointMap.get(report.pointId) ?? { id: report.pointId, name: point?.name ?? report.pointId, value: 0 };
        pointEntry.value += revenueValue;
        pointMap.set(report.pointId, pointEntry);

        for (const cash of calculateCashColumns(report)) {
          if (!cash.driverName && !cash.productRevenue) continue;
          const id = `${cash.driverName || cash.columnKey || "driver"}-${report.pointId}`;
          const driverEntry = driverMap.get(id) ?? {
            id,
            name: cash.driverName || String(cash.columnKey ?? "Водитель"),
            point: point?.name ?? report.pointId,
            value: 0
          };
          driverEntry.value += cash.productRevenue;
          driverMap.set(id, driverEntry);
        }
      }

      return {
        total,
        points: Array.from(pointMap.values()).sort((a, b) => b.value - a.value),
        drivers: Array.from(driverMap.values()).sort((a, b) => b.value - a.value)
      };
    };

    return {
      week: collect(weekStart),
      month: collect(monthStart),
      weekStart,
      monthStart
    };
  }, [selectedDate, state]);

  const carryoverAudit = useMemo(() => {
    const previousDate = addDaysIso(selectedDate, -1);
    const previousReport = getReport(state, previousDate, selectedPointId);
    const currentPreviousRestCount = inventoryLines.filter((line) => typeof currentReport.items[line.product.id]?.previousRest === "number").length;
    return {
      previousDate,
      previousClosed: Boolean(previousReport?.closed),
      currentPreviousRestCount
    };
  }, [currentReport.items, inventoryLines, selectedDate, selectedPointId, state]);

  const adminProducts = useMemo(() => {
    const query = productAdminSearch.trim().toLowerCase();
    return state.products
      .filter((product) => !query || product.name.toLowerCase().includes(query) || product.id.includes(query))
      .sort((a, b) => productSortNumber(a, selectedPointId) - productSortNumber(b, selectedPointId))
      .slice(0, 80);
  }, [productAdminSearch, selectedPointId, state.products]);

  useEffect(() => {
    const firstKey = cashColumnKeys[0] ?? "F";
    if (!cashColumnKeys.includes(selectedCashColumn)) {
      setSelectedCashColumn(firstKey);
    }
  }, [cashColumnKeys, selectedCashColumn]);

  useEffect(() => {
    if (quickIndex >= quickLines.length) setQuickIndex(Math.max(quickLines.length - 1, 0));
  }, [quickIndex, quickLines.length]);

  useEffect(() => {
    if (activeTab !== "inventory" || inventoryView !== "quick") return;
    const id = window.setTimeout(() => quickInputRef.current?.blur(), 20);
    return () => window.clearTimeout(id);
  }, [activeTab, inventoryView, quickIndex, quickLine?.product.id]);

  useEffect(() => {
    const nextDraft = quickLine ? formatQuantity(quickLine.homeRest, quickLine.product) : "";
    quickDraftRef.current = nextDraft;
    setQuickPreviewRest(quickLine?.homeRest);
    if (quickInputRef.current) quickInputRef.current.value = nextDraft;
  }, [quickLine?.product.id]);

  useEffect(() => {
    return () => {
      if (quickCommitTimerRef.current) window.clearTimeout(quickCommitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const flush = () => saveState(state);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("drink-ledger-ui-sound", uiSoundEnabled ? "on" : "off");
  }, [hydrated, uiSoundEnabled]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("drinks_crm_speech_enabled", speechEnabled ? "true" : "false");
  }, [hydrated, speechEnabled]);

  useEffect(() => {
    reportPhotoTransformRef.current = reportPhotoTransform;
    if (reportPhotoImageRef.current) {
      reportPhotoImageRef.current.style.transform = `translate3d(${reportPhotoTransform.x}px, ${reportPhotoTransform.y}px, 0) scale(${reportPhotoTransform.scale})`;
    }
  }, [reportPhotoTransform]);

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) window.cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  useEffect(() => {
    setIsOverrideConfirmed(false);
  }, [quickIndex]);

  useEffect(() => {
    const activeIds = new Set(inventoryLines.map((line) => line.product.id));
    setBulkSelectedIds((current) => current.filter((id) => activeIds.has(id)));
  }, [inventoryLines]);

  useEffect(() => {
    const handlePointerUp = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest("button, select")) return;
      playInteractionSound();
    };
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [uiSoundEnabled]);

  function updateReport(mutator: (report: DailyReport) => DailyReport) {
    setState((current) => {
      const existing = getReport(current, selectedDate, selectedPointId) ?? createEmptyReport(selectedDate, selectedPointId, selectedDriverId, current.products);
      if (existing.closed) return current;
      return replaceReport(current, mutator(existing));
    });
  }

  function updateItem(productId: string, patch: Partial<ReportItemInput>) {
    updateReport((report) => ({
      ...report,
      items: {
        ...report.items,
        [productId]: {
          productId,
          previousRest: report.items[productId]?.previousRest,
          incoming: report.items[productId]?.incoming ?? 0,
          movement: report.items[productId]?.movement ?? 0,
          homeRest: report.items[productId]?.homeRest,
          extraRequest: report.items[productId]?.extraRequest ?? 0,
          currentRest: report.items[productId]?.currentRest,
          flagged: report.items[productId]?.flagged,
          driverRest: report.items[productId]?.driverRest,
          driverSale: report.items[productId]?.driverSale,
          discrepancyNote: report.items[productId]?.discrepancyNote,
          ...patch
        }
      }
    }));
  }

  function flushQuickCommit() {
    const pending = pendingQuickCommitRef.current;
    if (!pending) return;
    pendingQuickCommitRef.current = null;
    if (quickCommitTimerRef.current) {
      window.clearTimeout(quickCommitTimerRef.current);
      quickCommitTimerRef.current = undefined;
    }
    startTransition(() => {
      updateItem(pending.productId, { homeRest: pending.value, currentRest: pending.value });
    });
  }

  function scheduleQuickCommit(productId: string, value: number | undefined) {
    pendingQuickCommitRef.current = { productId, value };
    if (quickCommitTimerRef.current) window.clearTimeout(quickCommitTimerRef.current);
    quickCommitTimerRef.current = window.setTimeout(flushQuickCommit, 70);
  }

  function updateCash(field: keyof CashInput, value: number | string) {
    updateReport((report) => {
      const currentCash = report.cashColumns?.[selectedCashColumn] ?? emptyCash(selectedCashColumn);
      return {
        ...report,
        cashColumns: {
          ...report.cashColumns,
          [selectedCashColumn]: {
            ...currentCash,
            columnKey: selectedCashColumn,
            [field]: value
          }
        }
      };
    });
  }

  function updateCashCustomExpenses(expenses: CustomExpense[]) {
    updateReport((report) => {
      const currentCash = report.cashColumns?.[selectedCashColumn] ?? emptyCash(selectedCashColumn);
      return {
        ...report,
        cashColumns: {
          ...report.cashColumns,
          [selectedCashColumn]: {
            ...currentCash,
            columnKey: selectedCashColumn,
            customExpenses: expenses
          }
        }
      };
    });
  }

  function addCustomExpense() {
    if (!newCustomExpense.label.trim() || !newCustomExpense.amount.trim()) return;
    const expense: CustomExpense = {
      id: makeId(),
      label: newCustomExpense.label.trim(),
      amount: parseNumber(newCustomExpense.amount)
    };
    updateCashCustomExpenses([...(selectedCashInput.customExpenses ?? []), expense]);
    setNewCustomExpense({ label: "", amount: "" });
  }

  function removeCustomExpense(id: string) {
    updateCashCustomExpenses((selectedCashInput.customExpenses ?? []).filter((expense) => expense.id !== id));
  }

  function playInteractionSound() {
    if (!uiSoundEnabled || typeof window === "undefined") return;
    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const context = audioContextRef.current ?? new AudioContextCtor();
    audioContextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 620;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.045);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.05);
  }

  function setImageUrl(blob: Blob, setter: (url: string) => void, currentUrl: string) {
    const nextUrl = URL.createObjectURL(blob);
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    setter(nextUrl);
  }

  function loadReportPhoto(file: File | Blob) {
    setImageUrl(file, setReportPhotoUrl, reportPhotoUrl);
    commitReportPhotoTransform({ scale: 1, x: 0, y: 0 });
    if (activeTab !== "inventory" || inventoryView !== "quick") setNotice("Фото отчета добавлено.");
  }

  function loadReceiptPhoto(file: File | Blob) {
    setImageUrl(file, setReceiptPhotoUrl, receiptPhotoUrl);
    setReceiptCandidates([]);
    setReceiptIgnoredLines([]);
    setReceiptIgnoredOpen(false);
    setNotice("Фото чека добавлено. Запустите OCR и проверьте строки.");
  }

  function handleReportPhotoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) loadReportPhoto(file);
  }

  function handleReceiptPhotoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) loadReceiptPhoto(file);
  }

  function clampPhotoTransform(transform: PhotoTransform): PhotoTransform {
    const scale = Math.min(Math.max(transform.scale, 1), 4);
    return {
      scale,
      x: Math.min(Math.max(transform.x, -2400), 2400),
      y: Math.min(Math.max(transform.y, -3200), 3200)
    };
  }

  function applyReportPhotoTransform(transform: PhotoTransform) {
    const next = clampPhotoTransform(transform);
    reportPhotoTransformRef.current = next;
    if (typeof window === "undefined" || animationFrameIdRef.current) return;
    animationFrameIdRef.current = window.requestAnimationFrame(() => {
      animationFrameIdRef.current = null;
      if (!reportPhotoImageRef.current) return;
      const frameTransform = reportPhotoTransformRef.current;
      reportPhotoImageRef.current.style.transform = `translate3d(${frameTransform.x}px, ${frameTransform.y}px, 0) scale(${frameTransform.scale})`;
    });
  }

  function commitReportPhotoTransform(transform: PhotoTransform) {
    const next = clampPhotoTransform(transform);
    reportPhotoTransformRef.current = next;
    setReportPhotoTransform(next);
  }

  function handleReportPhotoPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!reportPhotoUrl) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    reportPhotoPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(reportPhotoPointersRef.current.values());
    const currentTransform = reportPhotoTransformRef.current;
    if (points.length === 1) {
      reportPhotoGestureRef.current = {
        startDistance: 0,
        startScale: currentTransform.scale,
        startX: points[0].x,
        startY: points[0].y,
        originX: currentTransform.x,
        originY: currentTransform.y
      };
    }
    if (points.length === 2) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      reportPhotoGestureRef.current = {
        startDistance: distance,
        startScale: currentTransform.scale,
        startX: 0,
        startY: 0,
        originX: currentTransform.x,
        originY: currentTransform.y
      };
    }
  }

  function handleReportPhotoPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!reportPhotoPointersRef.current.has(event.pointerId) || !reportPhotoGestureRef.current) return;
    reportPhotoPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(reportPhotoPointersRef.current.values());
    const gesture = reportPhotoGestureRef.current;
    if (points.length === 1) {
      applyReportPhotoTransform({
        ...reportPhotoTransformRef.current,
        x: gesture.originX + points[0].x - gesture.startX,
        y: gesture.originY + points[0].y - gesture.startY
      });
    }
    if (points.length >= 2 && gesture.startDistance > 0) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      applyReportPhotoTransform({
        ...reportPhotoTransformRef.current,
        scale: gesture.startScale * (distance / gesture.startDistance)
      });
    }
  }

  function handleReportPhotoPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    reportPhotoPointersRef.current.delete(event.pointerId);
    if (reportPhotoPointersRef.current.size === 0) {
      reportPhotoGestureRef.current = null;
      setReportPhotoTransform(reportPhotoTransformRef.current);
    }
  }

  function toggleReportPhotoZoom() {
    const current = reportPhotoTransformRef.current;
    commitReportPhotoTransform(current.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.4, x: 0, y: 0 });
  }

  function resetReportPhotoPosition() {
    commitReportPhotoTransform({ scale: 1, x: 0, y: 0 });
  }

  function buildReceiptCandidates(text: string): ReceiptCandidate[] {
    const parsed = parseReceiptOcrText(text, state.products);
    setReceiptIgnoredLines(parsed.ignoredRows);
    setReceiptIgnoredOpen(false);

    return parsed.map((line) => {
      return {
        id: makeId(),
        rawText: line.rawLine,
        productText: line.rawProductName,
        productId: line.matchedProductId ?? "",
        quantity: String(line.quantity),
        confidence: line.confidence,
        confirmed: !line.needsReview
      };
    });
  }

  async function runReceiptOcr() {
    if (!receiptPhotoUrl || receiptOcrBusy) return;
    setReceiptOcrBusy(true);
    setNotice("OCR читает чек. После распознавания нужно проверить строки.");
    try {
      const tesseract = await import("tesseract.js");
      const result = await tesseract.recognize(receiptPhotoUrl, "eng");
      const candidates = buildReceiptCandidates(result.data.text);
      setReceiptCandidates(candidates);
      setNotice(candidates.length ? "OCR готов. Проверьте строки перед применением." : "OCR не нашел товарные строки. Попробуйте другое фото.");
    } catch {
      setNotice("OCR не запустился. Проверьте фото или подключение.");
    } finally {
      setReceiptOcrBusy(false);
    }
  }

  function updateReceiptCandidate(id: string, patch: Partial<ReceiptCandidate>) {
    setReceiptCandidates((current) =>
      current.map((candidate) => {
        if (candidate.id !== id) return candidate;
        const next = { ...candidate, ...patch };
        if ("productId" in patch) {
          next.confirmed = patch.productId === "__skip__" || Boolean(patch.productId && patch.productId !== candidate.productId);
          if (!patch.productId) next.confirmed = false;
        }
        return next;
      })
    );
  }

  function confirmReceiptCandidate(id: string) {
    updateReceiptCandidate(id, { confirmed: true });
  }

  function receiptCandidateHasProblem(candidate: ReceiptCandidate) {
    if (candidate.productId === "__skip__") return false;
    const quantity = parseNumber(candidate.quantity);
    return !candidate.productId || !quantity || quantity <= 0 || (candidate.confidence < 85 && !candidate.confirmed);
  }

  function applyReceiptCandidates() {
    const activeCandidates = receiptCandidates.filter((candidate) => candidate.productId !== "__skip__");
    if (!canEditReport || activeCandidates.length === 0 || receiptCandidates.some(receiptCandidateHasProblem)) return;

    setState((current) => {
      const existing = getReport(current, selectedDate, selectedPointId) ?? createEmptyReport(selectedDate, selectedPointId, selectedDriverId, current.products);
      if (existing.closed) return current;
      const activePointIds = current.points.filter((point) => point.active).map((point) => point.id);
      const nextProducts = [...current.products];
      const nextItems = { ...existing.items };

      for (const candidate of activeCandidates) {
        const quantity = Math.max(0, parseNumber(candidate.quantity));
        if (!quantity) continue;
        let productId = candidate.productId;
        let product = nextProducts.find((item) => item.id === productId);
        if (productId === "__new__" || !product) {
          productId = nextUniqueId(nextProducts, slugify(candidate.productText));
          product = {
            id: productId,
            name: candidate.productText,
            price: 0,
            norm: 0,
            category: "Напитки",
            active: true,
            shelfOrder: Math.max(0, ...nextProducts.map((item) => item.shelfOrder ?? 0)) + 1,
            allowDecimal: false,
            quantityStep: 1,
            pointIds: activePointIds
          };
          nextProducts.push(product);
        }
        const currentItem = nextItems[productId] ?? { productId, incoming: 0 };
        nextItems[productId] = {
          ...currentItem,
          productId,
          incoming: parseQuantity(String((currentItem.incoming ?? 0) + quantity), product)
        };
      }

      return replaceReport({ ...current, products: nextProducts }, { ...existing, items: nextItems });
    });
    setReceiptCandidates([]);
    setNotice("Приход применен после проверки.");
  }

  function toggleBulkProduct(productId: string) {
    setBulkSelectedIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  function selectVisibleBulkProducts() {
    setBulkSelectedIds(Array.from(new Set(visibleInventoryLines.map((line) => line.product.id))));
  }

  function applyBulkRest() {
    const selected = inventoryLines.filter((line) => bulkSelectedIds.includes(line.product.id));
    if (!canEditReport || selected.length === 0) return;

    updateReport((report) => {
      const nextItems = { ...report.items };
      for (const line of selected) {
        const value = parseOptionalQuantity(bulkRestValue, line.product);
        nextItems[line.product.id] = {
          ...nextItems[line.product.id],
          productId: line.product.id,
          incoming: nextItems[line.product.id]?.incoming ?? 0,
          homeRest: value,
          currentRest: value
        };
      }
      return { ...report, items: nextItems };
    });
    setNotice(`Массово заполнено: ${selected.length}`);
  }

  function carryForwardCurrentRests() {
    if (!canEditReport) return;
    updateReport((report) => {
      const nextItems = { ...report.items };
      for (const line of inventoryLines) {
        const value = parseQuantity(String(line.available), line.product);
        nextItems[line.product.id] = {
          ...nextItems[line.product.id],
          productId: line.product.id,
          incoming: nextItems[line.product.id]?.incoming ?? 0,
          previousRest: line.previousRest,
          homeRest: value,
          currentRest: value
        };
      }
      return { ...report, items: nextItems };
    });
    setNotice("Остатки перенесены: теперь меняйте только проданные позиции.");
  }

  function syncSelectedRevenueFromFact() {
    const otherRevenue = cashColumns
      .filter((cash) => cash.columnKey !== selectedCashColumn)
      .reduce((total, cash) => total + cash.productRevenue, 0);
    updateCash("productRevenue", Math.max(0, parseNumber(String(revenue - otherRevenue))));
    setNotice("Выручка выбранного водителя сверена с продажами по факту.");
  }

  function resetRestsToZeroWithoutShortage() {
    if (!canEditReport) return;
    setState((current) => {
      const existing = getReport(current, selectedDate, selectedPointId) ?? createEmptyReport(selectedDate, selectedPointId, selectedDriverId, current.products);
      if (existing.closed) return current;

      const zeroItems = { ...existing.items };
      for (const line of calculateReportLines(current, existing)) {
        zeroItems[line.product.id] = {
          ...zeroItems[line.product.id],
          productId: line.product.id,
          incoming: zeroItems[line.product.id]?.incoming ?? 0,
          homeRest: 0,
          currentRest: 0
        };
      }

      const zeroReport: DailyReport = { ...existing, items: zeroItems };
      const zeroState = replaceReport(current, zeroReport);
      const zeroRevenue = calculateReportRevenue(zeroState, zeroReport);
      const currentCash = zeroReport.cashColumns[selectedCashColumn] ?? emptyCash(selectedCashColumn);
      const cashWithRevenue = { ...currentCash, columnKey: selectedCashColumn, productRevenue: zeroRevenue };
      const balancedCash = calculateCash(cashWithRevenue);
      const finalReport: DailyReport = {
        ...zeroReport,
        cashColumns: {
          ...zeroReport.cashColumns,
          [selectedCashColumn]: {
            ...cashWithRevenue,
            handedOver: Math.max(0, balancedCash.shouldHandOver)
          }
        }
      };
      return replaceReport(current, finalReport);
    });
    setNotice("Остатки обнулены, касса выбранного водителя выровнена без недостачи.");
  }

  function updateDiscrepancy(productId: string, patch: Partial<ReportItemInput>) {
    updateItem(productId, patch);
  }

  function generateDiscrepancyImage() {
    if (discrepancyLines.length === 0) {
      setNotice("Нет отмеченных расхождений для отчета.");
      return;
    }

    const problemLines = discrepancyLines.filter((line) => {
      const item = currentReport.items[line.product.id];
      const driverRest = item?.driverRest;
      const driverSale = item?.driverSale;
      const restGap = typeof driverRest === "number" && typeof line.homeRest === "number" ? driverRest - line.homeRest : 0;
      const saleGap = typeof driverSale === "number" ? driverSale - line.sale : 0;
      return restGap !== 0 || saleGap !== 0 || line.warnings.some((warning) => warning.severity !== "info");
    });

    if (problemLines.length === 0) {
      setNotice("Нет проблемных позиций для PNG отчета.");
      return;
    }

    const rowHeight = 178;
    const width = 1280;
    const height = 210 + problemLines.length * rowHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#0f1115";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#55d3c1";
    context.font = "800 38px Arial";
    context.fillText("ОТЧЕТ ПО РАСХОЖДЕНИЯМ", 48, 66);
    context.fillStyle = "#f5f7fb";
    context.font = "600 22px Arial";
    context.fillText(`${selectedPoint?.name ?? selectedPointId} · ${shortDate(selectedDate)}`, 48, 104);

    problemLines.forEach((line, index) => {
      const item = currentReport.items[line.product.id];
      const y = 176 + index * rowHeight;
      const driverRest = item?.driverRest;
      const driverSale = item?.driverSale;
      const restGap = typeof driverRest === "number" && typeof line.homeRest === "number" ? driverRest - line.homeRest : 0;
      const saleGap = typeof driverSale === "number" ? driverSale - line.sale : 0;

      context.fillStyle = index % 2 ? "#151922" : "#1b2028";
      context.fillRect(36, y - 32, width - 72, rowHeight - 18);
      context.fillStyle = "#ff6b6b";
      context.beginPath();
      context.arc(58, y, 9, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#f5f7fb";
      context.font = "800 22px Arial";
      context.fillText(`${line.rowNumber}. ${line.product.name}`.slice(0, 72), 78, y + 7);

      context.fillStyle = "#8f97a3";
      context.font = "700 18px Arial";
      context.fillText("Система", 78, y + 52);
      context.fillText("Водитель", 410, y + 52);
      context.fillText("Разница", 742, y + 52);

      context.fillStyle = "#d6dbe4";
      context.font = "600 20px Arial";
      context.fillText(`Остаток ${num(line.homeRest)}`, 78, y + 86);
      context.fillText(`Продажа ${num(line.sale)}`, 78, y + 118);
      context.fillText(`Остаток ${num(driverRest)}`, 410, y + 86);
      context.fillText(`Продажа ${num(driverSale)}`, 410, y + 118);
      context.fillStyle = restGap || saleGap ? "#f0b84d" : "#55d3c1";
      context.fillText(`Остаток ${restGap > 0 ? "+" : ""}${num(restGap)}`, 742, y + 86);
      context.fillText(`Продажа ${saleGap > 0 ? "+" : ""}${num(saleGap)}`, 742, y + 118);
    });

    try {
      const fileName = `discrepancies_${selectedDate}_${selectedPointId}.png`;
      const url = canvas.toDataURL("image/png");
      if (preparedDownload) URL.revokeObjectURL(preparedDownload.url);
      setPreparedDownload({ url, fileName });

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setNotice("Изображение отчета по расхождениям готово и скачивается.");
    } catch {
      setNotice("Не удалось создать изображение отчета. Попробуйте отметить меньше позиций за один раз.");
    }
  }

  async function handleTemplateImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = await importExcelReport(state, file, { date: selectedDate, mode: importMode });
      setState(imported.state);
      setNotice(
        `Импорт готов: создано ${imported.result.createdReports}, обновлено ${imported.result.updatedReports}.`
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Не удалось импортировать шаблон.");
    }
  }

  async function checkSupabaseConnection() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      setServerCheck({ status: "error", message: "Supabase не настроен в .env" });
      return;
    }

    setServerCheck({ status: "checking", message: "Проверяю соединение..." });
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`
        }
      });
      setServerCheck({
        status: response.ok ? "ok" : "error",
        message: response.ok ? "Связь с Supabase есть" : `Supabase ответил: ${response.status}`
      });
    } catch {
      setServerCheck({ status: "error", message: "Нет связи с Supabase" });
    }
  }

  function addPoint() {
    if (!newPointName.trim()) return;
    const id = nextUniqueId(state.points, slugify(newPointName));
    setState((current) => ({
      ...current,
      points: [...current.points, { id, name: newPointName.trim(), active: true }]
    }));
    setNewPointName("");
  }

  function updatePoint(pointId: string, patch: Partial<Point>) {
    setState((current) => ({
      ...current,
      points: current.points.map((point) => (point.id === pointId ? { ...point, ...patch } : point))
    }));
  }

  function removePoint(pointId: string) {
    const hasHistory =
      state.reports.some((report) => report.pointId === pointId) ||
      state.transfers.some((transfer) => transfer.fromPointId === pointId || transfer.toPointId === pointId);

    setState((current) => ({
      ...current,
      points: hasHistory ? current.points.map((point) => (point.id === pointId ? { ...point, active: false } : point)) : current.points.filter((point) => point.id !== pointId)
    }));

    if (selectedPointId === pointId) {
      const nextPoint = state.points.find((point) => point.active && point.id !== pointId);
      if (nextPoint) selectPoint(nextPoint.id);
    }
  }

  function addDriver() {
    if (!newDriver.name.trim()) return;
    const id = nextUniqueId(state.drivers, slugify(newDriver.name));
    const driver: Driver = { id, name: newDriver.name.trim(), pointId: newDriver.pointId, active: true };
    setState((current) => {
      const nextReports = current.reports.map((report) => {
        if (report.pointId !== driver.pointId || report.closed) return report;
        const emptyColumn = (["F", "G", "H", "I", "J", "K"] as CashColumnKey[]).find((columnKey) => !report.cashColumns[columnKey]?.driverName);
        if (!emptyColumn) return report;
        return {
          ...report,
          cashColumns: {
            ...report.cashColumns,
            [emptyColumn]: emptyCash(emptyColumn, driver.name)
          }
        };
      });
      return { ...current, drivers: [...current.drivers, driver], reports: nextReports };
    });
    setNewDriver((current) => ({ ...current, name: "" }));
  }

  function updateDriver(driverId: string, patch: Partial<Driver>) {
    setState((current) => ({
      ...current,
      drivers: current.drivers.map((driver) => (driver.id === driverId ? { ...driver, ...patch } : driver))
    }));
  }

  function removeDriver(driverId: string) {
    const hasHistory = state.reports.some((report) => report.driverId === driverId);
    setState((current) => ({
      ...current,
      drivers: hasHistory ? current.drivers.map((driver) => (driver.id === driverId ? { ...driver, active: false } : driver)) : current.drivers.filter((driver) => driver.id !== driverId)
    }));
  }

  function addProduct() {
    if (!newProduct.name.trim()) return;
    const id = nextUniqueId(state.products, slugify(newProduct.name));
    const product: Product = {
      id,
      name: newProduct.name.trim(),
      price: parseNumber(newProduct.price),
      norm: parseNumber(newProduct.norm),
      category: newProduct.category.trim() || "Напитки",
      active: true,
      shelfOrder: Math.max(0, ...state.products.map((item) => item.shelfOrder ?? 0)) + 1,
      allowDecimal: false,
      quantityStep: 1,
      pointIds: state.points.filter((point) => point.active).map((point) => point.id)
    };
    setState((current) => ({ ...current, products: [...current.products, product] }));
    setNewProduct({ name: "", price: "", norm: "", category: "Напитки" });
  }

  function updateProduct(productId: string, patch: Partial<Product>) {
    setState((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === productId ? { ...product, ...patch } : product))
    }));
  }

  function removeProduct(productId: string) {
    const hasHistory = state.reports.some((report) => Boolean(report.items[productId]));
    setState((current) => ({
      ...current,
      products: hasHistory
        ? current.products.map((product) => (product.id === productId ? { ...product, active: false } : product))
        : current.products.filter((product) => product.id !== productId)
    }));
  }

  function selectPoint(pointId: string) {
    const driver = state.drivers.find((item) => item.pointId === pointId && item.active);
    setSelectedPointId(pointId);
    setSelectedDriverId(driver?.id ?? selectedDriverId);
    setQuickIndex(0);
    setTransferForm((current) => ({
      ...current,
      fromPointId: pointId,
      toPointId: state.points.find((point) => point.active && point.id !== pointId)?.id ?? pointId
    }));
  }

  function startQuick(productId?: string) {
    const lines = inventoryLines;
    const fallbackIndex = lines.findIndex((line) => typeof line.homeRest !== "number");
    const productIndex = productId ? lines.findIndex((line) => line.product.id === productId) : -1;
    setQuickIndex(productIndex >= 0 ? productIndex : Math.max(fallbackIndex, 0));
    setInventoryView("quick");
    setActiveTab("inventory");
  }

  function continueFill() {
    if (missingCount === 0) {
      setActiveTab("more");
      return;
    }
    startQuick();
  }

  function saveQuickValue(value: string, input?: HTMLInputElement) {
    if (!quickLine) return;
    const normalized = normalizeQuantityInput(value, quickLine.product);
    const parsed = parseOptionalQuantity(normalized, quickLine.product);
    quickDraftRef.current = normalized;
    if (input && input.value !== normalized) input.value = normalized;
    setQuickPreviewRest(parsed);
    setIsOverrideConfirmed(false);
    scheduleQuickCommit(quickLine.product.id, parsed);
  }

  function adjustQuickRest(direction: -1 | 1) {
    if (!quickLine || !canEditReport) return;
    const current = parseOptionalQuantity(quickDraftRef.current, quickLine.product) ?? quickLine.homeRest ?? 0;
    const next = Math.max(0, parseQuantity(String(current + direction * quantityStep(quickLine.product)), quickLine.product));
    const formatted = formatQuantity(next, quickLine.product);
    quickDraftRef.current = formatted;
    if (quickInputRef.current) quickInputRef.current.value = formatted;
    setQuickPreviewRest(next);
    setIsOverrideConfirmed(false);
    scheduleQuickCommit(quickLine.product.id, next);
  }

  function moveProductShelf(productId: string, direction: -1 | 1) {
    setState((current) => {
      const ordered = [...current.products].sort((a, b) => productSortNumber(a, selectedPointId) - productSortNumber(b, selectedPointId));
      const index = ordered.findIndex((product) => product.id === productId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return current;
      const reordered = [...ordered];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      const shelfOrderById = new Map(reordered.map((product, orderIndex) => [product.id, orderIndex + 1]));
      return {
        ...current,
        products: current.products.map((product) => ({
          ...product,
          shelfOrder: shelfOrderById.get(product.id) ?? product.shelfOrder
        }))
      };
    });
  }

  function setQuickDraftValue(value: string) {
    if (!quickLine || !canEditReport) return;
    const normalized = normalizeQuantityInput(value, quickLine.product);
    const parsed = parseOptionalQuantity(normalized, quickLine.product);
    quickDraftRef.current = normalized;
    if (quickInputRef.current) quickInputRef.current.value = normalized;
    setQuickPreviewRest(parsed);
    setIsOverrideConfirmed(false);
    scheduleQuickCommit(quickLine.product.id, parsed);
  }

  function speakDigit(key: string) {
    if (!speechEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const map: Record<string, string> = {
      "0": "ноль",
      "1": "один",
      "2": "два",
      "3": "три",
      "4": "четыре",
      "5": "пять",
      "6": "шесть",
      "7": "семь",
      "8": "восемь",
      "9": "девять",
      ".": "точка",
      "backspace": "удалено"
    };

    const text = map[key] || key;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU";
    utterance.rate = 1.2;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  }

  function pressQuickKey(key: string) {
    if (!quickLine || !canEditReport) return;
    speakDigit(key);
    if (key === "backspace") {
      setQuickDraftValue(quickDraftRef.current.slice(0, -1));
      return;
    }
    if (key === "." && (!allowsDecimalProduct(quickLine.product) || quickDraftRef.current.includes("."))) return;
    setQuickDraftValue(`${quickDraftRef.current}${key}`);
  }

  function keepPreviousAndNext() {
    if (!quickLine || !canEditReport) return;
    const value = parseQuantity(String(quickLine.previousRest), quickLine.product);
    const formatted = formatQuantity(value, quickLine.product);
    quickDraftRef.current = formatted;
    if (quickInputRef.current) quickInputRef.current.value = formatted;
    setQuickPreviewRest(value);
    pendingQuickCommitRef.current = { productId: quickLine.product.id, value };
    flushQuickCommit();
    goNext();
  }

  function adjustIncoming(productId: string, direction: -1 | 1) {
    if (!canEditReport) return;
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;
    updateReport((report) => {
      const currentItem = report.items[productId] ?? { productId, incoming: 0 };
      const currentValue = typeof currentItem.incoming === "number" ? currentItem.incoming : 0;
      const next = Math.max(0, parseQuantity(String(currentValue + direction * quantityStep(product)), product));
      return {
        ...report,
        items: {
          ...report.items,
          [productId]: {
            ...currentItem,
            productId,
            incoming: next
          }
        }
      };
    });
  }

  function goNext() {
    flushQuickCommit();
    if (quickLine && typeof quickPreviewRest === "number" && quickPreviewRest > quickLine.available && !isOverrideConfirmed) {
      setIsOverrideConfirmed(true);
      setNotice("Остаток больше доступного. Нажмите Далее еще раз для подтверждения.");
      return;
    }
    if (quickIndex < quickLines.length - 1) {
      setQuickIndex((current) => current + 1);
      return;
    }
    setInventoryView("list");
    setNotice("Инвентаризация заполнена.");
  }

  function goPrev() {
    flushQuickCommit();
    setQuickIndex((current) => Math.max(current - 1, 0));
  }

  function addTransfer() {
    if (currentReport.closed) return;
    if (transferForm.fromPointId === transferForm.toPointId || transferForm.quantity <= 0.001) {
      setNotice("Проверьте точки и количество перемещения.");
      return;
    }
    const transfer: Transfer = {
      id: makeId(),
      date: selectedDate,
      ...transferForm,
      quantity: Number(transferForm.quantity)
    };
    setState((current) => ({ ...current, transfers: [transfer, ...current.transfers] }));
    setTransferForm((current) => ({ ...current, quantity: 1, comment: "" }));
    setNotice("Перемещение сохранено.");
  }

  function removeTransfer(id: string) {
    setState((current) => ({ ...current, transfers: current.transfers.filter((transfer) => transfer.id !== id) }));
  }

  function closeDay() {
    if (missingCount > 0) {
      setNotice(`Закрытие недоступно: осталось заполнить ${missingCount} товаров.`);
      return;
    }
    if (hasFinanceMismatch) {
      setNotice("Нельзя закрыть день: выручка водителей не совпадает с продажами по факту.");
      return;
    }
    const result = canCloseReport(state, currentReport);
    if (!result.ok) {
      setNotice(`Нельзя закрыть: ${result.warnings.slice(0, 2).join("; ")}`);
      return;
    }
    setState((current) => {
      const closedReport: DailyReport = {
        ...currentReport,
        closed: true,
        closedAt: new Date().toISOString()
      };
      return applyCarryoverAfterClose(replaceReport(current, closedReport), closedReport);
    });
    setNotice("День закрыт. Остатки перенесены на следующий день.");
  }

  function goToReportCheck() {
    if (hasFinanceMismatch || reportWarningList.some((warning) => warning.code.includes("CASH") || warning.code.includes("REVENUE"))) {
      setActiveTab("finance");
      return;
    }
    setInventoryView("list");
    setActiveTab("inventory");
    if (missingCount > 0 || problemCount > 0) setProgressOpen(true);
  }

  function reopenDay() {
    setState((current) =>
      replaceReport(current, {
        ...currentReport,
        closed: false,
        closedAt: undefined
      })
    );
    setNotice("Отчет снова открыт.");
  }

  async function exportExcel(pointScope: ExportOptions["pointScope"] = "single") {
    try {
      if (preparedDownload) URL.revokeObjectURL(preparedDownload.url);
      const file = await createExcelReportFile(state, {
        scope: "day",
        pointScope,
        format: "modern",
        date: selectedDate,
        startDate: selectedDate,
        endDate: selectedDate,
        pointId: selectedPointId
      });
      const url = URL.createObjectURL(file.blob);
      setPreparedDownload({ url, fileName: file.fileName });
      setNotice("Отчет подготовлен.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Не удалось подготовить отчет.");
    }
  }

  const hasFinanceMismatch = Math.abs(financeRevenueGap) > 0.01;
  const closeDisabled = currentReport.closed || missingCount > 0 || errorWarningCount > 0 || hasFinanceMismatch;
  const quickTone = quickLine ? lineTone(quickLine) : "empty";
  const quickItem = quickLine ? currentReport.items[quickLine.product.id] : undefined;
  const quickPreviewSale =
    quickLine && typeof quickPreviewRest === "number" ? parseNumber(String(quickLine.available - quickPreviewRest)) : undefined;
  const quickPreviewAmount =
    quickLine && typeof quickPreviewSale === "number" ? parseNumber(String(quickPreviewSale * quickLine.product.price)) : undefined;
  const quickSuspicious = Boolean(quickLine && typeof quickPreviewRest === "number" && quickPreviewRest > quickLine.available);
  const canApplyReceiptCandidates =
    canEditReport &&
    receiptCandidates.some((candidate) => candidate.productId !== "__skip__") &&
    receiptCandidates.every((candidate) => !receiptCandidateHasProblem(candidate));
  const isFocusMode = activeTab === "inventory" && inventoryView === "quick";

  return (
    <main className={isFocusMode ? "app-shell focus-mode" : "app-shell"}>
      {!isFocusMode && (
        <header className="app-header">
          <label className="point-select no-ios-callout tap-target">
            <select value={selectedPointId} onChange={(event) => selectPoint(event.target.value)} aria-label="Точка">
              {state.points.filter((point) => point.active).map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>
          <label className="date-pill">
            <span>{shortDate(selectedDate)}</span>
            <input
              className="date-control"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              aria-label="Дата"
            />
          </label>
          <button
            type="button"
            className={activeTab === "more" ? "header-more-button active no-ios-callout tap-target" : "header-more-button no-ios-callout tap-target"}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => setActiveTab("more")}
            aria-label="Ещё"
          >
            <MoreHorizontal size={19} />
            <span>Еще</span>
          </button>
        </header>
      )}

      {notice && (
        <section className="notice">
          <span>{notice}</span>
          {preparedDownload && (
            <a href={preparedDownload.url} download={preparedDownload.fileName}>
              Скачать
            </a>
          )}
          <button type="button" onClick={() => setNotice("")} aria-label="Закрыть уведомление">
            <X size={16} />
          </button>
        </section>
      )}

      {activeTab === "home" && (
        <section className="screen home-screen">
          <button type="button" className="hero-progress no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => setProgressOpen(true)}>
            <div>
              <span className="overline">{shortDate(selectedDate)}</span>
              <strong>
                {filledCount} / {inventoryLines.length}
              </strong>
            </div>
            <Package size={28} />
          </button>

          <div className="home-metrics">
            <Metric label="Осталось" value={`${missingCount} товаров`} tone={missingCount ? "warn" : "neutral"} />
            <Metric label="Выручка" value={currency(revenue)} tone="neutral" />
            <Metric label="Недостача" value={currency(cashTotal.shortageOrPlus)} tone={cashTotal.shortageOrPlus < 0 ? "bad" : "good"} />
          </div>

          <button
            type="button"
            className="primary-cta home-primary-cta no-ios-callout tap-target"
            onClick={continueFill}
            aria-label={missingCount === 0 ? "Открыть закрытие дня" : "Продолжить заполнение"}
          >
            {missingCount === 0 ? <CheckCircle2 size={20} /> : <Package size={20} />}
            <span>{missingCount === 0 ? "Перейти к закрытию дня" : "Продолжить заполнение"}</span>
            <ArrowRight size={18} />
          </button>
        </section>
      )}

      {activeTab === "inventory" && (
        <section className="screen inventory-screen">
          {inventoryView === "list" && (
            <>
              <label className="search-field">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск товара"
                  aria-label="Поиск товара"
                />
              </label>

              <details className="bulk-panel no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}>
                <summary>
                  <span>Массово</span>
                  <strong>{bulkSelectedIds.length}</strong>
                  <ChevronDown size={16} />
                </summary>
                <div className="bulk-controls">
                  <input
                    inputMode="decimal"
                    value={bulkRestValue}
                    onChange={(event) => setBulkRestValue(event.target.value)}
                    placeholder="Одинаковый остаток"
                    disabled={!canEditReport}
                  />
                  <button
                    type="button"
                    className="secondary-action no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}
                    onClick={selectVisibleBulkProducts}
                    disabled={!canEditReport}
                    aria-label="Выбрать видимые"
                    title="Выбрать видимые"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <button type="button" className="secondary-action no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => setBulkSelectedIds([])} aria-label="Очистить" title="Очистить">
                    <X size={18} />
                  </button>
                  <button
                    type="button"
                    className="primary-action no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}
                    onClick={applyBulkRest}
                    disabled={!canEditReport || bulkSelectedIds.length === 0}
                    aria-label="Применить"
                    title="Применить"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </details>

              <div className="inventory-list">
                {visibleInventoryLines.map((line) => (
                  <div className={`inventory-list-row ${lineTone(line)} no-ios-callout tap-target`} onContextMenu={(e) => e.preventDefault()} key={line.product.id}>
                    <div className="inventory-product-cell">
                      <button
                        type="button"
                        className={bulkSelectedIds.includes(line.product.id) ? "select-box active no-ios-callout tap-target" : "select-box no-ios-callout tap-target"}
                        onClick={() => toggleBulkProduct(line.product.id)}
                        aria-label="Выбрать товар"
                      />
                      <button type="button" onClick={() => startQuick(line.product.id)}>
                        <span className={`dot ${lineTone(line)}`} />
                        <strong>{line.rowNumber}. {line.product.name}</strong>
                      </button>
                    </div>
                    <span>{num(line.previousRest)}</span>
                    <span>{num(line.incoming)}</span>
                    <span>{typeof line.homeRest === "number" ? num(line.homeRest) : "—"}</span>
                    <span>{typeof line.homeRest === "number" ? num(line.sale) : "—"}</span>
                    <span>{typeof line.homeRest === "number" ? currency(line.amount) : "—"}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {inventoryView === "quick" && (
            <div className="quick-fill">
              <div className="quick-top">
                <button type="button" className="icon-button no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => setInventoryView("list")} aria-label="Вернуться к списку">
                  <ArrowLeft size={18} />
                </button>
                <span className="quick-counter">
                  {quickIndex + 1} / {quickLines.length}
                </span>
                <div className="quick-photo-tools no-ios-callout" aria-label="Действия с фото">
                  <button type="button" className="quick-photo-tool no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => reportPhotoInputRef.current?.click()} aria-label="Галерея" title="Галерея">
                    <ImagePlus size={18} />
                  </button>
                  <button type="button" className="quick-photo-tool no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={resetReportPhotoPosition} aria-label="Сбросить фото" title="Сбросить фото">
                    <RefreshCcw size={18} />
                  </button>
                  <button
                    type="button"
                    className="quick-photo-tool no-ios-callout tap-target"
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={() => setSpeechEnabled((current) => !current)}
                    aria-label={speechEnabled ? "Выключить озвучку цифр" : "Включить озвучку цифр"}
                    title={speechEnabled ? "Выключить озвучку цифр" : "Включить озвучку цифр"}
                  >
                    {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                </div>
              </div>

              <input ref={reportPhotoInputRef} className="hidden-file-input" type="file" accept="image/*" onChange={handleReportPhotoFile} />

              <div className="photoBlock no-ios-callout">
                <div
                  ref={reportPhotoContainerRef}
                  className={reportPhotoUrl ? "photoViewport has-photo" : "photoViewport"}
                  onPointerDown={handleReportPhotoPointerDown}
                  onPointerMove={handleReportPhotoPointerMove}
                  onPointerUp={handleReportPhotoPointerUp}
                  onPointerCancel={handleReportPhotoPointerUp}
                  onDoubleClick={toggleReportPhotoZoom}
                >
                  {reportPhotoUrl ? (
                    <img
                      ref={reportPhotoImageRef}
                      src={reportPhotoUrl}
                      alt="Фото отчета"
                      style={{
                        transform: `translate3d(${reportPhotoTransform.x}px, ${reportPhotoTransform.y}px, 0) scale(${reportPhotoTransform.scale})`
                      }}
                    />
                  ) : (
                    <div className="photo-empty">
                      <ImagePlus size={24} />
                      <span>Фото отчета</span>
                    </div>
                  )}
                </div>
              </div>

              {quickLine && (
                <>
                  <div className={`quick-product ${quickTone} no-ios-callout tap-target`} onContextMenu={(e) => e.preventDefault()}>
                    <strong className="quick-row-number">{quickLine.rowNumber}</strong>
                    <h2>{quickLine.product.name}</h2>
                    <div className="quick-previous no-ios-callout">
                      <span>Было:</span>
                      <strong>{num(quickLine.previousRest)}</strong>
                    </div>
                  </div>

                  <div className="rest-input no-ios-callout">
                    <span>ОСТАТОК</span>
                    <div className="rest-stepper solo">
                      <input
                        key={quickLine.product.id}
                        ref={quickInputRef} className="stock-input"
                        inputMode="none"
                        type="text"
                        readOnly
                        tabIndex={-1}
                        defaultValue={formatQuantity(quickLine.homeRest, quickLine.product)}
                        onFocus={(event) => event.currentTarget.blur()}
                        onBlur={flushQuickCommit}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            goNext();
                          }
                          if (event.key === "ArrowUp") {
                            event.preventDefault();
                            adjustQuickRest(1);
                          }
                          if (event.key === "ArrowDown") {
                            event.preventDefault();
                            adjustQuickRest(-1);
                          }
                        }}
                        disabled={!canEditReport}
                        aria-label="Остаток товара"
                      />
                      {typeof quickPreviewRest === "number" && (
                        <span className="rest-check" aria-hidden="true">
                          <CheckCircle2 size={18} />
                        </span>
                      )}
                      {quickSuspicious && (
                        <span className="quick-warning">
                          <AlertTriangle size={14} />
                          Остаток больше доступного
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="quick-mini-info no-ios-callout">
                    <div>
                      <span>Продано</span>
                      <strong>{typeof quickPreviewSale === "number" ? num(quickPreviewSale) : "—"}</strong>
                    </div>
                    <div>
                      <span>Сумма</span>
                      <strong>{typeof quickPreviewAmount === "number" ? currency(quickPreviewAmount) : "—"}</strong>
                    </div>
                  </div>

                  <div className="number-pad no-ios-callout" aria-label="Цифровая клавиатура">
                    {["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "backspace"].map((key) => (
                      <button
                        type="button"
                        key={key}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => pressQuickKey(key)}
                        disabled={!canEditReport || (key === "." && !allowsDecimalProduct(quickLine.product))}
                        aria-label={key === "backspace" ? "Удалить цифру" : key}
                      >
                        {key === "backspace" ? "⌫" : key}
                      </button>
                    ))}
                  </div>

                  <details className="quick-extra no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}>
                    <summary>
                      Подробнее
                      <ChevronDown size={16} />
                    </summary>
                    <div className={quickItem?.flagged ? "discrepancy-card active no-ios-callout" : "discrepancy-card no-ios-callout"}>
                      <button
                        type="button"
                        className="secondary-wide no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => updateDiscrepancy(quickLine.product.id, { flagged: !quickItem?.flagged })}
                        disabled={!canEditReport}
                      >
                        <AlertTriangle size={17} />
                        {quickItem?.flagged ? "Расхождение отмечено" : "Отметить расхождение"}
                      </button>
                      {quickItem?.flagged && (
                        <div className="discrepancy-fields">
                          <label>
                            Остаток у водителя
                            <input
                              inputMode={allowsDecimalProduct(quickLine.product) ? "decimal" : "numeric"}
                              value={formatQuantity(quickItem.driverRest, quickLine.product)}
                              onChange={(event) =>
                                updateDiscrepancy(quickLine.product.id, {
                                  driverRest: parseOptionalQuantity(event.target.value, quickLine.product)
                                })
                              }
                              disabled={!canEditReport}
                            />
                          </label>
                          <label>
                            Продажа у водителя
                            <input
                              inputMode={allowsDecimalProduct(quickLine.product) ? "decimal" : "numeric"}
                              value={formatQuantity(quickItem.driverSale, quickLine.product)}
                              onChange={(event) =>
                                updateDiscrepancy(quickLine.product.id, {
                                  driverSale: parseOptionalQuantity(event.target.value, quickLine.product)
                                })
                              }
                              disabled={!canEditReport}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {quickTone === "warn" && (
                      <div className="warning-note">
                        <AlertTriangle size={18} />
                        Проверьте данные
                      </div>
                    )}
                  </details>

                  <div className="quick-actions">
                    <button type="button" className="secondary-action no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={goPrev} disabled={quickIndex === 0}>
                      <ArrowLeft size={18} />
                    </button>
                    <button
                      type="button"
                      className="secondary-action no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={keepPreviousAndNext}
                      disabled={!canEditReport}
                      aria-label="Без изменений"
                      title="Без изменений"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <button
                      type="button"
                      className="primary-action no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={goNext}
                      aria-label="Следующий товар"
                      title="Следующий"
                    >
                      <ArrowRight size={18} />
                      <span>Далее</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === "transfers" && (
        <section className="screen transfer-screen">
          <div className="transfer-card no-ios-callout">
            <label className="search-field compact">
              <Search size={17} />
              <input
                value={transferSearch}
                onChange={(event) => setTransferSearch(event.target.value)}
                placeholder={transferProduct?.name ?? "Товар"}
                aria-label="Найти товар для перемещения"
              />
            </label>

            <div className="transfer-options">
              {transferProductOptions.map((line) => (
                <button
                  type="button"
                  key={line.product.id}
                  className={transferForm.productId === line.product.id ? "active" : ""}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() => {
                    setTransferForm((current) => ({ ...current, productId: line.product.id }));
                    setTransferSearch("");
                  }}
                >
                  {line.product.name}
                </button>
              ))}
            </div>

            {transferProduct && (
              <div className="selected-transfer-product no-ios-callout">
                <span>Выбран товар</span>
                <strong>{transferProduct.name}</strong>
              </div>
            )}

            <div className="transfer-stepper">
              <span>Количество</span>
              <div>
                <button
                  type="button"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() =>
                    setTransferForm((current) => {
                      const product = state.products.find((item) => item.id === current.productId);
                      const step = quantityStep(product);
                      const quantity = product ? parseQuantity(String(current.quantity - step), product, step) : current.quantity - step;
                      return { ...current, quantity: Math.max(step, quantity) };
                    })
                  }
                  aria-label="Уменьшить количество"
                >
                  <Minus size={18} />
                </button>
                <strong>{num(transferForm.quantity)}</strong>
                <button
                  type="button"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() =>
                    setTransferForm((current) => {
                      const product = state.products.find((item) => item.id === current.productId);
                      const step = quantityStep(product);
                      const quantity = product ? parseQuantity(String(current.quantity + step), product, step) : current.quantity + step;
                      return { ...current, quantity };
                    })
                  }
                  aria-label="Увеличить количество"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="two-fields">
              <label>
                Откуда
                <select
                  value={transferForm.fromPointId}
                  onChange={(event) => setTransferForm((current) => ({ ...current, fromPointId: event.target.value }))}
                >
                  {state.points.filter((point) => point.active).map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Куда
                <select
                  value={transferForm.toPointId}
                  onChange={(event) => setTransferForm((current) => ({ ...current, toPointId: event.target.value }))}
                >
                  {state.points.filter((point) => point.active).map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              className="primary-cta transfer-submit no-ios-callout tap-target"
              onContextMenu={(e) => e.preventDefault()}
              onClick={addTransfer}
              disabled={!canEditReport}
            >
              <Truck size={20} />
              <span>Переместить товар</span>
            </button>
          </div>

          <div className="compact-list">
            {todaysTransfers.map((transfer) => {
              const from = state.points.find((point) => point.id === transfer.fromPointId)?.name ?? transfer.fromPointId;
              const to = state.points.find((point) => point.id === transfer.toPointId)?.name ?? transfer.toPointId;
              const product = state.products.find((item) => item.id === transfer.productId)?.name ?? transfer.productId;
              return (
                <div className="movement-row no-ios-callout" key={transfer.id}>
                  <div>
                    <strong>{product}</strong>
                    <span>
                      {from} → {to} · {transfer.quantity}
                    </span>
                  </div>
                  <button type="button" onClick={() => removeTransfer(transfer.id)} aria-label="Удалить перемещение">
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "receipts" && (
        <section className="screen receipts-screen">
          <input ref={receiptPhotoInputRef} className="hidden-file-input" type="file" accept="image/*" onChange={handleReceiptPhotoFile} />
          <div className="receipt-import-panel no-ios-callout">
            <div className={receiptPhotoUrl ? "receipt-photo-preview has-photo" : "receipt-photo-preview"}>
              {receiptPhotoUrl ? (
                <img src={receiptPhotoUrl} alt="Фото чека" />
              ) : (
                <div className="photo-empty">
                  <ImagePlus size={22} />
                  <span>Фото чека</span>
                </div>
              )}
            </div>
            <div className="photo-actions">
              <button type="button" onClick={() => receiptPhotoInputRef.current?.click()} aria-label="Галерея" title="Галерея">
                <ImagePlus size={18} />
              </button>
              <button type="button" onClick={runReceiptOcr} disabled={!receiptPhotoUrl || receiptOcrBusy} aria-label="OCR" title="OCR">
                <Search size={18} />
              </button>
            </div>
          </div>

          {receiptCandidates.length > 0 && (
            <div className="receipt-review">
              {receiptCandidates.map((candidate) => (
                <div className={receiptCandidateHasProblem(candidate) ? "receipt-review-row needs-review no-ios-callout" : "receipt-review-row no-ios-callout"} key={candidate.id}>
                  <div className="receipt-review-text">
                    <span>Чек:</span>
                    <strong>{candidate.rawText}</strong>
                    <small>{candidate.productText}</small>
                  </div>
                  <label>
                    Товар
                    <select value={candidate.productId} onChange={(event) => updateReceiptCandidate(candidate.id, { productId: event.target.value })}>
                      <option value="">Выбрать товар вручную</option>
                      {state.products.filter((product) => product.active).map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                      <option value="__new__">Создать новый товар</option>
                      <option value="__skip__">Пропустить</option>
                    </select>
                  </label>
                  <div className="receipt-review-grid">
                    <label>
                      Количество
                      <input
                        inputMode="decimal"
                        value={candidate.quantity}
                        onChange={(event) => updateReceiptCandidate(candidate.id, { quantity: event.target.value })}
                      />
                    </label>
                    <div className="receipt-confidence">
                      <span>Уверенность</span>
                      <strong>{candidate.confidence}%</strong>
                    </div>
                  </div>
                  {candidate.productId !== "__skip__" && candidate.confidence < 85 && !candidate.confirmed && (
                    <button type="button" className="secondary-wide no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => confirmReceiptCandidate(candidate.id)} disabled={!candidate.productId}>
                      <CheckCircle2 size={17} />
                      Подтвердить строку
                    </button>
                  )}
                </div>
              ))}
              {receiptIgnoredLines.length > 0 && (
                <details className="receipt-ignored no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} open={receiptIgnoredOpen} onToggle={(event) => setReceiptIgnoredOpen(event.currentTarget.open)}>
                  <summary>Игнорировано строк: {receiptIgnoredLines.length}</summary>
                  <div>
                    {receiptIgnoredLines.map((line, index) => (
                      <span key={`${line}-${index}`}>{line}</span>
                    ))}
                  </div>
                </details>
              )}
              <button type="button" className="primary-action no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={applyReceiptCandidates} disabled={!canApplyReceiptCandidates}>
                <CheckCircle2 size={18} />
                Применить приход
              </button>
            </div>
          )}

          <label className="search-field">
            <Search size={18} />
            <input
              value={receiptSearch}
              onChange={(event) => setReceiptSearch(event.target.value)}
              placeholder="Поиск товара для прихода"
              aria-label="Поиск товара для прихода"
            />
          </label>

          <div className="receipt-list">
            {receiptLines.map((line) => (
              <div className="receipt-row no-ios-callout" key={line.product.id}>
                <div>
                  <strong>{line.rowNumber}. {line.product.name}</strong>
                  <span>{num(line.previousRest)}</span>
                </div>
                <div className="small-stepper">
                  <button type="button" onClick={() => adjustIncoming(line.product.id, -1)} disabled={!canEditReport} aria-label="Уменьшить приход">
                    <Minus size={16} />
                  </button>
                  <input
                    inputMode={allowsDecimalProduct(line.product) ? "decimal" : "numeric"}
                    value={formatQuantity(line.incoming, line.product)}
                    onChange={(event) => updateItem(line.product.id, { incoming: parseQuantity(event.target.value, line.product) })}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        adjustIncoming(line.product.id, 1);
                      }
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        adjustIncoming(line.product.id, -1);
                      }
                    }}
                    disabled={!canEditReport}
                    aria-label={`Приход ${line.product.name}`}
                  />
                  <button type="button" onClick={() => adjustIncoming(line.product.id, 1)} disabled={!canEditReport} aria-label="Увеличить приход">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "finance" && (
        <section className="screen finance-screen">
          <div className="finance-grid">
            <Metric label="Должен сдать" value={currency(selectedCash.shouldHandOver)} tone="neutral" />
            <Metric label="Сдал" value={currency(selectedCashInput.handedOver)} tone="neutral" />
            <Metric label="Разница" value={currency(selectedCash.shortageOrPlus)} tone={selectedCash.shortageOrPlus < 0 ? "bad" : "good"} />
          </div>

          <details className="finance-more no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}>
            <summary>
              Подробнее
              <ChevronDown size={16} />
            </summary>
            <ReportRow label="Водители" value={currency(cashTotal.productRevenue)} tone={Math.abs(financeRevenueGap) > 0.01 ? "bad" : "good"} />
            <ReportRow label="Скидки" value={currency(financeTotals.discounts)} />
            <ReportRow label="Расходы" value={currency(financeTotals.expenses)} />
            <ReportRow label="Недостача" value={currency(cashTotal.shortageOrPlus)} tone={cashTotal.shortageOrPlus < 0 ? "bad" : "good"} />
            {Math.abs(financeRevenueGap) > 0.01 && (
              <div className="warning-note">
                <AlertTriangle size={18} />
                Выручка водителей не совпадает с продажами по факту.
              </div>
            )}
          </details>

          <div className="driver-tabs" aria-label="Водители">
            {cashColumnKeys.map((columnKey) => {
              const cash = cashColumns.find((item) => item.columnKey === columnKey) ?? calculateCash(emptyCash(columnKey));
              return (
                <button
                  type="button"
                  key={columnKey}
                  className={selectedCashColumn === columnKey ? "active no-ios-callout tap-target" : "no-ios-callout tap-target"} onContextMenu={(e) => e.preventDefault()}
                  onClick={() => setSelectedCashColumn(columnKey)}
                >
                  <span>{cash.driverName || columnKey}</span>
                  <strong className={cash.shortageOrPlus < 0 ? "bad-text" : "good-text"}>{currency(cash.shortageOrPlus)}</strong>
                </button>
              );
            })}
          </div>

          <div className="finance-editor">
            <label>
              Водитель
              <input
                value={selectedCashInput.driverName}
                onChange={(event) => updateCash("driverName", event.target.value)}
                disabled={!canEditReport}
              />
            </label>
            <div className="two-fields">
              <label>
                Выручка
                <input
                  inputMode="decimal"
                  value={num(selectedCashInput.productRevenue)}
                  onChange={(event) => updateCash("productRevenue", parseNumber(event.target.value))}
                  disabled={!canEditReport}
                />
              </label>
              <label>
                Сдали
                <input
                  inputMode="decimal"
                  value={num(selectedCashInput.handedOver)}
                  onChange={(event) => updateCash("handedOver", parseNumber(event.target.value))}
                  disabled={!canEditReport}
                />
              </label>
            </div>
            <button type="button" className="secondary-wide no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={syncSelectedRevenueFromFact} disabled={!canEditReport}>
              <RefreshCcw size={18} />
              Выровнять выбранного водителя по факту
            </button>

            <details>
              <summary>
                Расходы и скидки
                <ChevronDown size={16} />
              </summary>
              <div className="expense-grid">
                {cashFields.map(([field, label]) => (
                  <label key={field}>
                    {label}
                    <input
                      inputMode="decimal"
                      value={num(Number(selectedCashInput[field]) || 0)}
                      onChange={(event) => updateCash(field, parseNumber(event.target.value))}
                      disabled={!canEditReport}
                    />
                  </label>
                ))}
              </div>
            </details>

            <div className="custom-expense-panel no-ios-callout">
              <div className="panel-title">
                <strong>Доп. расходы</strong>
                <span>{(selectedCashInput.customExpenses ?? []).length}</span>
              </div>
              <div className="custom-expense-form">
                <input
                  value={newCustomExpense.label}
                  onChange={(event) => setNewCustomExpense((current) => ({ ...current, label: event.target.value }))}
                  placeholder="Название"
                  disabled={!canEditReport}
                  aria-label="Название доп расхода"
                />
                <input
                  inputMode="decimal"
                  value={newCustomExpense.amount}
                  onChange={(event) => setNewCustomExpense((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="AED"
                  disabled={!canEditReport}
                  aria-label="Сумма доп расхода"
                />
                <button type="button" onClick={addCustomExpense} disabled={!canEditReport} aria-label="Добавить доп расход">
                  <Plus size={18} />
                </button>
              </div>
              {(selectedCashInput.customExpenses ?? []).map((expense) => (
                <div className="custom-expense-row no-ios-callout" key={expense.id}>
                  <span>{expense.label}</span>
                  <strong>{currency(expense.amount)}</strong>
                  <button type="button" onClick={() => removeCustomExpense(expense.id)} disabled={!canEditReport} aria-label="Удалить доп расход">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {activeTab === "more" && (
        <section className="screen more-screen">
          <div className="screen-head">
            <div>
              <span className="overline">Еще</span>
              <h2>Закрытие дня</h2>
            </div>
            <Settings size={22} />
          </div>

          <div className={closeDisabled && !currentReport.closed ? "close-panel locked no-ios-callout" : "close-panel ready no-ios-callout"}>
            <div className="close-status no-ios-callout">
              {closeDisabled && !currentReport.closed ? <Lock size={22} /> : <CheckCircle2 size={22} />}
              <div>
                <strong>
                  {filledCount} / {inventoryLines.length}
                </strong>
                <span>
                  {missingCount
                    ? `Осталось заполнить: ${missingCount} товаров`
                    : hasFinanceMismatch
                      ? "Выручка не совпадает с фактом"
                      : errorWarningCount > 0
                        ? "Есть ошибки проверки"
                        : "Проверка завершена"}
                </span>
              </div>
            </div>
            <button type="button" className="primary-cta no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={closeDay} disabled={closeDisabled}>
              Закрыть день
            </button>
            {closeDisabled && !currentReport.closed && (
              <button type="button" className="secondary-wide check-action no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={goToReportCheck}>
                <AlertTriangle size={18} />
                Перейти к проверке
              </button>
            )}
            {currentReport.closed && (
              <button type="button" className="secondary-wide no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={reopenDay}>
                Открыть отчет снова
              </button>
            )}
          </div>

          <div className="report-card no-ios-callout">
            <h3>Отчет перед закрытием</h3>
            <ReportRow label="Продано" value={currency(revenue)} />
            <ReportRow label="Перемещения" value={currency(transferValue)} />
            <ReportRow label="Скидки" value={currency(financeTotals.discounts)} />
            <ReportRow label="Сдали" value={currency(cashTotal.handedOver)} />
            <ReportRow label="Разница" value={currency(cashTotal.shortageOrPlus)} tone={cashTotal.shortageOrPlus < 0 ? "bad" : "good"} />
          </div>

          {(problemCount > 0 || reportWarningList.length > 0) && (
            <div className="warning-list">
              <div>
                <AlertTriangle size={18} />
                <strong>Проверка</strong>
              </div>
              {reportWarningList.slice(0, 5).map((warning) => (
                <span key={`${warning.code}-${warning.message}`}>{warning.message}</span>
              ))}
            </div>
          )}

          <details className="analytics-panel no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}>
            <summary>
              Общая статистика
              <ChevronDown size={16} />
            </summary>
            <div className="panel-title">
              <strong>{analytics.weekStart} → {selectedDate}</strong>
              <span />
            </div>
            <div className="finance-grid">
              <Metric label="Неделя" value={currency(analytics.week.total)} tone="neutral" />
              <Metric label="Месяц" value={currency(analytics.month.total)} tone="neutral" />
            </div>
            <div className="analytics-columns">
              <TopList title="Топ точек за неделю" items={analytics.week.points.slice(0, 5).map((item) => ({ label: item.name, value: currency(item.value) }))} />
              <TopList
                title="Топ водителей за неделю"
                items={analytics.week.drivers.slice(0, 5).map((item) => ({ label: `${item.name} · ${item.point}`, value: currency(item.value) }))}
              />
              <TopList title="Топ точек за месяц" items={analytics.month.points.slice(0, 5).map((item) => ({ label: item.name, value: currency(item.value) }))} />
              <TopList
                title="Топ водителей за месяц"
                items={analytics.month.drivers.slice(0, 5).map((item) => ({ label: `${item.name} · ${item.point}`, value: currency(item.value) }))}
              />
            </div>
          </details>

          <details className="carryover-panel no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}>
            <summary>
              Контроль остатков
              <ChevronDown size={16} />
            </summary>
            <div className="panel-title">
              <strong>{carryoverAudit.previousDate}</strong>
              <span />
            </div>
            <ReportRow label="Вчерашний отчет закрыт" value={carryoverAudit.previousClosed ? "Да" : "Нет"} tone={carryoverAudit.previousClosed ? "good" : "bad"} />
            <ReportRow label="Перенесено позиций" value={`${carryoverAudit.currentPreviousRestCount} / ${inventoryLines.length}`} />
            <button type="button" className="secondary-wide no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={carryForwardCurrentRests} disabled={!canEditReport}>
              <RefreshCcw size={18} />
              Перенести остатки на сегодня
            </button>
          </details>

          <div className="settings-panel no-ios-callout">
            <div className="settings-group settings-group-wide">
              <div className="panel-title">
                <strong>Параметры отчета</strong>
                <span>{selectedPoint?.name ?? "Точка"}</span>
              </div>
              <div className="settings-fields">
                <label>
                  Дата отчета
                  <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
                </label>
                <label>
                  Точка
                  <select value={selectedPointId} onChange={(event) => selectPoint(event.target.value)}>
                    {state.points.filter((point) => point.active).map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Режим импорта
                  <select value={importMode} onChange={(event) => setImportMode(event.target.value as ImportMode)}>
                    <option value="merge">Обновить найденные ячейки</option>
                    <option value="replace">Заменить отчет</option>
                  </select>
                </label>
              </div>
            </div>

            <input
              ref={importInputRef}
              className="hidden-file-input"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleTemplateImport}
            />

            <div className="settings-group">
              <div className="panel-title">
                <strong>Импорт и отчеты</strong>
                <span>Excel / PNG</span>
              </div>
              <div className="settings-action-grid">
                <button type="button" className="secondary-wide settings-text-button no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => importInputRef.current?.click()}>
                  <Upload size={18} />
                  Импорт из шаблона
                </button>
                <button type="button" className="secondary-wide settings-text-button no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => exportExcel("single")}>
                  <Download size={18} />
                  Отчет точки
                </button>
                <button type="button" className="secondary-wide settings-text-button no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => exportExcel("all")}>
                  <Download size={18} />
                  Все точки
                </button>
                <button
                  type="button"
                  className="secondary-wide settings-text-button no-ios-callout tap-target"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={generateDiscrepancyImage}
                  disabled={discrepancyLines.length === 0}
                >
                  <ImageDown size={18} />
                  PNG расхождений
                </button>
              </div>
            </div>

            <div className="settings-group">
              <div className="panel-title">
                <strong>Проверка данных</strong>
                <span>{serverCheck.status === "checking" ? "Проверка" : "Контроль"}</span>
              </div>
              <div className="settings-action-grid">
                <button
                  type="button"
                  className="secondary-wide settings-text-button no-ios-callout tap-target"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={resetRestsToZeroWithoutShortage}
                  disabled={!canEditReport}
                >
                  <Eraser size={18} />
                  Обнулить без недостачи
                </button>
                <button
                  type="button"
                  className="secondary-wide settings-text-button no-ios-callout tap-target"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={checkSupabaseConnection}
                  disabled={serverCheck.status === "checking"}
                >
                  <Wifi size={18} />
                  Проверить Supabase
                </button>
              </div>
              <div className={`server-status ${serverCheck.status} no-ios-callout`}>
                {serverCheck.message}
              </div>
            </div>

            <div className="settings-group settings-group-wide">
              <div className="panel-title">
                <strong>Настройки системы</strong>
                <span>Звук</span>
              </div>
              <div className="settings-action-grid system-settings-grid">
                <button
                  type="button"
                  className={uiSoundEnabled ? "secondary-wide settings-text-button active no-ios-callout tap-target" : "secondary-wide settings-text-button no-ios-callout tap-target"}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() => setUiSoundEnabled((current) => !current)}
                >
                  {uiSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  {uiSoundEnabled ? "Звук включен" : "Звук выключен"}
                </button>
                <button
                  type="button"
                  className={speechEnabled ? "secondary-wide settings-text-button active no-ios-callout tap-target" : "secondary-wide settings-text-button no-ios-callout tap-target"}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() => setSpeechEnabled((current) => !current)}
                >
                  {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  {speechEnabled ? "Озвучка цифр включена" : "Озвучка цифр выключена"}
                </button>
              </div>
            </div>
          </div>

          <details className="directory-panel no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()}>
            <summary>
              Справочники
              <ChevronDown size={16} />
            </summary>

            <div className="directory-section">
              <div className="panel-title">
                <strong>Точки</strong>
                <span>{state.points.filter((point) => point.active).length}</span>
              </div>
              <div className="inline-add-form">
                <input value={newPointName} onChange={(event) => setNewPointName(event.target.value)} placeholder="Новая точка" />
                <button type="button" onClick={addPoint} aria-label="Добавить точку">
                  <Plus size={18} />
                </button>
              </div>
              {state.points.map((point) => (
                <div className="admin-row no-ios-callout" key={point.id}>
                  <input value={point.name} onChange={(event) => updatePoint(point.id, { name: event.target.value })} />
                  <label className="mini-toggle no-ios-callout">
                    <input type="checkbox" checked={point.active} onChange={(event) => updatePoint(point.id, { active: event.target.checked })} />
                    Активна
                  </label>
                  <button type="button" onClick={() => removePoint(point.id)} aria-label="Удалить точку">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="directory-section">
              <div className="panel-title">
                <strong>Водители</strong>
                <span>{state.drivers.filter((driver) => driver.active).length}</span>
              </div>
              <div className="driver-add-form">
                <input value={newDriver.name} onChange={(event) => setNewDriver((current) => ({ ...current, name: event.target.value }))} placeholder="Имя водителя" />
                <select value={newDriver.pointId} onChange={(event) => setNewDriver((current) => ({ ...current, pointId: event.target.value }))}>
                  {state.points.filter((point) => point.active).map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={addDriver} aria-label="Добавить водителя">
                  <Plus size={18} />
                </button>
              </div>
              {state.drivers.map((driver) => (
                <div className="admin-row driver-admin-row" key={driver.id}>
                  <input value={driver.name} onChange={(event) => updateDriver(driver.id, { name: event.target.value })} />
                  <select value={driver.pointId} onChange={(event) => updateDriver(driver.id, { pointId: event.target.value })}>
                    {state.points.filter((point) => point.active).map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.name}
                      </option>
                    ))}
                  </select>
                  <label className="mini-toggle no-ios-callout">
                    <input type="checkbox" checked={driver.active} onChange={(event) => updateDriver(driver.id, { active: event.target.checked })} />
                    Активен
                  </label>
                  <button type="button" onClick={() => removeDriver(driver.id)} aria-label="Удалить водителя">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="directory-section product-directory-section">
              <div className="panel-title product-directory-title">
                <strong>Товары</strong>
                <span>{state.products.filter((product) => product.active).length}</span>
              </div>
              <div className="product-add-form">
                <input value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} placeholder="Название" />
                <input inputMode="decimal" value={newProduct.price} onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))} placeholder="Цена" />
                <input inputMode="decimal" value={newProduct.norm} onChange={(event) => setNewProduct((current) => ({ ...current, norm: event.target.value }))} placeholder="Норма" />
                <input value={newProduct.category} onChange={(event) => setNewProduct((current) => ({ ...current, category: event.target.value }))} placeholder="Категория" />
                <button type="button" className="product-add-button" onClick={addProduct}>
                  <Plus size={18} />
                  <span>Добавить товар</span>
                </button>
              </div>
              <label className="search-field compact">
                <Search size={17} />
                <input value={productAdminSearch} onChange={(event) => setProductAdminSearch(event.target.value)} placeholder="Поиск в товарах" aria-label="Поиск в товарах" />
              </label>
              <div className="product-directory-header no-ios-callout">
                <span>Название</span>
                <span>Цена</span>
                <span>Норма</span>
                <span>Дробный товар</span>
                <span>Шаг</span>
                <span>Активен</span>
              </div>
              <div className="product-admin-list">
                {adminProducts.map((product) => (
                  <div className="product-admin-row product-directory-row no-ios-callout" key={product.id}>
                    <div className="order-controls">
                      <button type="button" onClick={() => moveProductShelf(product.id, -1)} aria-label="Выше">
                        <ArrowUp size={14} />
                      </button>
                      <button type="button" onClick={() => moveProductShelf(product.id, 1)} aria-label="Ниже">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <input value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value })} />
                    <input inputMode="decimal" value={num(product.price)} onChange={(event) => updateProduct(product.id, { price: parseNumber(event.target.value) })} />
                    <input inputMode="decimal" value={num(product.norm)} onChange={(event) => updateProduct(product.id, { norm: parseNumber(event.target.value) })} />
                    <input value={product.category} onChange={(event) => updateProduct(product.id, { category: event.target.value })} />
                    <input inputMode="numeric" value={String(product.shelfOrder ?? "")} onChange={(event) => updateProduct(product.id, { shelfOrder: parseNumber(event.target.value) || undefined })} aria-label="Порядок полки" />
                    <label className="mini-toggle no-ios-callout">
                      <input type="checkbox" checked={Boolean(product.allowDecimal)} onChange={(event) => updateProduct(product.id, { allowDecimal: event.target.checked, quantityStep: event.target.checked ? product.quantityStep ?? 0.5 : 1 })} />
                      Дробный
                    </label>
                    <input
                      inputMode="decimal"
                      value={num(product.quantityStep ?? 1)}
                      onChange={(event) => updateProduct(product.id, { quantityStep: Math.max(0.01, parseNumber(event.target.value) || 1) })}
                      aria-label="Шаг"
                    />
                    <label className="mini-toggle no-ios-callout">
                      <input type="checkbox" checked={product.active} onChange={(event) => updateProduct(product.id, { active: event.target.checked })} />
                      Актив.
                    </label>
                    <button type="button" onClick={() => removeProduct(product.id)} aria-label="Удалить товар">
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </section>
      )}

      {progressOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Статус заполнения">
          <div className="scanner-sheet progress-sheet">
            <div className="screen-head">
              <div>
                <span className="overline">Заполнение</span>
                <h2>{filledCount} / {inventoryLines.length}</h2>
              </div>
              <button type="button" className="icon-button no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={() => setProgressOpen(false)} aria-label="Закрыть список заполнения">
                <X size={20} />
              </button>
            </div>
            <div className="progress-columns">
              <div>
                <div className="panel-title">
                  <strong>Не заполнено</strong>
                  <span>{missingLines.length}</span>
                </div>
                <div className="progress-list">
                  {missingLines.map((line) => (
                    <ProductPickButton
                      key={line.product.id}
                      line={line}
                      onClick={() => {
                        setProgressOpen(false);
                        startQuick(line.product.id);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="panel-title">
                  <strong>Заполнено</strong>
                  <span>{filledLines.length}</span>
                </div>
                <div className="progress-list">
                  {filledLines.map((line) => (
                    <ProductPickButton
                      key={line.product.id}
                      line={line}
                      onClick={() => {
                        setProgressOpen(false);
                        startQuick(line.product.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isFocusMode && <nav className="bottom-nav" aria-label="Основное меню">
        <NavButton icon={<HomeIcon size={20} />} label="Главная" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
        <NavButton
          icon={<Package size={20} />}
          label="Остатки"
          active={activeTab === "inventory"}
          badge={missingCount}
          onClick={() => {
            setInventoryView("list");
            setActiveTab("inventory");
          }}
        />
        <NavButton icon={<PackagePlus size={20} />} label="Приход" active={activeTab === "receipts"} onClick={() => setActiveTab("receipts")} />
        <NavButton icon={<Truck size={20} />} label="Перемещ." active={activeTab === "transfers"} onClick={() => setActiveTab("transfers")} />
        <NavButton icon={<WalletCards size={20} />} label="Финансы" active={activeTab === "finance"} onClick={() => setActiveTab("finance")} />
      </nav>}

      {false && lastSaved && <span className="save-stamp">Автосохранение</span>}
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "good" | "neutral" | "warn" | "bad" }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProductPickButton({ line, onClick }: { line: ReportLine; onClick: () => void }) {
  const tone = lineTone(line);
  return (
    <button type="button" className="product-pick no-ios-callout tap-target" onContextMenu={(e) => e.preventDefault()} onClick={onClick}>
      <span className={`dot ${tone}`} />
      <div>
        <strong>{line.rowNumber}. {line.product.name}</strong>
        <span>
          Было {num(line.previousRest)} · {lineStatusText(line)}
        </span>
      </div>
      <ArrowRight size={18} />
    </button>
  );
}

function ReportRow({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "bad" }) {
  return (
    <div className="report-row no-ios-callout">
      <span>{label}</span>
      <strong className={tone === "bad" ? "bad-text" : tone === "good" ? "good-text" : ""}>{value}</strong>
    </div>
  );
}

function TopList({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return (
    <div className="top-list no-ios-callout">
      <h3>{title}</h3>
      {items.length ? (
        items.map((item, index) => (
          <div className="report-row no-ios-callout" key={`${item.label}-${index}`}>
            <span>
              {index + 1}. {item.label}
            </span>
            <strong>{item.value}</strong>
          </div>
        ))
      ) : (
        <div className="empty-state">Нет данных</div>
      )}
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  badge,
  onClick
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button type="button" className={active ? "active no-ios-callout tap-target" : "no-ios-callout tap-target"} onContextMenu={(e) => e.preventDefault()} onClick={onClick} aria-label={label} title={label}>
      <span className="nav-icon">
        {icon}
        {Boolean(badge) && <b>{badge}</b>}
      </span>
      <span className="nav-label">{label}</span>
    </button>
  );
}
