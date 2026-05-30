import {
  AppState,
  CashInput,
  CashColumnKey,
  CashResult,
  DailyReport,
  DashboardData,
  Product,
  ReportLine,
  ReportWarning
} from "./types";
import { getCarryoverRest } from "./carryover";
import { createEmptyReport, reportId } from "./seed";
import { CASH_COLUMN_KEYS } from "./template-data";
import { productSortNumber } from "./product-order";
import { money } from "./numbers";

export { money };

export function getActiveProducts(state: AppState, pointId?: string) {
  return state.products
    .filter((product) => product.active && (!pointId || !product.pointIds || product.pointIds.includes(pointId)))
    .sort((a, b) => productSortNumber(a, pointId) - productSortNumber(b, pointId));
}

export function getReport(state: AppState, date: string, pointId: string) {
  return state.reports.find((report) => report.id === reportId(date, pointId));
}

export function getReportOrVirtual(state: AppState, date: string, pointId: string) {
  const existing = getReport(state, date, pointId);
  if (existing) return existing;

  const driverId =
    state.drivers.find((driver) => driver.pointId === pointId && driver.active)?.id ??
    state.drivers.find((driver) => driver.active)?.id ??
    "";

  return createEmptyReport(date, pointId, driverId, state.products);
}

/** @deprecated Используйте getCarryoverRest */
export function getPreviousRest(state: AppState, date: string, pointId: string, product: Product) {
  return getCarryoverRest(state, date, pointId, product);
}

export function getTransferMovement(state: AppState, date: string, pointId: string, productId: string) {
  return state.transfers
    .filter((transfer) => transfer.date === date && transfer.productId === productId)
    .reduce((total, transfer) => {
      if (transfer.fromPointId === pointId) return total + transfer.quantity;
      if (transfer.toPointId === pointId) return total - transfer.quantity;
      return total;
    }, 0);
}

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? money(num) : 0;
}

function buildLineWarnings(input: {
  product: Product;
  previousRest: number;
  incoming: number;
  movement: number;
  homeRest?: number;
  available: number;
  sale: number;
}): ReportWarning[] {
  const warnings: ReportWarning[] = [];
  const { product, previousRest, incoming, movement, homeRest, available, sale } = input;
  const incomingLimit = Math.max(product.norm * 2.5, previousRest + product.norm, 30);

  if (typeof homeRest !== "number") {
    warnings.push({ code: "MISSING_HOME_REST", severity: "info", message: "Не заполнен остаток" });
  }

  if (typeof homeRest === "number") {
    if (homeRest < 0) warnings.push({ code: "NEGATIVE_HOME_REST", severity: "error", message: "Остаток меньше 0" });
    if (homeRest > previousRest + incoming + product.norm * 2) {
      warnings.push({ code: "HOME_REST_TOO_HIGH", severity: "warn", message: "Остаток подозрительно высокий" });
    }
  }

  if (sale < -0.001) warnings.push({ code: "NEGATIVE_SALE", severity: "error", message: "Продажа меньше 0" });
  if (available < -0.001) warnings.push({ code: "NEGATIVE_AVAILABLE", severity: "error", message: "Доступный остаток меньше 0" });
  if (incoming > incomingLimit) {
    warnings.push({ code: "INCOMING_TOO_HIGH", severity: "warn", message: "Приход слишком большой" });
  }
  if (movement > previousRest + incoming + product.norm) {
    warnings.push({ code: "MOVEMENT_TOO_HIGH", severity: "warn", message: "Перемещение больше доступного" });
  }
  if (typeof homeRest === "number" && sale > 0 && homeRest > product.norm * 1.5 && sale < product.norm * 0.1) {
    warnings.push({ code: "LOW_SALE_HIGH_REST", severity: "warn", message: "Мало продано при большом остатке" });
  }

  return warnings;
}

export function calculateReportLines(state: AppState, report: DailyReport): ReportLine[] {
  return getActiveProducts(state, report.pointId).map((product, index) => {
    const input = report.items[product.id] ?? { productId: product.id, incoming: 0 };
    const carryover = getCarryoverRest(state, report.date, report.pointId, product);
    const previousRest =
      typeof input.previousRest === "number" ? money(input.previousRest) : carryover;
    const incoming = safeNumber(input.incoming);
    const movement = safeNumber(input.movement) + getTransferMovement(state, report.date, report.pointId, product.id);
    const homeRest = typeof input.homeRest === "number" ? money(input.homeRest) : undefined;
    const extraRequest = safeNumber(input.extraRequest);
    const currentRest = typeof input.currentRest === "number" ? money(input.currentRest) : homeRest;
    const available = money(previousRest + incoming - movement);
    const sale = typeof homeRest === "number" ? money(available - homeRest) : 0;
    const amount = money(sale * product.price);
    const request = typeof homeRest === "number" ? Math.max(product.norm - homeRest, 0) : 0;
    const warnings = buildLineWarnings({ product, previousRest, incoming, movement, homeRest, available, sale });

    return {
      product,
      rowNumber: product.numbersByPoint?.[report.pointId] ?? index + 1,
      previousRest,
      incoming,
      movement,
      homeRest,
      sale,
      amount,
      request,
      extraRequest,
      currentRest,
      available,
      warnings
    };
  });
}

