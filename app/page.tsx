"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Lock,
  Package,
  Plus,
  Receipt,
  Save,
  Search,
  Settings,
  Trash2,
  Truck,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  getReportWarnings,
  getTransferMovement,
  money
} from "./lib/calculations";
import { applyCarryoverAfterClose } from "./lib/carryover";
import { createExcelReportFile } from "./lib/excel";
import { importExcelReport } from "./lib/excel-import";
import { formatDecimal, parseDecimal, parseOptionalDecimal } from "./lib/numbers";
import { createEmptyReport, createInitialState, emptyCash, reportId } from "./lib/seed";
import { loadState, saveState } from "./lib/storage";
import   type {
  AppState,
  CashColumnKey,
  CashInput,
  CustomExpense,
  DailyReport,
  Driver,
  Point,
  ExportOptions,
  ImportMode,
  Product,
  ReportItemInput,
  Transfer
} from "./lib/types";

type Tab = "products" | "cash" | "transfers" | "stats" | "settings";

const cashFields: Array<[keyof Omit<CashInput, "columnKey" | "driverId" | "driverName" | "productRevenue" | "handedOver" | "comment" | "customExpenses">, string]> = [
  ["foodExpenses", "🍔 Питание"],
  ["discounts", "🏷️ Скидки"],
  ["fuel", "⛽ Бензин"],
  ["kfc", "🍗 KFC"],
  ["forHome", "🏠 Для дома"],
  ["carWash", "🚿 Мойка"],
  ["tinting", "🪟 Тонировка"],
  ["otherExpenses", "📦 Другие расходы"],
  ["weReturnedDebt", "↩️ Мы вернули долг"],
  ["weOwe", "📤 Мы должны"],
  ["clientReturnedDebt", "↪️ Клиент вернул долг"],
  ["clientTookDebt", "📥 Клиент взял в долг"]
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

function ensureReport(state: AppState, date: string, pointId: string, driverId: string): AppState {
  const id = reportId(date, pointId);
  if (state.reports.some((report) => report.id === id)) return state;
  return {
    ...state,
    reports: [...state.reports, createEmptyReport(date, pointId, driverId, state.products)]
  };
}

function replaceReport(state: AppState, nextReport: DailyReport): AppState {
  const exists = state.reports.some((report) => report.id === nextReport.id);
  return {
    ...state,
    reports: exists ? state.reports.map((report) => (report.id === nextReport.id ? nextReport : report)) : [...state.reports, nextReport]
  };
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

function QuantityInput({
  ariaLabel,
  value,
  placeholder = "0",
  disabled,
  optional = false,
  min = 0,
  step = 0.5,
  className = "",
  hint,
  navGroup,
  onChange,
}: {
  ariaLabel: string;
  value: number | undefined;
  placeholder?: string;
  disabled: boolean;
  optional?: boolean;
  min?: number | null;
  step?: number;
  className?: string;
  hint?: ReactNode;
  navGroup?: string;
  onChange: (value: number | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const commitStep = (delta: number) => {
    if (disabled) return;

    const rawValue = inputRef.current?.value ?? "";
    const base = rawValue ? parseNumber(rawValue) : typeof value === "number" && Number.isFinite(value) ? value : 0;
    const next = parseNumber(String(base + delta));
    const bounded = min === null ? next : Math.max(min, next);
    if (inputRef.current) inputRef.current.value = num(bounded);
    onChange(bounded);
  };

  const focusNextInColumn = () => {
    if (!navGroup || !inputRef.current) return;
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>(`input[data-quantity-group="${navGroup}"]:not(:disabled)`)
    );
    const currentIndex = inputs.indexOf(inputRef.current);
    const nextInput = inputs[currentIndex + 1];
    if (!nextInput) return;
    nextInput.focus();
    nextInput.select();
  };

  return (
    <label
      className={`field-inline quantity-field ${className}`}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        data-quantity-group={navGroup}
        placeholder={placeholder}
        value={num(value)}
        disabled={disabled}
        onChange={(e) => onChange(optional ? parseOptionalNumber(e.target.value) : parseNumber(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            commitStep(step);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            commitStep(-step);
          }
          if (e.key === "Enter") {
            e.preventDefault();
            focusNextInColumn();
          }
        }}
      />
      <span className="quantity-arrows">
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault();
            commitStep(step);
          }}
          aria-label={`${ariaLabel}: увеличить`}
        >
          <ChevronUp size={12} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault();
            commitStep(-step);
          }}
          aria-label={`${ariaLabel}: уменьшить`}
        >
          <ChevronDown size={12} />
        </button>
      </span>
      {hint}
    </label>
  );
}

