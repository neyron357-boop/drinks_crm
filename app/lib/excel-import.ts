import type { Workbook, Worksheet } from "exceljs";
import { getTransferMovement } from "./calculations";
import {
  cellNumber,
  cellText,
  detectCashLayoutFromSheet,
  readCustomExpensesFromSheet,
  resolvePointWorksheet
} from "./excel-template-layout";
import { createEmptyReport, reportId } from "./seed";
import { getTemplatePoint, TEMPLATE_POINTS } from "./template-data";
import type { AppState, CashColumnKey, CashInput, DailyReport, ImportMode, ImportResult } from "./types";

const MONTH_NAMES: Record<string, number> = {
  january: 1,
  jan: 1,
  январь: 1,
  января: 1,
  февраль: 2,
  февраля: 2,
  february: 2,
  feb: 2,
  март: 3,
  марта: 3,
  march: 3,
  mar: 3,
  апрель: 4,
  апреля: 4,
  april: 4,
  apr: 4,
  май: 5,
  мая: 5,
  may: 5,
  июнь: 6,
  июня: 6,
  june: 6,
  jun: 6,
  июль: 7,
  июля: 7,
  july: 7,
  jul: 7,
  август: 8,
  августа: 8,
  august: 8,
  aug: 8,
  сентябрь: 9,
  сентября: 9,
  september: 9,
  sep: 9,
  sept: 9,
  октябрь: 10,
  октября: 10,
  october: 10,
  oct: 10,
  ноябрь: 11,
  ноября: 11,
  november: 11,
  nov: 11,
  декабрь: 12,
  декабря: 12,
  december: 12,
  dec: 12
};

function isoDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function inferReportDateFromFileName(fileName: string, fallbackDate: string) {
  const normalized = normalizeFileName(fileName);
  const fallbackYear = Number(fallbackDate.slice(0, 4)) || new Date().getFullYear();

  const yearFirst = normalized.match(/\b(19\d{2}|20\d{2})\s+(\d{1,2})\s+(\d{1,2})\b/);
  if (yearFirst) {
    const [, year, month, day] = yearFirst;
    const parsed = isoDate(Number(year), Number(month), Number(day));
    if (parsed) return parsed;
  }

  const dayFirst = normalized.match(/\b(\d{1,2})\s+(\d{1,2})\s+(19\d{2}|20\d{2})\b/);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    const parsed = isoDate(Number(year), Number(month), Number(day));
    if (parsed) return parsed;
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const explicitYear = tokens.map(Number).find((value) => value >= 1900 && value <= 2099) ?? fallbackYear;

  for (let index = 0; index < tokens.length; index += 1) {
    const month = MONTH_NAMES[tokens[index]];
    if (!month) continue;

    const adjacent = [tokens[index + 1], tokens[index - 1], ...tokens].filter(Boolean);
    const day = adjacent.map(Number).find((value) => value >= 1 && value <= 31);
    if (!day) continue;

    const parsed = isoDate(explicitYear, month, day);
    if (parsed) return parsed;
  }

  return null;
}

function readCashColumn(
  worksheet: Worksheet,
  columnKey: CashColumnKey,
  layout: ReturnType<typeof detectCashLayoutFromSheet>
): CashInput {
  const customExpenses = readCustomExpensesFromSheet(worksheet, layout, columnKey);

  return {
    columnKey,
    driverName: cellText(worksheet.getCell(`${columnKey}${layout.driverName}`).value),
    productRevenue: cellNumber(worksheet.getCell(`${columnKey}${layout.productRevenue}`).value) ?? 0,
    foodExpenses: cellNumber(worksheet.getCell(`${columnKey}${layout.foodExpenses}`).value) ?? 0,
    weReturnedDebt: cellNumber(worksheet.getCell(`${columnKey}${layout.weReturnedDebt}`).value) ?? 0,
    weOwe: cellNumber(worksheet.getCell(`${columnKey}${layout.weOwe}`).value) ?? 0,
    clientReturnedDebt: cellNumber(worksheet.getCell(`${columnKey}${layout.clientReturnedDebt}`).value) ?? 0,
    clientTookDebt: cellNumber(worksheet.getCell(`${columnKey}${layout.clientTookDebt}`).value) ?? 0,
    discounts: cellNumber(worksheet.getCell(`${columnKey}${layout.discounts}`).value) ?? 0,
    fuel: cellNumber(worksheet.getCell(`${columnKey}${layout.fuel}`).value) ?? 0,
    kfc: cellNumber(worksheet.getCell(`${columnKey}${layout.kfc}`).value) ?? 0,
    forHome: cellNumber(worksheet.getCell(`${columnKey}${layout.forHome}`).value) ?? 0,
    carWash: cellNumber(worksheet.getCell(`${columnKey}${layout.carWash}`).value) ?? 0,
    tinting: cellNumber(worksheet.getCell(`${columnKey}${layout.tinting}`).value) ?? 0,
    otherExpenses: cellNumber(worksheet.getCell(`${columnKey}${layout.otherExpenses}`).value) ?? 0,
    handedOver: cellNumber(worksheet.getCell(`${columnKey}${layout.handedOver}`).value) ?? 0,
    comment: "",
    customExpenses
  };
}