export function calculateReportRevenue(state: AppState, report: DailyReport) {
  return money(calculateReportLines(state, report).reduce((total, line) => total + line.amount, 0));
}

export function calculateCash(cash: CashInput, fallbackRevenue = 0): CashResult {
  const productRevenue = safeNumber(cash.productRevenue) || fallbackRevenue;
  const customTotal = (cash.customExpenses ?? []).reduce((sum, e) => sum + safeNumber(e.amount), 0);
  const shouldHandOver = money(
    productRevenue -
      safeNumber(cash.foodExpenses) -
      safeNumber(cash.discounts) -
      safeNumber(cash.fuel) -
      safeNumber(cash.kfc) -
      safeNumber(cash.forHome) -
      safeNumber(cash.carWash) -
      safeNumber(cash.tinting) -
      safeNumber(cash.otherExpenses) -
      customTotal -
      safeNumber(cash.clientTookDebt) +
      safeNumber(cash.clientReturnedDebt) -
      safeNumber(cash.weReturnedDebt) +
      safeNumber(cash.weOwe)
  );

  return {
    ...cash,
    productRevenue,
    shouldHandOver,
    shortageOrPlus: money(safeNumber(cash.handedOver) - shouldHandOver)
  };
}

export function calculateCashColumns(report: DailyReport) {
  return CASH_COLUMN_KEYS.map((columnKey) => calculateCash(report.cashColumns[columnKey] ?? emptyCashForColumn(columnKey)));
}

