import type { AppState, DailyReport, Product } from "./types";
import { money } from "./numbers";
import { createEmptyReport, reportId } from "./seed";

function itemRest(report: DailyReport, productId: string) {
  const item = report.items[productId];
  if (!item) return undefined;
  if (typeof item.homeRest === "number" && Number.isFinite(item.homeRest)) return money(item.homeRest);
  if (typeof item.currentRest === "number" && Number.isFinite(item.currentRest)) return money(item.currentRest);
  return undefined;
}

/** Остаток с прошлого дня: закрытый отчет → импортированный отчет → норма. */
export function getCarryoverRest(state: AppState, date: string, pointId: string, product: Product): number {
  const priorClosedReports = state.reports
    .filter((report) => report.pointId === pointId && report.date < date && report.closed)
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const report of priorClosedReports) {
    const rest = itemRest(report, product.id);
    if (typeof rest === "number") return rest;
  }

  // Fallback keeps imported/open legacy data usable, but closed reports remain canonical.
  const priorAnyReports = state.reports
    .filter((report) => report.pointId === pointId && report.date < date)
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const report of priorAnyReports) {
    const rest = itemRest(report, product.id);
    if (typeof rest === "number") return rest;
  }

  return money(product.norm);
}

function addDays(date: string, days: number) {
  const cursor = new Date(`${date}T12:00:00`);
  cursor.setDate(cursor.getDate() + days);
  return cursor.toISOString().slice(0, 10);
}

/** После закрытия дня подготавливает отчёт следующего дня (без устаревшего previousRest в items). */
export function applyCarryoverAfterClose(state: AppState, closedReport: DailyReport): AppState {
  const nextDate = addDays(closedReport.date, 1);
  const nextId = reportId(nextDate, closedReport.pointId);
  const existing = state.reports.find((report) => report.id === nextId);

  if (existing?.closed) return state;

  const driverId =
    state.drivers.find((driver) => driver.pointId === closedReport.pointId && driver.active)?.id ??
    closedReport.driverId;

  const base = existing ?? createEmptyReport(nextDate, closedReport.pointId, driverId, state.products);

  const nextItems = { ...base.items };
  for (const product of state.products) {
    if (product.pointIds && !product.pointIds.includes(closedReport.pointId)) continue;
    const carry = itemRest(closedReport, product.id) ?? getCarryoverRest(state, nextDate, closedReport.pointId, product);
    const prev = nextItems[product.id];
    nextItems[product.id] = {
      productId: product.id,
      incoming: prev?.incoming ?? 0,
      movement: prev?.movement ?? 0,
      homeRest: prev?.homeRest,
      extraRequest: prev?.extraRequest ?? 0,
      currentRest: prev?.currentRest,
      previousRest: carry
    };
  }

  const nextReport: DailyReport = {
    ...base,
    items: nextItems,
    cashColumns: base.cashColumns ?? closedReport.cashColumns,
    closed: false,
    closedAt: undefined
  };

  const reports = state.reports.some((report) => report.id === nextId)
    ? state.reports.map((report) => (report.id === nextId ? nextReport : report))
    : [...state.reports, nextReport];

  return { ...state, reports };
}
