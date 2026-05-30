"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Download,
  Home as HomeIcon,
  Lock,
  Mic,
  Minus,
  MoreHorizontal,
  Package,
  PackagePlus,
  Plus,
  ScanLine,
  Search,
  Settings,
  Star,
  Truck,
  WalletCards,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  calculateCash,
  calculateCashColumns,
  calculateCashTotal,
  calculateDashboard,
  calculateReportLines,
  calculateReportRevenue,
  canCloseReport,
  countProblems,
  getReport,
  getReportWarnings
} from "./lib/calculations";
import { applyCarryoverAfterClose } from "./lib/carryover";
import { createExcelReportFile } from "./lib/excel";
import { formatDecimal, parseDecimal, parseOptionalDecimal } from "./lib/numbers";
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
  Point,
  Product,
  ReportItemInput,
  ReportLine,
  Transfer
} from "./lib/types";

type Tab = "home" | "inventory" | "receipts" | "transfers" | "finance" | "more";
type CategoryId = "spirits" | "beer" | "wine" | "sparkling" | "premium";
type InventoryView = "categories" | "quick" | "list";
type LineTone = "empty" | "done" | "warn";
type SpeechRecognitionResultEventLike = { results?: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

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

function extractSpokenNumber(text: string) {
  const match = text.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!match) return undefined;
  return parseOptionalNumber(match[0]);
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
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [inventoryView, setInventoryView] = useState<InventoryView>("categories");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [quickIndex, setQuickIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedPointId, setSelectedPointId] = useState("jvc");
  const [selectedDriverId, setSelectedDriverId] = useState("driver-farrukh");
  const [selectedCashColumn, setSelectedCashColumn] = useState<CashColumnKey>("F");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [preparedDownload, setPreparedDownload] = useState<{ url: string; fileName: string } | null>(null);
  const [lastSaved, setLastSaved] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerQuery, setScannerQuery] = useState("");
  const [progressOpen, setProgressOpen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [receiptSearch, setReceiptSearch] = useState("");
  const [transferSearch, setTransferSearch] = useState("");
  const [newPointName, setNewPointName] = useState("");
  const [newDriver, setNewDriver] = useState({ name: "", pointId: "jvc" });
  const [newProduct, setNewProduct] = useState({ name: "", price: "", norm: "", category: "Напитки" });
  const [newCustomExpense, setNewCustomExpense] = useState({ label: "", amount: "" });
  const [productAdminSearch, setProductAdminSearch] = useState("");
  const [transferForm, setTransferForm] = useState({
    fromPointId: "jvc",
    toPointId: "business-bay",
    productId: "absolut-blue-ltr",
    quantity: 1,
    comment: ""
  });

  const quickInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
    setLastSaved(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
  }, [state, hydrated]);

  useEffect(() => {
    return () => {
      if (preparedDownload) URL.revokeObjectURL(preparedDownload.url);
    };
  }, [preparedDownload]);

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
  const revenue = useMemo(() => calculateReportRevenue(state, currentReport), [currentReport, state]);
  const cashColumns = useMemo(() => calculateCashColumns(currentReport), [currentReport]);
  const cashTotal = useMemo(() => calculateCashTotal(currentReport), [currentReport]);
  const dashboard = useMemo(() => calculateDashboard(state, selectedDate), [selectedDate, state]);
  const reportWarningList = useMemo(() => getReportWarnings(state, currentReport), [currentReport, state]);
  const errorWarningCount = reportWarningList.filter((warning) => warning.severity === "error").length;
  const selectedPoint = state.points.find((point) => point.id === selectedPointId);
  const canEditReport = !currentReport.closed;
  const filledCount = inventoryLines.filter((line) => typeof line.homeRest === "number").length;
  const missingCount = Math.max(inventoryLines.length - filledCount, 0);
  const problemCount = countProblems(inventoryLines);
  const progressPercent = inventoryLines.length ? Math.round((filledCount / inventoryLines.length) * 100) : 0;
  const visibleCashColumns = cashColumns.filter((cash) => cash.driverName || hasCashValues(cash));
  const cashColumnKeys = (visibleCashColumns.length ? visibleCashColumns : cashColumns.filter((cash) => cash.columnKey === "F")).map(
    (cash) => (cash.columnKey ?? "F") as CashColumnKey
  );
  const selectedCashInput = currentReport.cashColumns?.[selectedCashColumn] ?? emptyCash(selectedCashColumn);
  const selectedCash = useMemo(() => calculateCash(selectedCashInput), [selectedCashInput]);
  const filledLines = useMemo(() => inventoryLines.filter((line) => typeof line.homeRest === "number"), [inventoryLines]);
  const missingLines = useMemo(() => inventoryLines.filter((line) => typeof line.homeRest !== "number"), [inventoryLines]);

  const favoriteLines = useMemo(
    () =>
      favoriteNeedles
        .map((needle) => inventoryLines.find((line) => line.product.name.toUpperCase().includes(needle)))
        .filter((line): line is ReportLine => Boolean(line)),
    [inventoryLines]
  );

  const categoryCards = useMemo(
    () =>
      categoryDefs.map((category) => {
        const lines = inventoryLines.filter((line) => productMatchesCategory(line.product, category.id));
        const filled = lines.filter((line) => typeof line.homeRest === "number").length;
        return {
          ...category,
          total: lines.length,
          filled,
          missing: Math.max(lines.length - filled, 0)
        };
      }),
    [inventoryLines]
  );

  const quickLines = useMemo(() => {
    const lines = selectedCategory ? inventoryLines.filter((line) => productMatchesCategory(line.product, selectedCategory)) : inventoryLines;
    return lines.length ? lines : inventoryLines;
  }, [inventoryLines, selectedCategory]);

  const quickLine = quickLines[quickIndex] ?? null;

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return inventoryLines
      .filter((line) => line.product.name.toLowerCase().includes(query) || line.product.id.includes(query))
      .slice(0, 12);
  }, [inventoryLines, search]);

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
      .slice(0, 80);
  }, [productAdminSearch, state.products]);

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
    const id = window.setTimeout(() => {
      quickInputRef.current?.focus();
      quickInputRef.current?.select();
    }, 80);
    return () => window.clearTimeout(id);
  }, [activeTab, inventoryView, quickIndex, quickLine?.product.id]);

  useEffect(() => {
    if (!scannerOpen) return;

    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let stopped = false;

    async function startScanner() {
      const BarcodeDetectorCtor = (window as unknown as { BarcodeDetector?: new (options?: unknown) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
      if (!navigator.mediaDevices?.getUserMedia || !BarcodeDetectorCtor || !videoRef.current) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stopped || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new BarcodeDetectorCtor({ formats: ["ean_13", "ean_8", "code_128", "qr_code"] });
        timer = window.setInterval(async () => {
          if (!videoRef.current) return;
          const codes = await detector.detect(videoRef.current).catch(() => []);
          const code = codes[0]?.rawValue;
          if (code) handleScanValue(code);
        }, 650);
      } catch {
        setNotice("Камера недоступна. Введите код или название товара вручную.");
      }
    }

    void startScanner();
    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [scannerOpen]);

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
          ...patch
        }
      }
    }));
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
      active: true
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
    setSelectedCategory(null);
    setQuickIndex(0);
    setTransferForm((current) => ({
      ...current,
      fromPointId: pointId,
      toPointId: state.points.find((point) => point.active && point.id !== pointId)?.id ?? pointId
    }));
  }

  function startQuick(productId?: string, categoryId?: CategoryId | null) {
    const category = categoryId === undefined ? selectedCategory : categoryId;
    const lines = category ? inventoryLines.filter((line) => productMatchesCategory(line.product, category)) : inventoryLines;
    const fallbackIndex = lines.findIndex((line) => typeof line.homeRest !== "number");
    const productIndex = productId ? lines.findIndex((line) => line.product.id === productId) : -1;
    setSelectedCategory(category ?? null);
    setQuickIndex(productIndex >= 0 ? productIndex : Math.max(fallbackIndex, 0));
    setInventoryView("quick");
    setActiveTab("inventory");
  }

  function continueFill() {
    if (missingCount === 0) {
      setActiveTab("more");
      return;
    }
    startQuick(undefined, null);
  }

  function saveQuickValue(value: string) {
    if (!quickLine) return;
    updateItem(quickLine.product.id, { homeRest: parseOptionalNumber(value) });
  }

  function adjustQuickRest(delta: number) {
    if (!quickLine || !canEditReport) return;
    const current = typeof quickLine.homeRest === "number" ? quickLine.homeRest : 0;
    updateItem(quickLine.product.id, { homeRest: Math.max(0, parseNumber(String(current + delta))) });
  }

  function adjustIncoming(productId: string, currentValue: number, delta: number) {
    if (!canEditReport) return;
    updateItem(productId, { incoming: Math.max(0, parseNumber(String(currentValue + delta))) });
  }

  function goNext() {
    if (quickIndex < quickLines.length - 1) {
      setQuickIndex((current) => current + 1);
      return;
    }
    setInventoryView("categories");
    setNotice("Категория заполнена. Можно перейти к следующей.");
  }

  function goPrev() {
    setQuickIndex((current) => Math.max(current - 1, 0));
  }

  function startVoice() {
    if (!quickLine) return;
    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognitionCtor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setNotice("Голосовой ввод не поддерживается в этом браузере.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
    recognition.onerror = () => {
      setVoiceActive(false);
      setNotice("Не удалось распознать голос.");
    };
    recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      const value = extractSpokenNumber(transcript);
      if (typeof value !== "number") {
        setNotice("Число не распознано.");
        return;
      }
      updateItem(quickLine.product.id, { homeRest: value });
      setNotice(`Остаток ${value} сохранен голосом.`);
    };
    recognition.start();
  }

  function handleScanValue(rawValue: string) {
    const query = rawValue.trim().toLowerCase();
    if (!query) return;
    const match = inventoryLines.find((line) => {
      const excelRows = Object.values(line.product.excelRowsByPoint ?? {}).map(String);
      return (
        line.product.id.toLowerCase() === query ||
        line.product.id.toLowerCase().includes(query) ||
        line.product.name.toLowerCase().includes(query) ||
        String(line.rowNumber) === query ||
        excelRows.includes(query)
      );
    });
    if (!match) {
      setNotice(`Товар по коду "${rawValue}" не найден.`);
      return;
    }
    setScannerOpen(false);
    setScannerQuery("");
    startQuick(match.product.id, null);
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

  const closeDisabled = currentReport.closed || missingCount > 0 || errorWarningCount > 0;
  const quickTone = quickLine ? lineTone(quickLine) : "empty";

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="overline">Ежедневное закрытие</span>
          <h1>{selectedPoint?.name ?? "Точка"}</h1>
        </div>
        <input
          className="date-control"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          aria-label="Дата"
        />
      </header>

      <section className="point-strip" aria-label="Точки">
        {state.points
          .filter((point) => point.active)
          .map((point) => (
            <button
              type="button"
              key={point.id}
              className={point.id === selectedPointId ? "active" : ""}
              onClick={() => selectPoint(point.id)}
            >
              {point.name}
            </button>
          ))}
      </section>

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
          <button type="button" className="hero-progress" onClick={() => setProgressOpen(true)}>
            <div>
              <span className="overline">Заполнено</span>
              <strong>
                {filledCount} / {inventoryLines.length}
              </strong>
            </div>
            <div className="progress-ring" style={{ "--progress": `${progressPercent}%` } as CSSProperties}>
              <span>{progressPercent}%</span>
            </div>
          </button>

          <div className="home-metrics">
            <Metric label="Осталось" value={`${missingCount} товаров`} tone={missingCount ? "warn" : "good"} />
            <Metric label="Выручка" value={currency(revenue)} tone="neutral" />
            <Metric label="Сдали" value={currency(cashTotal.handedOver)} tone="neutral" />
            <Metric label="Недостача" value={currency(cashTotal.shortageOrPlus)} tone={cashTotal.shortageOrPlus < 0 ? "bad" : "good"} />
          </div>

          <button type="button" className="primary-cta" onClick={continueFill}>
            {missingCount === 0 ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
            {missingCount === 0 ? "Открыть закрытие дня" : "Продолжить заполнение"}
          </button>

          <div className="quiet-panel">
            <div>
              <span className="overline">Сегодня все точки</span>
              <strong>{currency(dashboard.daySales)}</strong>
            </div>
            <BarChart3 size={22} />
          </div>
        </section>
      )}

      {activeTab === "inventory" && (
        <section className="screen inventory-screen">
          {inventoryView === "categories" && (
            <>
              <div className="screen-head">
                <div>
                  <span className="overline">Инвентаризация</span>
                  <h2>Выберите категорию</h2>
                </div>
                <button type="button" className="icon-button" onClick={() => setScannerOpen(true)} aria-label="Сканировать штрих-код">
                  <ScanLine size={20} />
                </button>
              </div>

              <div className="view-switch" aria-label="Вид инвентаризации">
                <button type="button" className="active" onClick={() => setInventoryView("categories")}>
                  Категории
                </button>
                <button type="button" onClick={() => setInventoryView("list")}>
                  Список
                </button>
              </div>

              <label className="search-field">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск товара"
                  aria-label="Поиск товара"
                />
              </label>

              {search ? (
                <div className="search-results">
                  {searchResults.map((line) => (
                    <ProductPickButton key={line.product.id} line={line} onClick={() => startQuick(line.product.id, null)} />
                  ))}
                  {searchResults.length === 0 && <div className="empty-state">Ничего не найдено</div>}
                </div>
              ) : (
                <>
                  <div className="favorite-row" aria-label="Избранные товары">
                    {favoriteLines.map((line) => (
                      <button type="button" key={line.product.id} onClick={() => startQuick(line.product.id, null)}>
                        <Star size={14} />
                        <span>{line.product.name.replace(/\s+(LTR|1 LTR|75CL|33CL|BTL|CANS?).*$/i, "")}</span>
                      </button>
                    ))}
                  </div>

                  <div className="category-grid">
                    {categoryCards.map((category) => (
                      <button type="button" className="category-card" key={category.id} onClick={() => startQuick(undefined, category.id)}>
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-title">{category.title}</span>
                        <span className={category.missing ? "category-status warn" : "category-status done"}>
                          {category.filled} / {category.total}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {inventoryView === "list" && (
            <>
              <div className="screen-head">
                <div>
                  <span className="overline">Инвентаризация</span>
                  <h2>Все товары</h2>
                </div>
                <button type="button" className="icon-button" onClick={() => setScannerOpen(true)} aria-label="Сканировать штрих-код">
                  <ScanLine size={20} />
                </button>
              </div>

              <div className="view-switch" aria-label="Вид инвентаризации">
                <button type="button" onClick={() => setInventoryView("categories")}>
                  Категории
                </button>
                <button type="button" className="active" onClick={() => setInventoryView("list")}>
                  Список
                </button>
              </div>

              <label className="search-field">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск товара"
                  aria-label="Поиск товара"
                />
              </label>

              <div className="inventory-list">
                {(search ? searchResults : inventoryLines).map((line) => (
                  <div className={`inventory-list-row ${lineTone(line)}`} key={line.product.id}>
                    <button type="button" onClick={() => startQuick(line.product.id, null)}>
                      <span className={`dot ${lineTone(line)}`} />
                      <strong>{line.rowNumber}. {line.product.name}</strong>
                    </button>
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
                <button type="button" className="ghost-button" onClick={() => setInventoryView("categories")}>
                  <ArrowLeft size={18} />
                  Категории
                </button>
                <span>
                  Товар {quickIndex + 1} из {quickLines.length}
                </span>
              </div>

              {quickLine && (
                <>
                  <div className={`quick-product ${quickTone}`}>
                    <div className="status-line">
                      <span className={`dot ${quickTone}`} />
                      {lineStatusText(quickLine)}
                    </div>
                    <h2>{quickLine.product.name}</h2>
                    <div className="quick-facts">
                      <div>
                        <span>Было</span>
                        <strong>{num(quickLine.previousRest)}</strong>
                      </div>
                      <div>
                        <span>Доступно</span>
                        <strong>{num(quickLine.available)}</strong>
                      </div>
                      <div>
                        <span>Цена</span>
                        <strong>{currency(quickLine.product.price)}</strong>
                      </div>
                    </div>
                  </div>

                  <label className="rest-input">
                    <span>Введите остаток</span>
                    <div className="rest-stepper">
                      <button type="button" onClick={() => adjustQuickRest(-0.5)} disabled={!canEditReport} aria-label="Уменьшить остаток">
                        <Minus size={20} />
                      </button>
                      <input
                        ref={quickInputRef}
                        inputMode="decimal"
                        type="text"
                        value={num(quickLine.homeRest)}
                        onChange={(event) => saveQuickValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            goNext();
                          }
                          if (event.key === "ArrowUp") {
                            event.preventDefault();
                            adjustQuickRest(0.5);
                          }
                          if (event.key === "ArrowDown") {
                            event.preventDefault();
                            adjustQuickRest(-0.5);
                          }
                        }}
                        disabled={!canEditReport}
                        aria-label="Остаток товара"
                      />
                      <button type="button" onClick={() => adjustQuickRest(0.5)} disabled={!canEditReport} aria-label="Увеличить остаток">
                        <Plus size={20} />
                      </button>
                    </div>
                  </label>

                  <div className="auto-calc">
                    <div>
                      <span>Продано</span>
                      <strong>{typeof quickLine.homeRest === "number" ? num(quickLine.sale) : "—"}</strong>
                    </div>
                    <div>
                      <span>Сумма</span>
                      <strong>{typeof quickLine.homeRest === "number" ? currency(quickLine.amount) : "—"}</strong>
                    </div>
                  </div>

                  {quickTone === "warn" && (
                    <div className="warning-note">
                      <AlertTriangle size={18} />
                      Проверьте данные
                    </div>
                  )}

                  <div className="quick-actions">
                    <button type="button" className="secondary-action" onClick={goPrev} disabled={quickIndex === 0}>
                      <ArrowLeft size={18} />
                    </button>
                    <button type="button" className={voiceActive ? "secondary-action active" : "secondary-action"} onClick={startVoice}>
                      <Mic size={18} />
                      Голос
                    </button>
                    <button type="button" className="primary-action" onClick={goNext}>
                      Следующий
                      <ArrowRight size={18} />
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
          <div className="screen-head">
            <div>
              <span className="overline">Перемещения</span>
              <h2>Отдельно от продаж</h2>
            </div>
            <Truck size={22} />
          </div>

          <div className="transfer-card">
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
                  onClick={() => {
                    setTransferForm((current) => ({ ...current, productId: line.product.id }));
                    setTransferSearch("");
                  }}
                >
                  {line.product.name}
                </button>
              ))}
            </div>

            <div className="transfer-stepper">
              <span>Переместить</span>
              <div>
                <button
                  type="button"
                  onClick={() => setTransferForm((current) => ({ ...current, quantity: Math.max(0.5, current.quantity - 0.5) }))}
                  aria-label="Уменьшить количество"
                >
                  <Minus size={18} />
                </button>
                <strong>{num(transferForm.quantity)}</strong>
                <button
                  type="button"
                  onClick={() => setTransferForm((current) => ({ ...current, quantity: current.quantity + 0.5 }))}
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

            <button type="button" className="primary-cta" onClick={addTransfer} disabled={!canEditReport}>
              <Truck size={20} />
              Переместить
            </button>
          </div>

          <div className="compact-list">
            {todaysTransfers.map((transfer) => {
              const from = state.points.find((point) => point.id === transfer.fromPointId)?.name ?? transfer.fromPointId;
              const to = state.points.find((point) => point.id === transfer.toPointId)?.name ?? transfer.toPointId;
              const product = state.products.find((item) => item.id === transfer.productId)?.name ?? transfer.productId;
              return (
                <div className="movement-row" key={transfer.id}>
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
          <div className="screen-head">
            <div>
              <span className="overline">Приходы</span>
              <h2>Поступления товара</h2>
            </div>
            <PackagePlus size={22} />
          </div>

          <div className="receipt-summary">
            <Metric label="Позиций с приходом" value={`${inventoryLines.filter((line) => line.incoming > 0).length}`} tone="neutral" />
            <Metric label="Всего единиц" value={num(inventoryLines.reduce((total, line) => total + line.incoming, 0))} tone="good" />
          </div>

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
              <div className="receipt-row" key={line.product.id}>
                <div>
                  <strong>{line.rowNumber}. {line.product.name}</strong>
                  <span>Было {num(line.previousRest)} · доступно {num(line.available)}</span>
                </div>
                <div className="small-stepper">
                  <button type="button" onClick={() => adjustIncoming(line.product.id, line.incoming, -0.5)} disabled={!canEditReport} aria-label="Уменьшить приход">
                    <Minus size={16} />
                  </button>
                  <input
                    inputMode="decimal"
                    value={num(line.incoming)}
                    onChange={(event) => updateItem(line.product.id, { incoming: parseNumber(event.target.value) })}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        adjustIncoming(line.product.id, line.incoming, 0.5);
                      }
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        adjustIncoming(line.product.id, line.incoming, -0.5);
                      }
                    }}
                    disabled={!canEditReport}
                    aria-label={`Приход ${line.product.name}`}
                  />
                  <button type="button" onClick={() => adjustIncoming(line.product.id, line.incoming, 0.5)} disabled={!canEditReport} aria-label="Увеличить приход">
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
          <div className="screen-head">
            <div>
              <span className="overline">Финансы</span>
              <h2>Касса и разница</h2>
            </div>
            <WalletCards size={22} />
          </div>

          <div className="finance-grid">
            <Metric label="Выручка" value={currency(cashTotal.productRevenue)} tone="neutral" />
            <Metric label="Сдали" value={currency(cashTotal.handedOver)} tone="neutral" />
            <Metric label="Скидки" value={currency(financeTotals.discounts)} tone="warn" />
            <Metric label="Расходы" value={currency(financeTotals.expenses)} tone="warn" />
            <Metric label="Недостача" value={currency(cashTotal.shortageOrPlus)} tone={cashTotal.shortageOrPlus < 0 ? "bad" : "good"} />
          </div>

          <div className="driver-tabs" aria-label="Водители">
            {cashColumnKeys.map((columnKey) => {
              const cash = cashColumns.find((item) => item.columnKey === columnKey) ?? calculateCash(emptyCash(columnKey));
              return (
                <button
                  type="button"
                  key={columnKey}
                  className={selectedCashColumn === columnKey ? "active" : ""}
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

            <div className="custom-expense-panel">
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
                <div className="custom-expense-row" key={expense.id}>
                  <span>{expense.label}</span>
                  <strong>{currency(expense.amount)}</strong>
                  <button type="button" onClick={() => removeCustomExpense(expense.id)} disabled={!canEditReport} aria-label="Удалить доп расход">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="finance-result">
              <span>Должен сдать</span>
              <strong>{currency(selectedCash.shouldHandOver)}</strong>
              <span>Разница</span>
              <strong className={selectedCash.shortageOrPlus < 0 ? "bad-text" : "good-text"}>{currency(selectedCash.shortageOrPlus)}</strong>
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

          <div className={missingCount ? "close-panel locked" : "close-panel ready"}>
            <div className="close-status">
              {missingCount ? <Lock size={22} /> : <CheckCircle2 size={22} />}
              <div>
                <strong>
                  {filledCount} / {inventoryLines.length}
                </strong>
                <span>{missingCount ? `Осталось заполнить: ${missingCount} товаров` : "Проверка завершена"}</span>
              </div>
            </div>
            <button type="button" className="primary-cta" onClick={closeDay} disabled={closeDisabled}>
              Закрыть день
            </button>
            {currentReport.closed && (
              <button type="button" className="secondary-wide" onClick={reopenDay}>
                Открыть отчет снова
              </button>
            )}
          </div>

          <div className="report-card">
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

          <div className="analytics-panel">
            <div className="panel-title">
              <strong>Общая статистика</strong>
              <span>{analytics.weekStart} → {selectedDate}</span>
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
          </div>

          <div className="carryover-panel">
            <div className="panel-title">
              <strong>Контроль остатков</strong>
              <span>{carryoverAudit.previousDate}</span>
            </div>
            <ReportRow label="Вчерашний отчет закрыт" value={carryoverAudit.previousClosed ? "Да" : "Нет"} tone={carryoverAudit.previousClosed ? "good" : "bad"} />
            <ReportRow label="Перенесено позиций" value={`${carryoverAudit.currentPreviousRestCount} / ${inventoryLines.length}`} />
          </div>

          <div className="settings-panel">
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
            <div className="download-actions">
              <button type="button" className="secondary-action" onClick={() => exportExcel("single")}>
                <Download size={18} />
                Отчет точки
              </button>
              <button type="button" className="secondary-action" onClick={() => exportExcel("all")}>
                <Download size={18} />
                Все точки
              </button>
            </div>
          </div>

          <details className="directory-panel">
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
                <div className="admin-row" key={point.id}>
                  <input value={point.name} onChange={(event) => updatePoint(point.id, { name: event.target.value })} />
                  <label className="mini-toggle">
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
                  <label className="mini-toggle">
                    <input type="checkbox" checked={driver.active} onChange={(event) => updateDriver(driver.id, { active: event.target.checked })} />
                    Активен
                  </label>
                  <button type="button" onClick={() => removeDriver(driver.id)} aria-label="Удалить водителя">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="directory-section">
              <div className="panel-title">
                <strong>Товары</strong>
                <span>{state.products.filter((product) => product.active).length}</span>
              </div>
              <div className="product-add-form">
                <input value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} placeholder="Название" />
                <input inputMode="decimal" value={newProduct.price} onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))} placeholder="Цена" />
                <input inputMode="decimal" value={newProduct.norm} onChange={(event) => setNewProduct((current) => ({ ...current, norm: event.target.value }))} placeholder="Норма" />
                <input value={newProduct.category} onChange={(event) => setNewProduct((current) => ({ ...current, category: event.target.value }))} placeholder="Категория" />
                <button type="button" onClick={addProduct} aria-label="Добавить товар">
                  <Plus size={18} />
                </button>
              </div>
              <label className="search-field compact">
                <Search size={17} />
                <input value={productAdminSearch} onChange={(event) => setProductAdminSearch(event.target.value)} placeholder="Поиск в товарах" aria-label="Поиск в товарах" />
              </label>
              <div className="product-admin-list">
                {adminProducts.map((product) => (
                  <div className="product-admin-row" key={product.id}>
                    <input value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value })} />
                    <input inputMode="decimal" value={num(product.price)} onChange={(event) => updateProduct(product.id, { price: parseNumber(event.target.value) })} />
                    <input inputMode="decimal" value={num(product.norm)} onChange={(event) => updateProduct(product.id, { norm: parseNumber(event.target.value) })} />
                    <input value={product.category} onChange={(event) => updateProduct(product.id, { category: event.target.value })} />
                    <label className="mini-toggle">
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
              <button type="button" className="icon-button" onClick={() => setProgressOpen(false)} aria-label="Закрыть список заполнения">
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
                        startQuick(line.product.id, null);
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
                        startQuick(line.product.id, null);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {scannerOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Сканирование штрих-кода">
          <div className="scanner-sheet">
            <div className="screen-head">
              <div>
                <span className="overline">Сканер</span>
                <h2>Открыть товар</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setScannerOpen(false)} aria-label="Закрыть сканер">
                <X size={20} />
              </button>
            </div>
            <video ref={videoRef} playsInline muted />
            <label className="search-field compact">
              <ScanLine size={17} />
              <input
                value={scannerQuery}
                onChange={(event) => setScannerQuery(event.target.value)}
                placeholder="Код или название"
                aria-label="Код или название товара"
              />
            </label>
            <button type="button" className="primary-cta" onClick={() => handleScanValue(scannerQuery)}>
              Открыть товар
            </button>
          </div>
        </div>
      )}

      <nav className="bottom-nav" aria-label="Основное меню">
        <NavButton icon={<HomeIcon size={20} />} label="Главная" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
        <NavButton
          icon={<Package size={20} />}
          label="Инвент."
          active={activeTab === "inventory"}
          badge={missingCount}
          onClick={() => {
            setInventoryView("categories");
            setActiveTab("inventory");
          }}
        />
        <NavButton icon={<PackagePlus size={20} />} label="Приход" active={activeTab === "receipts"} onClick={() => setActiveTab("receipts")} />
        <NavButton icon={<Truck size={20} />} label="Перемещ." active={activeTab === "transfers"} onClick={() => setActiveTab("transfers")} />
        <NavButton icon={<WalletCards size={20} />} label="Финансы" active={activeTab === "finance"} onClick={() => setActiveTab("finance")} />
        <NavButton icon={<MoreHorizontal size={20} />} label="Еще" active={activeTab === "more"} onClick={() => setActiveTab("more")} />
      </nav>

      {lastSaved && <span className="save-stamp">Сохранено {lastSaved}</span>}
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
    <button type="button" className="product-pick" onClick={onClick}>
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
    <div className="report-row">
      <span>{label}</span>
      <strong className={tone === "bad" ? "bad-text" : tone === "good" ? "good-text" : ""}>{value}</strong>
    </div>
  );
}

function TopList({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return (
    <div className="top-list">
      <h3>{title}</h3>
      {items.length ? (
        items.map((item, index) => (
          <div className="report-row" key={`${item.label}-${index}`}>
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
    <button type="button" className={active ? "active" : ""} onClick={onClick}>
      <span className="nav-icon">
        {icon}
        {Boolean(badge) && <b>{badge}</b>}
      </span>
      <span>{label}</span>
    </button>
  );
}