function emptyCashForColumn(columnKey: CashColumnKey): CashInput {
  return {
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

export function calculateCashTotal(report: DailyReport) {
  const columns = calculateCashColumns(report);
  return {
    productRevenue: money(columns.reduce((total, cash) => total + cash.productRevenue, 0)),
    shouldHandOver: money(columns.reduce((total, cash) => total + cash.shouldHandOver, 0)),
    handedOver: money(columns.reduce((total, cash) => total + cash.handedOver, 0)),
    shortageOrPlus: money(columns.reduce((total, cash) => total + cash.shortageOrPlus, 0))
  };
}

export function flattenWarnings(warnings: ReportWarning[]) {
  return warnings.map((w) => w.message);
}

export function getReportWarnings(state: AppState, report: DailyReport): ReportWarning[] {
  const lines = calculateReportLines(state, report);
  const productWarnings = lines.flatMap((line) =>
    line.warnings.map((warning) => ({
      ...warning,
      message: `${line.product.name}: ${warning.message}`
    }))
  );

  const cash = calculateCashTotal(report);
  const productRevenue = calculateReportRevenue(state, report);

  if (cash.shortageOrPlus < -0.01) {
    productWarnings.push({
      code: "CASH_SHORTAGE",
      severity: "warn",
      message: `Недостача по кассе: ${cash.shortageOrPlus.toLocaleString("ru-RU")} AED`
    });
  }

  const cashRevenue = money(cash.productRevenue);
  if ((cashRevenue > 0 || productRevenue > 0) && Math.abs(cashRevenue - productRevenue) > 0.01) {
    productWarnings.push({
      code: "REVENUE_MISMATCH",
      severity: "warn",
      message: `Выручка по кассе (${cashRevenue}) не совпадает с товарами (${productRevenue})`
    });
  }

  const filledLines = lines.filter((line) => typeof line.homeRest === "number").length;
  if (filledLines > 0 && filledLines < lines.length * 0.5) {
    productWarnings.push({
      code: "LOW_FILL_RATE",
      severity: "info",
      message: `Заполнено только ${filledLines} из ${lines.length} товаров`
    });
  }

  return productWarnings;
}

export function canCloseReport(state: AppState, report: DailyReport) {
  const allWarnings = getReportWarnings(state, report);
  const blockingWarnings = allWarnings.filter((warning) => warning.severity === "error");

  return {
    ok: blockingWarnings.length === 0,
    warnings: blockingWarnings.map((w) => w.message)
  };
}

export function countProblems(lines: ReportLine[]) {
  return lines.filter((line) => line.warnings.some((w) => w.severity !== "info")).length;
}

export function getDatesInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [startDate];
  }

  const cursor = new Date(start);
  while (cursor <= end && dates.length < 93) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function calculateDashboard(state: AppState, selectedDate: string): DashboardData {
  const month = selectedDate.slice(0, 7);
  const reportsWithRevenue = state.reports.map((report) => ({
    report,
    revenue: calculateReportRevenue(state, report),
    cash: calculateCashTotal(report)
  }));

  const dayReports = reportsWithRevenue.filter(({ report }) => report.date === selectedDate);
  const monthReports = reportsWithRevenue.filter(({ report }) => report.date.startsWith(month));
  const revenueByPoint = state.points
    .filter((point) => point.active)
    .map((point) => ({
      pointId: point.id,
      name: point.name,
      value: money(dayReports.filter(({ report }) => report.pointId === point.id).reduce((total, item) => total + item.revenue, 0))
    }));

  const driverRevenue = new Map<string, { driverId: string; name: string; value: number }>();
  for (const { report } of dayReports) {
    for (const cash of calculateCashColumns(report)) {
      if (!cash.driverName && !cash.productRevenue) continue;
      const key = cash.driverName || cash.columnKey || "cash";
      const current = driverRevenue.get(key) ?? { driverId: key, name: cash.driverName || key, value: 0 };
      current.value = money(current.value + cash.productRevenue);
      driverRevenue.set(key, current);
    }
  }
  const revenueByDriver = Array.from(driverRevenue.values()).filter((driver) => driver.value > 0);

  const productMap = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>();
  for (const { report } of dayReports) {
    for (const line of calculateReportLines(state, report)) {
      const current = productMap.get(line.product.id) ?? {
        productId: line.product.id,
        name: line.product.name,
        quantity: 0,
        revenue: 0
      };
      current.quantity += line.sale;
      current.revenue = money(current.revenue + line.amount);
      productMap.set(line.product.id, current);
    }
  }

  const belowNorm = dayReports.flatMap(({ report }) => {
    const point = state.points.find((item) => item.id === report.pointId)?.name ?? report.pointId;
    return calculateReportLines(state, report)
      .filter((line) => typeof line.homeRest === "number" && line.homeRest < line.product.norm)
      .map((line) => ({
        point,
        product: line.product.name,
        rest: line.homeRest ?? 0,
        norm: line.product.norm,
        request: line.request
      }));
  });

  const shortages = dayReports
    .flatMap(({ report }) =>
      calculateCashColumns(report)
        .filter((cash) => cash.shortageOrPlus < 0)
        .map((cash) => ({
          point: state.points.find((point) => point.id === report.pointId)?.name ?? report.pointId,
          driver: cash.driverName || cash.columnKey || report.driverId,
          value: cash.shortageOrPlus
        }))
    );

  const expenses = money(
    dayReports.reduce(
      (total, { report }) =>
        total +
        calculateCashColumns(report).reduce(
          (sum, cash) =>
            sum +
            cash.foodExpenses +
            cash.fuel +
            cash.kfc +
            cash.forHome +
            cash.carWash +
            cash.tinting +
            cash.otherExpenses +
            (cash.customExpenses ?? []).reduce((eSum, e) => eSum + safeNumber(e.amount), 0),
          0
        ),
      0
    )
  );

  const debts = money(
    dayReports.reduce(
      (total, { report }) =>
        total +
        calculateCashColumns(report).reduce(
          (sum, cash) => sum + cash.weOwe + cash.clientTookDebt - cash.weReturnedDebt - cash.clientReturnedDebt,
          0
        ),
      0
    )
  );

  return {
    daySales: money(dayReports.reduce((total, item) => total + item.revenue, 0)),
    monthSales: money(monthReports.reduce((total, item) => total + item.revenue, 0)),
    revenueByPoint,
    revenueByDriver,
    topProducts: Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    belowNorm: belowNorm.slice(0, 10),
    shortages,
    expenses,
    debts,
    totalHandedOver: money(
      dayReports.reduce(
        (total, { report }) =>
          total + CASH_COLUMN_KEYS.reduce((sum, columnKey) => sum + (report.cashColumns[columnKey]?.handedOver ?? 0), 0),
        0
      )
    ),
    totalShortage: money(
      dayReports.reduce(
        (total, { report }) =>
          total + calculateCashColumns(report).reduce((sum, cash) => sum + cash.shortageOrPlus, 0),
        0
      )
    )
  };
}