function sheetHasProductData(worksheet: Worksheet, pointId: string, products: AppState["products"]) {
  return products.some((product) => {
    const excelRow = product.excelRowsByPoint?.[pointId];
    if (!excelRow) return false;
    const incoming = cellNumber(worksheet.getCell(`F${excelRow}`).value);
    const homeRest = cellNumber(worksheet.getCell(`H${excelRow}`).value);
    const previousRest = cellNumber(worksheet.getCell(`E${excelRow}`).value);
    return incoming !== undefined || homeRest !== undefined || previousRest !== undefined;
  });
}

function importPointSheet(
  state: AppState,
  workbook: Workbook,
  pointId: string,
  date: string,
  mode: ImportMode
): { report: DailyReport | null; created: boolean; updated: boolean; reason?: string } {
  const templatePoint = getTemplatePoint(pointId);
  if (!templatePoint) return { report: null, created: false, updated: false, reason: "no-template" };

  const worksheet = resolvePointWorksheet(workbook, templatePoint);
  if (!worksheet) return { report: null, created: false, updated: false, reason: "sheet-missing" };

  const id = reportId(date, pointId);
  const existing = state.reports.find((report) => report.id === id);
  const driverId =
    state.drivers.find((driver) => driver.pointId === pointId && driver.active)?.id ??
    state.drivers.find((driver) => driver.active)?.id ??
    "";

  const base = mode === "replace" || !existing ? createEmptyReport(date, pointId, driverId, state.products) : structuredClone(existing);
  const layout = detectCashLayoutFromSheet(worksheet, templatePoint.cashRows);
  let importedProducts = 0;

  for (const product of state.products) {
    const excelRow = product.excelRowsByPoint?.[pointId];
    if (!excelRow) continue;

    const incoming = cellNumber(worksheet.getCell(`F${excelRow}`).value) ?? 0;
    const movementTotal = cellNumber(worksheet.getCell(`G${excelRow}`).value) ?? 0;
    const homeRest = cellNumber(worksheet.getCell(`H${excelRow}`).value);
    const extraRequest = cellNumber(worksheet.getCell(`L${excelRow}`).value) ?? 0;
    const currentRest = cellNumber(worksheet.getCell(`M${excelRow}`).value);
    const previousRest = cellNumber(worksheet.getCell(`E${excelRow}`).value);
    const transferMovement = getTransferMovement(state, date, pointId, product.id);

    if (
      incoming !== 0 ||
      movementTotal !== 0 ||
      homeRest !== undefined ||
      extraRequest !== 0 ||
      currentRest !== undefined ||
      previousRest !== undefined
    ) {
      importedProducts += 1;
    }

    base.items[product.id] = {
      productId: product.id,
      previousRest,
      incoming,
      movement: movementTotal - transferMovement,
      homeRest,
      extraRequest,
      currentRest: currentRest ?? homeRest
    };
  }

  for (const columnKey of ["E", "F", "G", "H", "I", "J", "K"] as CashColumnKey[]) {
    const cash = readCashColumn(worksheet, columnKey, layout);
    const hasValues =
      cash.driverName ||
      cash.productRevenue ||
      cash.handedOver ||
      cash.foodExpenses ||
      cash.otherExpenses ||
      (cash.customExpenses?.length ?? 0) > 0;
    if (hasValues) base.cashColumns[columnKey] = cash;
  }

  if (importedProducts === 0 && !sheetHasProductData(worksheet, pointId, state.products)) {
    return { report: null, created: false, updated: false, reason: "empty-sheet" };
  }

  return {
    report: base,
    created: !existing,
    updated: Boolean(existing)
  };
}

export async function importExcelReport(
  state: AppState,
  file: File,
  options: { date: string; mode: ImportMode }
): Promise<{ state: AppState; result: ImportResult }> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  let nextState = structuredClone(state);
  const result: ImportResult = {
    importedDates: [],
    updatedReports: 0,
    createdReports: 0,
    skippedSheets: [],
    warnings: []
  };

  const inferredDate = inferReportDateFromFileName(file.name, options.date);
  const date = inferredDate ?? options.date;
  if (!result.importedDates.includes(date)) result.importedDates.push(date);
  if (inferredDate && inferredDate !== options.date) {
    result.warnings.push(`Дата импорта взята из имени файла: ${date}`);
  }

  for (const templatePoint of TEMPLATE_POINTS) {
    const pointExists = nextState.points.some((point) => point.id === templatePoint.id && point.active);
    if (!pointExists) continue;

    if (!resolvePointWorksheet(workbook, templatePoint)) {
      result.skippedSheets.push(templatePoint.sheetName);
      continue;
    }

    const imported = importPointSheet(nextState, workbook, templatePoint.id, date, options.mode);
    if (!imported.report) {
      if (imported.reason === "empty-sheet") continue;
      result.skippedSheets.push(templatePoint.sheetName);
      continue;
    }

    const id = imported.report.id;
    const exists = nextState.reports.some((report) => report.id === id);
    nextState = {
      ...nextState,
      reports: exists
        ? nextState.reports.map((report) => (report.id === id ? imported.report! : report))
        : [...nextState.reports, imported.report!]
    };

    if (imported.created) result.createdReports += 1;
    if (imported.updated) result.updatedReports += 1;
  }

  if (result.createdReports === 0 && result.updatedReports === 0) {
    result.warnings.push("Не найдено данных для импорта. Проверьте листы (JVC, Tikom...) и дату.");
  }

  return { state: nextState, result };
}