export default function Home() {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedPointId, setSelectedPointId] = useState("jvc");
  const [selectedDriverId, setSelectedDriverId] = useState("driver-farrukh");
  const [selectedCashColumn, setSelectedCashColumn] = useState<CashColumnKey>("F");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [preparedDownload, setPreparedDownload] = useState<{ url: string; fileName: string } | null>(null);
  const [lastSaved, setLastSaved] = useState("");
  const [newPointName, setNewPointName] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, norm: 0, category: "Напитки" });
  const [newDriver, setNewDriver] = useState({ name: "", pointId: "jvc" });
  const [newCustomExpense, setNewCustomExpense] = useState({ label: "", amount: "" });
  const [importDate, setImportDate] = useState(todayIso());
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    scope: "day",
    pointScope: "all",
    format: "template",
    date: todayIso(),
    startDate: todayIso(),
    endDate: todayIso(),
    pointId: "jvc"
  });
  const [transferForm, setTransferForm] = useState({
    fromPointId: "jvc",
    toPointId: "business-bay",
    productId: "absolut-blue-ltr",
    quantity: 1,
    comment: ""
  });

  useEffect(() => {
    const loaded = loadState();
    const firstPoint = loaded.points.find((point) => point.active)?.id ?? "jvc";
    const firstDriver = loaded.drivers.find((driver) => driver.active && driver.pointId === firstPoint)?.id ?? loaded.drivers[0]?.id ?? "";
    setState(loaded);
    setSelectedPointId(firstPoint);
    setSelectedDriverId(firstDriver);
    setExportOptions((current) => ({ ...current, pointId: firstPoint }));
    setTransferForm((current) => ({
      ...current,
      fromPointId: firstPoint,
      toPointId: loaded.points.find((point) => point.active && point.id !== firstPoint)?.id ?? firstPoint,
      productId: loaded.products.find((product) => product.active)?.id ?? current.productId
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
  const revenue = useMemo(() => calculateReportRevenue(state, currentReport), [currentReport, state]);
  const cashColumns = useMemo(() => calculateCashColumns(currentReport), [currentReport]);
  const cashTotal = useMemo(() => calculateCashTotal(currentReport), [currentReport]);
  const revenueDiff = useMemo(() => money(cashTotal.productRevenue - revenue), [cashTotal.productRevenue, revenue]);
  const revenueDiffOk = Math.abs(revenueDiff) < 0.01;
  const selectedPoint = state.points.find((point) => point.id === selectedPointId);
  const canEditReport = !currentReport.closed;
  const filledCount = reportLines.filter((line) => typeof line.homeRest === "number").length;
  const missingCount = reportLines.length - filledCount;
  const problemCount = countProblems(reportLines);
  const reportWarningList = useMemo(() => getReportWarnings(state, currentReport), [currentReport, state]);
  const errorWarningCount = reportWarningList.filter((warning) => warning.severity === "error").length;
  const warnWarningCount = reportWarningList.filter((warning) => warning.severity === "warn").length;
  const requestTotal = reportLines.reduce((total, line) => total + line.request, 0);
  const filteredLines = reportLines.filter((line) => line.product.name.toLowerCase().includes(search.toLowerCase()));
  const visibleCashColumns = cashColumns.filter((cash) => cash.driverName || hasCashValues(cash));
  const cashColumnKeys = (visibleCashColumns.length ? visibleCashColumns : cashColumns.filter((cash) => cash.columnKey === "F")).map(
    (cash) => (cash.columnKey ?? "F") as CashColumnKey
  );
  const selectedCashInput = currentReport.cashColumns?.[selectedCashColumn] ?? emptyCash(selectedCashColumn);
  const selectedCash = useMemo(() => calculateCash(selectedCashInput), [selectedCashInput]);

  const pointSummaries = useMemo(
    () =>
      state.points
        .filter((point) => point.active)
        .map((point) => {
          const report = getReport(state, selectedDate, point.id) ?? createEmptyReport(selectedDate, point.id, "", state.products);
          return {
            point,
            revenue: calculateReportRevenue(state, report),
            cash: calculateCashTotal(report),
            report
          };
        }),
    [selectedDate, state]
  );

  const dashboard = useMemo(() => calculateDashboard(state, selectedDate), [state, selectedDate]);

  useEffect(() => {
    const firstKey = cashColumnKeys[0] ?? "F";
    if (!cashColumnKeys.includes(selectedCashColumn)) {
      setSelectedCashColumn(firstKey);
    }
  }, [cashColumnKeys, selectedCashColumn]);

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

  function getManualMovement(productId: string) {
    const item = currentReport.items[productId];
    return Number(item?.movement) || 0;
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
    if (!newCustomExpense.label.trim() || !newCustomExpense.amount) return;
    const expense: CustomExpense = {
      id: makeId(),
      label: newCustomExpense.label.trim(),
      amount: Number(newCustomExpense.amount)
    };
    const current = selectedCashInput.customExpenses ?? [];
    updateCashCustomExpenses([...current, expense]);
    setNewCustomExpense({ label: "", amount: "" });
  }

  function removeCustomExpense(id: string) {
    const current = selectedCashInput.customExpenses ?? [];
    updateCashCustomExpenses(current.filter((e) => e.id !== id));
  }

  function selectPoint(pointId: string) {
    const driver = state.drivers.find((item) => item.pointId === pointId && item.active);
    setSelectedPointId(pointId);
    setSelectedDriverId(driver?.id ?? selectedDriverId);
    setExportOptions((current) => ({ ...current, pointId }));
  }

  function closeDay() {
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
    const hasReports = state.reports.some((report) => report.pointId === pointId);
    if (hasReports) {
      updatePoint(pointId, { active: false });
      setNotice("Точка скрыта (есть сохранённые отчёты).");
      return;
    }
    setState((current) => ({
      ...current,
      points: current.points.filter((point) => point.id !== pointId),
      drivers: current.drivers.filter((driver) => driver.pointId !== pointId)
    }));
    if (selectedPointId === pointId) {
      const next = state.points.find((point) => point.id !== pointId && point.active)?.id;
      if (next) selectPoint(next);
    }
    setNotice("Точка удалена.");
  }

  function removeDriver(driverId: string) {
    const usedInReports = state.reports.some((report) => report.driverId === driverId);
    if (usedInReports) {
      updateDriver(driverId, { active: false });
      setNotice("Водитель деактивирован (есть в отчётах).");
      return;
    }
    setState((current) => ({
      ...current,
      drivers: current.drivers.filter((driver) => driver.id !== driverId)
    }));
    setNotice("Водитель удалён.");
  }

  async function handleExcelImport(file: File) {
    setNotice("Импортирую Excel...");
    try {
      const { state: importedState, result } = await importExcelReport(state, file, {
        date: importDate,
        mode: importMode
      });
      setState(importedState);
      setSelectedDate(importDate);
      setNotice(
        `Импорт: создано ${result.createdReports}, обновлено ${result.updatedReports} за ${importDate}.` +
          (result.skippedSheets.length ? ` Пропущены листы: ${result.skippedSheets.join(", ")}` : "")
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ошибка импорта Excel");
    }
  }

  function addProduct() {
    if (!newProduct.name.trim()) return;
    const id = nextUniqueId(state.products, slugify(newProduct.name));
    const product: Product = {
      id,
      name: newProduct.name.trim(),
      price: Number(newProduct.price) || 0,
      norm: Number(newProduct.norm) || 0,
      category: newProduct.category.trim() || "Напитки",
      active: true
    };
    setState((current) => ({
      ...current,
      products: [...current.products, product],
      reports: current.reports.map((report) => ({
        ...report,
        items: {
          ...report.items,
          [product.id]: { productId: product.id, incoming: 0, movement: 0, extraRequest: 0 }
        }
      }))
    }));
    setNewProduct({ name: "", price: 0, norm: 0, category: "Напитки" });
  }

  function updateProduct(productId: string, patch: Partial<Product>) {
    setState((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === productId ? { ...product, ...patch } : product))
    }));
  }

  function addDriver() {
    if (!newDriver.name.trim()) return;
    const id = nextUniqueId(state.drivers, slugify(newDriver.name));
    const driver: Driver = {
      id,
      name: newDriver.name.trim(),
      pointId: newDriver.pointId,
      active: true
    };
    setState((current) => ({ ...current, drivers: [...current.drivers, driver] }));
    setNewDriver({ name: "", pointId: selectedPointId });
    setNotice(`Водитель ${driver.name} добавлен.`);
  }

  function updateDriver(driverId: string, patch: Partial<Driver>) {
    setState((current) => ({
      ...current,
      drivers: current.drivers.map((driver) => (driver.id === driverId ? { ...driver, ...patch } : driver))
    }));
  }

  async function exportExcel(pointScope: ExportOptions["pointScope"] = "single") {
    setNotice("Готовлю Excel...");
    setPreparedDownload(null);
    try {
      const file = await createExcelReportFile(state, {
        ...exportOptions,
        scope: "day",
        pointScope,
        date: selectedDate,
        pointId: selectedPointId
      });
      setPreparedDownload({
        url: URL.createObjectURL(file.blob),
        fileName: file.fileName
      });
      setNotice("Excel готов. Нажмите «Скачать готовый Excel».");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Не удалось подготовить Excel");
    }
  }

  async function exportAdvanced() {
    setNotice("Готовлю Excel...");
    setPreparedDownload(null);
    try {
      const file = await createExcelReportFile(state, exportOptions);
      setPreparedDownload({
        url: URL.createObjectURL(file.blob),
        fileName: file.fileName
      });
      setNotice("Excel готов. Нажмите «Скачать готовый Excel».");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Не удалось подготовить Excel");
    }
  }

  const pointDrivers = state.drivers.filter((d) => d.pointId === selectedPointId);

  return (
    <main className="app-shell">
      {/* ─── TOPBAR ─── */}
      <header className="topbar">
        <div className="topbar-left">
          <p className="eyebrow">Ежедневный отчет</p>
          <h1>{selectedPoint?.name ?? "Точка"}</h1>
          <div className="topbar-date-row">
            <input
              type="date"
              className="date-input-inline"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setExportOptions((cur) => ({ ...cur, date: e.target.value, startDate: e.target.value, endDate: e.target.value }));
              }}
            />
            <span className={`status-badge ${currentReport.closed ? "locked" : "open"}`}>
              {currentReport.closed ? <Lock size={13} /> : <CheckCircle2 size={13} />}
              {currentReport.closed ? "Закрыт" : "Открыт"}
            </span>
            <span className="status-badge save-badge">
              <Save size={13} />
              {lastSaved ? lastSaved : "—"}
            </span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn-close-day" onClick={closeDay} disabled={currentReport.closed}>
            <Lock size={16} /> Закрыть день
          </button>
          {currentReport.closed && (
            <button className="btn-secondary" onClick={reopenDay}>
              Открыть
            </button>
          )}
        </div>
      </header>

      {/* ─── POINT RAIL ─── */}
      <section className="point-rail" aria-label="Точки">
        {pointSummaries.map(({ point, revenue: pointRevenue, cash }) => (
          <button key={point.id} className={point.id === selectedPointId ? "active" : ""} onClick={() => selectPoint(point.id)} type="button">
            <strong>{point.name}</strong>
            <span>{currency(pointRevenue)}</span>
            {cash.shortageOrPlus < 0 && <b className="shortage">{currency(cash.shortageOrPlus)}</b>}
          </button>
        ))}
      </section>

      {/* ─── QUICK METRICS ─── */}
      <section className="quick-total" aria-label="Итоги точки">
        <Metric label="Выручка" value={currency(revenue)} tone="green" icon="💰" />
        <Metric label="Водители" value={currency(cashTotal.productRevenue)} tone={revenueDiffOk ? "blue" : "red"} icon="🧾" />
        <Metric label="Заявка" value={requestTotal.toLocaleString("ru-RU")} tone="amber" icon="📋" />
        <Metric label="Сдали" value={currency(cashTotal.handedOver)} tone="blue" icon="💵" />
        <Metric label="Недостача" value={currency(cashTotal.shortageOrPlus)} tone={cashTotal.shortageOrPlus < 0 ? "red" : "green"} icon={cashTotal.shortageOrPlus < 0 ? "⚠️" : "✅"} />
      </section>

      {/* ─── NOTICE ─── */}
      {notice && (
        <div className="notice">
          <span>{notice}</span>
          {preparedDownload && (
            <a
              className="notice-download"
              href={preparedDownload.url}
              download={preparedDownload.fileName}
              onClick={() => setNotice("Excel скачивается.")}
            >
              Скачать готовый Excel
            </a>
          )}
          <button onClick={() => setNotice("")} aria-label="Закрыть уведомление">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── WARNINGS ─── */}
      {(missingCount > 0 || problemCount > 0 || warnWarningCount > 0) && (
        <section className={`soft-warning ${errorWarningCount > 0 ? "critical" : ""}`}>
          <AlertTriangle size={16} />
          <span>{missingCount > 0 ? `Не заполнено: ${missingCount}` : "Остатки заполнены"}</span>
          {errorWarningCount > 0 && <b className="warn-error">Ошибки: {errorWarningCount}</b>}
          {warnWarningCount > 0 && <b className="warn-soft">Проверить: {warnWarningCount}</b>}
        </section>
      )}

      {/* ─── TAB NAVIGATION ─── */}
      <nav className="tab-nav" aria-label="Разделы">
        <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>
          <Package size={16} /> <span>Товары</span>
          {(missingCount > 0 || problemCount > 0) && <span className="tab-badge">{missingCount + problemCount}</span>}
        </button>
        <button className={activeTab === "cash" ? "active" : ""} onClick={() => setActiveTab("cash")}>
          <WalletCards size={16} /> <span>Касса</span>
          {cashTotal.shortageOrPlus < 0 && <span className="tab-badge red">{visibleCashColumns.length}</span>}
        </button>
        <button className={activeTab === "transfers" ? "active" : ""} onClick={() => setActiveTab("transfers")}>
          <Truck size={16} /> <span>Перемещения</span>
          {state.transfers.filter((t) => t.date === selectedDate).length > 0 && (
            <span className="tab-badge blue">{state.transfers.filter((t) => t.date === selectedDate).length}</span>
          )}
        </button>
        <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>
          <BarChart3 size={16} /> <span>Статистика</span>
        </button>
        <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
          <Settings size={16} /> <span>Настройки</span>
        </button>
      </nav>

      {/* ════════════════════════════════
          TAB: ТОВАРЫ
      ════════════════════════════════ */}
      {activeTab === "products" && (
        <section className="work-card" id="products">
          <div className="section-head">
            <div>
              <h2>Товары</h2>
              <p>{filledCount}/{reportLines.length} заполнено</p>
            </div>
            <label className="search-box">
              <Search size={16} />
              <input placeholder="Поиск товара..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
          </div>

          <div className="product-table-wrap">
            <div className="product-table">
              <div className="product-table-head product-grid">
                <span>#</span>
                <span>Товар</span>
                <span>Было</span>
                <span>Приход</span>
                <span>Перем.</span>
                <span>Остаток</span>
                <span>Продажа</span>
                <span>Сумма</span>
                <span>Доп</span>
                <span>Тек.</span>
              </div>
            {filteredLines.map((line) => {
              const transferMovement = getTransferMovement(state, selectedDate, selectedPointId, line.product.id);
              const manualMovement = getManualMovement(line.product.id);
              const hasError = line.warnings.some((w) => w.severity === "error");
              const hasWarn = line.warnings.some((w) => w.severity === "warn");
              return (
                <article
                  className={`product-row product-grid ${hasError ? "has-error" : hasWarn ? "has-warning" : ""} ${typeof line.homeRest !== "number" ? "unfilled" : ""}`}
                  key={line.product.id}
                  title={line.warnings.map((w) => w.message).join(" · ")}
                >
                  <span className="col-num">{line.rowNumber}</span>
                  <div className="col-name">
                    <strong>{line.product.name}</strong>
                    {line.warnings.length > 0 && (
                      <span className="row-warning-hint">{line.warnings[0]?.message}</span>
                    )}
                  </div>
                  <span className="col-prev">{line.previousRest}</span>
                  <QuantityInput
                    ariaLabel="Приход"
                    value={line.incoming}
                    disabled={!canEditReport}
                    navGroup="incoming"
                    onChange={(value) => updateItem(line.product.id, { incoming: value ?? 0 })}
                  />
                  <QuantityInput
                    ariaLabel="Перемещение"
                    value={manualMovement + transferMovement}
                    disabled={!canEditReport}
                    className="col-movement"
                    min={null}
                    navGroup="movement"
                    onChange={(value) =>
                      updateItem(line.product.id, {
                        movement: (value ?? 0) - transferMovement
                      })
                    }
                    hint={
                      transferMovement !== 0 ? (
                        <span className="transfer-hint">авто {transferMovement > 0 ? "+" : ""}{transferMovement}</span>
                      ) : undefined
                    }
                  />
                  <QuantityInput
                    ariaLabel="Остаток дома"
                    value={line.homeRest}
                    placeholder="—"
                    disabled={!canEditReport}
                    optional
                    className="col-rest"
                    navGroup="home-rest"
                    onChange={(value) => updateItem(line.product.id, { homeRest: value })}
                  />
                  <span className={`col-sale sale-chip ${line.sale < 0 ? "bad" : ""}`}>{formatDecimal(line.sale)}</span>
                  <span className="col-amount">{currency(line.amount)}</span>
                  <QuantityInput
                    ariaLabel="Доп. заявка"
                    value={line.extraRequest}
                    disabled={!canEditReport}
                    navGroup="extra-request"
                    onChange={(value) => updateItem(line.product.id, { extraRequest: value ?? 0 })}
                  />
                  <QuantityInput
                    ariaLabel="Тек. остаток"
                    value={line.currentRest}
                    placeholder="—"
                    disabled={!canEditReport}
                    optional
                    navGroup="current-rest"
                    onChange={(value) => updateItem(line.product.id, { currentRest: value })}
                  />
                </article>
              );
            })}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════
          TAB: КАССА
      ════════════════════════════════ */}
      {activeTab === "cash" && (
        <section className="work-card cash-section" id="cash">
          <div className="section-head">
            <div>
              <h2>Касса водителей</h2>
              <p>Итог точки: <span className={cashTotal.shortageOrPlus < 0 ? "text-red" : "text-green"}>{currency(cashTotal.shortageOrPlus)}</span></p>
            </div>
            <WalletCards size={22} className="section-icon" />
          </div>

          {/* Вкладки водителей */}
          <div className="driver-tabs">
            {visibleCashColumns.map((cash) => {
              const columnKey = (cash.columnKey ?? "F") as CashColumnKey;
              return (
                <button
                  key={columnKey}
                  className={`driver-tab ${selectedCashColumn === columnKey ? "active" : ""} ${cash.shortageOrPlus < 0 ? "bad" : ""}`}
                  onClick={() => setSelectedCashColumn(columnKey)}
                  type="button"
                >
                  <span className="driver-tab-name">{cash.driverName || columnKey}</span>
                  <span className="driver-tab-rev">{currency(cash.productRevenue)}</span>
                  <span className={`driver-tab-bal ${cash.shortageOrPlus < 0 ? "bad" : "good"}`}>
                    {currency(cash.shortageOrPlus)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Редактор кассы */}
          <div className="cash-editor-card">
            <div className="cash-main-fields">
              <label>
                Водитель
                <input
                  value={selectedCash.driverName}
                  disabled={!canEditReport}
                  onChange={(e) => updateCash("driverName", e.target.value)}
                  placeholder="Имя водителя"
                  list="drivers-datalist"
                />
                <datalist id="drivers-datalist">
                  {pointDrivers.map((d) => (
                    <option key={d.id} value={d.name} />
                  ))}
                </datalist>
              </label>
              <label>
                Выручка (товары)
                <input
                  type="number"
                  inputMode="decimal"
                  value={num(selectedCash.productRevenue)}
                  disabled={!canEditReport}
                  onChange={(e) => updateCash("productRevenue", parseNumber(e.target.value))}
                />
              </label>
              <label>
                Сдал наличных
                <input
                  type="number"
                  inputMode="decimal"
                  value={num(selectedCash.handedOver)}
                  disabled={!canEditReport}
                  onChange={(e) => updateCash("handedOver", parseNumber(e.target.value))}
                />
              </label>
              <div className="cash-result-pills">
                <div className="result-pill">
                  <span>Должен сдать</span>
                  <strong>{currency(selectedCash.shouldHandOver)}</strong>
                </div>
                <div className={`result-pill ${selectedCash.shortageOrPlus < 0 ? "bad" : "good"}`}>
                  <span>Недостача / плюс</span>
                  <strong>{currency(selectedCash.shortageOrPlus)}</strong>
                </div>
                <div className={`result-pill ${revenueDiffOk ? "good" : "bad"}`}>
                  <span>Водители − товары</span>
                  <strong>{currency(revenueDiff)}</strong>
                </div>
              </div>
            </div>

            {/* Расходы и долги */}
            <details className="expenses-fold">
              <summary>
                <Receipt size={15} /> Расходы и долги
                <ChevronDown size={14} />
              </summary>
              <div className="cash-expense-grid">
                {cashFields.map(([field, label]) => (
                  <label key={field}>
                    {label}
                    <input
                      type="number"
                      inputMode="decimal"
                      value={num(Number(selectedCash[field]))}
                      disabled={!canEditReport}
                      onChange={(e) => updateCash(field, parseNumber(e.target.value))}
                    />
                  </label>
                ))}
              </div>

              {/* Кастомные расходы */}
              <div className="custom-expenses">
                <div className="custom-expenses-head">
                  <strong>Дополнительные расходы</strong>
                </div>
                {(selectedCashInput.customExpenses ?? []).map((expense) => (
                  <div className="custom-expense-row" key={expense.id}>
                    <span>{expense.label}</span>
                    <strong>{currency(expense.amount)}</strong>
                    {canEditReport && (
                      <button onClick={() => removeCustomExpense(expense.id)} aria-label="Удалить расход">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {canEditReport && (
                  <div className="custom-expense-form">
                    <input
                      placeholder="Название расхода"
                      value={newCustomExpense.label}
                      onChange={(e) => setNewCustomExpense((cur) => ({ ...cur, label: e.target.value }))}
                    />
                    <input
                      type="number"
                      placeholder="Сумма"
                      value={newCustomExpense.amount}
                      onChange={(e) => setNewCustomExpense((cur) => ({ ...cur, amount: e.target.value }))}
                    />
                    <button className="btn-add-expense" onClick={addCustomExpense}>
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>

              <label className="wide mt-8">
                Комментарий
                <textarea
                  value={selectedCash.comment}
                  disabled={!canEditReport}
                  onChange={(e) => updateCash("comment", e.target.value)}
                />
              </label>
            </details>
          </div>
        </section>
      )}

      {/* ════════════════════════════════
          TAB: ПЕРЕМЕЩЕНИЯ
      ════════════════════════════════ */}
      {activeTab === "transfers" && (
        <section className="work-card" id="transfers">
          <div className="section-head">
            <div>
              <h2>Перемещения</h2>
              <p>{state.transfers.filter((t) => t.date === selectedDate).length} за {selectedDate}</p>
            </div>
            <Truck size={22} />
          </div>

          <div className="transfer-form">
            <label>
              Откуда
              <select
                value={transferForm.fromPointId}
                disabled={!canEditReport}
                onChange={(e) => setTransferForm((cur) => ({ ...cur, fromPointId: e.target.value }))}
              >
                {state.points.filter((p) => p.active).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>
              Куда
              <select
                value={transferForm.toPointId}
                disabled={!canEditReport}
                onChange={(e) => setTransferForm((cur) => ({ ...cur, toPointId: e.target.value }))}
              >
                {state.points.filter((p) => p.active).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="wide">
              Товар
              <select
                value={transferForm.productId}
                disabled={!canEditReport}
                onChange={(e) => setTransferForm((cur) => ({ ...cur, productId: e.target.value }))}
              >
                {state.products.filter((p) => p.active).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>
              Количество
              <input
                type="text"
                inputMode="decimal"
                step="any"
                value={num(transferForm.quantity)}
                disabled={!canEditReport}
                onChange={(e) => setTransferForm((cur) => ({ ...cur, quantity: parseNumber(e.target.value) }))}
              />
            </label>
            <label>
              Комментарий
              <input
                value={transferForm.comment}
                disabled={!canEditReport}
                onChange={(e) => setTransferForm((cur) => ({ ...cur, comment: e.target.value }))}
              />
            </label>
          </div>
          <button className="btn-primary wide mt-10" onClick={addTransfer} disabled={!canEditReport}>
            <Plus size={18} /> Добавить перемещение
          </button>

          <div className="transfer-list">
            {state.transfers
              .filter((t) => t.date === selectedDate)
              .map((transfer) => {
                const from = state.points.find((p) => p.id === transfer.fromPointId)?.name ?? transfer.fromPointId;
                const to = state.points.find((p) => p.id === transfer.toPointId)?.name ?? transfer.toPointId;
                const product = state.products.find((p) => p.id === transfer.productId)?.name ?? transfer.productId;
                return (
                  <div className="transfer-row" key={transfer.id}>
                    <div className="transfer-info">
                      <strong>{product}</strong>
                      <span>{from} → {to} · кол-во: {transfer.quantity}</span>
                      {transfer.comment && <span className="comment">{transfer.comment}</span>}
                    </div>
                    <button onClick={() => removeTransfer(transfer.id)} aria-label="Удалить">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ════════════════════════════════
          TAB: СТАТИСТИКА
      ════════════════════════════════ */}
      {activeTab === "stats" && (
        <section className="work-card stats-section" id="stats">
          <div className="section-head">
            <div>
              <h2>Статистика</h2>
              <p>{selectedDate}</p>
            </div>
            <TrendingUp size={22} />
          </div>

          {/* Основные метрики */}
          <div className="stats-grid-4">
            <StatCard label="Выручка за день" value={currency(dashboard.daySales)} color="green" icon="💰" />
            <StatCard label="Выручка за месяц" value={currency(dashboard.monthSales)} color="blue" icon="📅" />
            <StatCard label="Расходы за день" value={currency(dashboard.expenses)} color="amber" icon="💸" />
            <StatCard label="Долги" value={currency(dashboard.debts)} color={dashboard.debts > 0 ? "red" : "green"} icon="🔗" />
          </div>

          {/* Выручка по точкам */}
          <div className="stats-section-block">
            <h3>Выручка по точкам</h3>
            <div className="stats-table">
              {dashboard.revenueByPoint.map((item) => (
                <div className="stats-row" key={item.pointId}>
                  <span>{item.name}</span>
                  <strong className="text-green">{currency(item.value)}</strong>
                </div>
              ))}
              <div className="stats-row total">
                <span>Итого</span>
                <strong>{currency(dashboard.daySales)}</strong>
              </div>
            </div>
          </div>

          {/* Топ товары */}
          {dashboard.topProducts.length > 0 && (
            <div className="stats-section-block">
              <h3>Топ-5 товаров</h3>
              <div className="stats-table">
                {dashboard.topProducts.map((item, idx) => (
                  <div className="stats-row" key={item.productId}>
                    <span><b className="rank">#{idx + 1}</b> {item.name}</span>
                    <div className="stats-row-right">
                      <span className="muted">{item.quantity} шт.</span>
                      <strong>{currency(item.revenue)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Недостачи */}
          {dashboard.shortages.length > 0 && (
            <div className="stats-section-block warning-block">
              <h3>⚠️ Недостачи</h3>
              <div className="stats-table">
                {dashboard.shortages.map((item, idx) => (
                  <div className="stats-row" key={idx}>
                    <span>{item.point} · {item.driver}</span>
                    <strong className="text-red">{currency(item.value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ниже нормы */}
          {dashboard.belowNorm.length > 0 && (
            <div className="stats-section-block">
              <h3>📉 Ниже нормы</h3>
              <div className="stats-table">
                {dashboard.belowNorm.map((item, idx) => (
                  <div className="stats-row" key={idx}>
                    <span>{item.product} <span className="muted">({item.point})</span></span>
                    <div className="stats-row-right">
                      <span className="muted">Остаток: {item.rest} / Норма: {item.norm}</span>
                      <strong className="text-amber">Заявка: {item.request}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Выручка по водителям */}
          {dashboard.revenueByDriver.length > 0 && (
            <div className="stats-section-block">
              <h3>Выручка по водителям</h3>
              <div className="stats-table">
                {dashboard.revenueByDriver.map((item) => (
                  <div className="stats-row" key={item.driverId}>
                    <span>{item.name}</span>
                    <strong>{currency(item.value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ════════════════════════════════
          TAB: НАСТРОЙКИ
      ════════════════════════════════ */}
      {activeTab === "settings" && (
        <section className="work-card settings-section" id="settings">
          <div className="section-head">
            <h2>Настройки</h2>
            <Settings size={22} />
          </div>

          <div className="settings-grid">
            {/* Точки */}
            <div className="settings-block">
              <h3>Точки</h3>
              <div className="inline-form">
                <input placeholder="Новая точка" value={newPointName} onChange={(e) => setNewPointName(e.target.value)} />
                <button className="btn-icon-add" onClick={addPoint} aria-label="Добавить точку">
                  <Plus size={18} />
                </button>
              </div>
              <div className="simple-list">
                {state.points.map((point) => (
                  <div className="settings-entity-row" key={point.id}>
                    {editingPointId === point.id ? (
                      <input
                        className="inline-edit"
                        defaultValue={point.name}
                        autoFocus
                        onBlur={(e) => {
                          if (e.target.value.trim()) updatePoint(point.id, { name: e.target.value.trim() });
                          setEditingPointId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          if (e.key === "Escape") setEditingPointId(null);
                        }}
                      />
                    ) : (
                      <button className="entity-name-btn" type="button" onClick={() => setEditingPointId(point.id)}>
                        {point.name}
                      </button>
                    )}
                    <div className="entity-actions">
                      <label className="toggle-small">
                        <input
                          type="checkbox"
                          checked={point.active}
                          onChange={(e) => updatePoint(point.id, { active: e.target.checked })}
                        />
                        Активна
                      </label>
                      <button className="btn-icon-danger" type="button" onClick={() => removePoint(point.id)} aria-label="Удалить точку">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Водители */}
            <div className="settings-block">
              <h3>Водители</h3>
              <div className="driver-add-form">
                <input
                  placeholder="Имя водителя"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver((cur) => ({ ...cur, name: e.target.value }))}
                />
                <select
                  value={newDriver.pointId}
                  onChange={(e) => setNewDriver((cur) => ({ ...cur, pointId: e.target.value }))}
                >
                  {state.points.filter((p) => p.active).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button className="btn-icon-add" onClick={addDriver} aria-label="Добавить водителя">
                  <UserPlus size={18} />
                </button>
              </div>
              <div className="simple-list">
                {state.drivers.map((driver) => {
                  const pointName = state.points.find((p) => p.id === driver.pointId)?.name ?? driver.pointId;
                  return (
                    <div className="driver-row" key={driver.id}>
                      <div className="driver-row-main">
                        {editingDriverId === driver.id ? (
                          <input
                            className="inline-edit"
                            defaultValue={driver.name}
                            autoFocus
                            onBlur={(e) => {
                              if (e.target.value.trim()) updateDriver(driver.id, { name: e.target.value.trim() });
                              setEditingDriverId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                              if (e.key === "Escape") setEditingDriverId(null);
                            }}
                          />
                        ) : (
                          <button className="entity-name-btn" type="button" onClick={() => setEditingDriverId(driver.id)}>
                            <strong>{driver.name}</strong>
                          </button>
                        )}
                        <span className="muted-text">{pointName}</span>
                      </div>
                      <div className="driver-row-actions">
                        <select
                          value={driver.pointId}
                          onChange={(e) => updateDriver(driver.id, { pointId: e.target.value })}
                        >
                          {state.points.filter((p) => p.active).map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <label className="toggle-small">
                          <input
                            type="checkbox"
                            checked={driver.active}
                            onChange={(e) => updateDriver(driver.id, { active: e.target.checked })}
                          />
                          Активен
                        </label>
                        <button className="btn-icon-danger" type="button" onClick={() => removeDriver(driver.id)} aria-label="Удалить водителя">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Товары */}
            <div className="settings-block wide">
              <h3>Товары</h3>
              <div className="product-add-form">
                <input
                  placeholder="Название"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((cur) => ({ ...cur, name: e.target.value }))}
                />
                <input
                  type="number"
                  placeholder="Цена"
                  value={newProduct.price || ""}
                  onChange={(e) => setNewProduct((cur) => ({ ...cur, price: parseNumber(e.target.value) }))}
                />
                <input
                  type="number"
                  placeholder="Норма"
                  value={newProduct.norm || ""}
                  onChange={(e) => setNewProduct((cur) => ({ ...cur, norm: parseNumber(e.target.value) }))}
                />
                <button className="btn-icon-add" onClick={addProduct} aria-label="Добавить товар">
                  <Plus size={18} />
                </button>
              </div>
              <div className="product-admin-list">
                {state.products.map((product) => (
                  <div className="admin-product" key={product.id}>
                    <input value={product.name} onChange={(e) => updateProduct(product.id, { name: e.target.value })} />
                    <input
                      type="number"
                      placeholder="Цена"
                      value={product.price}
                      onChange={(e) => updateProduct(product.id, { price: parseNumber(e.target.value) })}
                    />
                    <input
                      type="number"
                      placeholder="Норма"
                      value={product.norm}
                      onChange={(e) => updateProduct(product.id, { norm: parseNumber(e.target.value) })}
                    />
                    <label className="toggle-small">
                      <input
                        type="checkbox"
                        checked={product.active}
                        onChange={(e) => updateProduct(product.id, { active: e.target.checked })}
                      />
                      Актив.
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Импорт Excel */}
            <div className="settings-block wide import-block">
              <h3>Импорт Excel</h3>
              <p className="settings-hint">Загрузите файл отчёта — данные сохранятся в приложении по выбранной дате.</p>
              <div className="import-form">
                <label>
                  Дата отчёта
                  <input type="date" value={importDate} onChange={(e) => setImportDate(e.target.value)} />
                </label>
                <label>
                  Режим
                  <select value={importMode} onChange={(e) => setImportMode(e.target.value as ImportMode)}>
                    <option value="merge">Обновить существующие</option>
                    <option value="replace">Заменить полностью</option>
                  </select>
                </label>
                <label className="import-file-label">
                  Файл .xlsx
                  <input
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleExcelImport(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── BOTTOM ACTIONS (Excel) ─── */}
      <section className="bottom-actions excel-actions">
        <div className="excel-format-picker">
          <span>Формат Excel:</span>
          <select
            value={exportOptions.format}
            onChange={(e) => setExportOptions((cur) => ({ ...cur, format: e.target.value as ExportOptions["format"] }))}
          >
            <option value="template">1 — Классический шаблон</option>
            <option value="modern">2 — Новый чистый отчёт</option>
          </select>
        </div>
        <button className="btn-secondary" onClick={() => exportExcel("single")}>
          <FileSpreadsheet size={18} /> Excel точки
        </button>
        <button className="btn-primary" onClick={() => exportExcel("all")}>
          <FileSpreadsheet size={18} /> Excel все
        </button>
      </section>

      {/* ─── EXPORT PERIOD ─── */}
      <details className="fold export-more">
        <summary>
          <span>Экспорт за период</span>
          <ChevronDown size={16} />
        </summary>
        <div className="export-form">
          <label>
            Формат
            <select
              value={exportOptions.scope}
              onChange={(e) => setExportOptions((cur) => ({ ...cur, scope: e.target.value as ExportOptions["scope"] }))}
            >
              <option value="day">Отчет за день</option>
              <option value="period">Отчет за период</option>
            </select>
          </label>
          <label>
            С
            <input
              type="date"
              value={exportOptions.startDate}
              onChange={(e) => setExportOptions((cur) => ({ ...cur, startDate: e.target.value }))}
            />
          </label>
          <label>
            По
            <input
              type="date"
              value={exportOptions.endDate}
              onChange={(e) => setExportOptions((cur) => ({ ...cur, endDate: e.target.value }))}
            />
          </label>
          <label>
            Точки
            <select
              value={exportOptions.pointScope}
              onChange={(e) => setExportOptions((cur) => ({ ...cur, pointScope: e.target.value as ExportOptions["pointScope"] }))}
            >
              <option value="all">Все точки</option>
              <option value="single">Одна точка</option>
            </select>
          </label>
          <label>
            Формат Excel
            <select
              value={exportOptions.format}
              onChange={(e) => setExportOptions((cur) => ({ ...cur, format: e.target.value as ExportOptions["format"] }))}
            >
              <option value="template">1 — Классический шаблон</option>
              <option value="modern">2 — Новый чистый отчёт</option>
            </select>
          </label>
        </div>
        <button className="btn-secondary mt-10" onClick={exportAdvanced}>
          Скачать выбранный Excel
        </button>
      </details>
    </main>
  );
}

function Metric({ label, value, tone, icon }: { label: string; value: string; tone: "green" | "blue" | "amber" | "red"; icon: string }) {
  return (
    <div className={`metric ${tone}`}>
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: "green" | "blue" | "amber" | "red"; icon: string }) {
  return (
    <div className={`stat-card ${color}`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
      </div>
    </div>
  );
}
