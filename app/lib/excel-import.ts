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

  const date = options.date;
  if (!result.importedDates.includes(date)) result.importedDates.push(date);

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
