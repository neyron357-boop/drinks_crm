import type { Workbook, Worksheet } from "exceljs";
import {
  calculateCash,
  calculateReportLines,
  calculateReportRevenue,
  getDatesInRange,
  getReportOrVirtual,
  money
} from "./calculations";
import { CASH_COLUMN_KEYS, getTemplatePoint, TEMPLATE_FILE_URL, TEMPLATE_POINTS } from "./template-data";
import {
  CASH_LABEL_COLUMN,
  clearCustomExpenseBlock,
  customExpenseFormulaParts,
  insertCustomExpenseRows,
  writeCustomExpenseBlock
} from "./excel-template-layout";
import { downloadBlob, type DownloadFile } from "./download";
import type { AppState, CashColumnKey, CashInput, ExportOptions, Product, ReportLine } from "./types";

const MAX_CUSTOM_EXPENSE_ROWS = 12;
const TEMPLATE_NUMBER_FORMAT = "0.##";

function cellValue(value: number | string | undefined) {
  if (value === undefined || value === "" || Number.isNaN(value)) return null;
  return value;
}

function getLineByProduct(lines: ReportLine[], product: Product) {
  return lines.find((line) => line.product.id === product.id);
}

function formulaWithResult(formula: string, result: number) {
  return { formula, result: money(result) };
}

function setProductRows(workbook: Workbook, state: AppState, pointId: string, date: string) {
  const templatePoint = getTemplatePoint(pointId);
  if (!templatePoint) return;

  const worksheet = workbook.getWorksheet(templatePoint.sheetName);
  if (!worksheet) return;

  const report = getReportOrVirtual(state, date, pointId);
  const lines = calculateReportLines(state, report);
  worksheet.getCell("A1").value = templatePoint.excelTitle;

  for (const product of state.products) {
    const row = product.excelRowsByPoint?.[pointId];
    if (!row) continue;

    const line = getLineByProduct(lines, product);
    const item = report.items[product.id];
    const previousRest = line?.previousRest ?? item?.previousRest ?? 0;
    const incoming = line?.incoming ?? item?.incoming ?? 0;
    const movement = line?.movement ?? item?.movement ?? 0;
    const homeRest = line?.homeRest;
    const sale = line?.sale ?? 0;
    const amount = line?.amount ?? 0;
    const request = line?.request ?? 0;
    const extraRequest = line?.extraRequest ?? item?.extraRequest ?? 0;
    const currentRest = line?.currentRest ?? homeRest;

    worksheet.getCell(`A${row}`).value = product.numbersByPoint?.[pointId] ?? worksheet.getCell(`A${row}`).value;
    worksheet.getCell(`B${row}`).value = product.name;
    worksheet.getCell(`C${row}`).value = product.price;
    worksheet.getCell(`D${row}`).value = product.norm;
    worksheet.getCell(`E${row}`).value = cellValue(previousRest);
    worksheet.getCell(`F${row}`).value = cellValue(incoming);
    worksheet.getCell(`G${row}`).value = cellValue(movement);
    worksheet.getCell(`H${row}`).value = homeRest === undefined ? null : homeRest;
    // Продажа = было + приход - перемещение - остаток дома
    worksheet.getCell(`I${row}`).value = formulaWithResult(`E${row}+F${row}-G${row}-H${row}`, sale);
    // Сумма = цена × продажа
    worksheet.getCell(`J${row}`).value = formulaWithResult(`C${row}*I${row}`, amount);
    // Заявка = max(норма - остаток дома, 0)
    worksheet.getCell(`K${row}`).value = formulaWithResult(`MAX(D${row}-H${row},0)`, request);
    // Доп заявка
    worksheet.getCell(`L${row}`).value = cellValue(extraRequest);
    // Текущий остаток
    worksheet.getCell(`M${row}`).value = currentRest === undefined ? null : currentRest;
  }

  worksheet.getCell(`J${templatePoint.totalRow}`).value = formulaWithResult(
    `SUM(J${templatePoint.productStartRow}:J${templatePoint.productEndRow})`,
    calculateReportRevenue(state, report)
  );
}

function setCashCell(worksheet: Worksheet, columnKey: CashColumnKey, row: number, value: number | string | undefined) {
  worksheet.getCell(`${columnKey}${row}`).value = cellValue(value);
}

function setMoneyStyle(worksheet: Worksheet, cellRef: string, bold = false) {
  const cell = worksheet.getCell(cellRef);
  cell.numFmt = TEMPLATE_NUMBER_FORMAT;
  cell.font = { name: "Calibri", size: 16, bold };
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
}

function polishTemplateWorksheet(
  worksheet: Worksheet,
  templatePoint: NonNullable<ReturnType<typeof getTemplatePoint>>,
  layout: ReturnType<typeof insertCustomExpenseRows>
) {
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 2,
      topLeftCell: "A3",
      showGridLines: false,
      zoomScale: 100,
      zoomScaleNormal: 100
    }
  ];

  worksheet.pageSetup = {
    ...worksheet.pageSetup,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.25, right: 0.25, top: 0.35, bottom: 0.35, header: 0.15, footer: 0.15 }
  };

  const widths = [11.5, 50.5, 13.5, 14.5, 26, 24, 23, 24, 21, 21, 21, 24, 23];
  widths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = Math.max(worksheet.getColumn(index + 1).width ?? 0, width);
  });

  const productStartRow = Number(templatePoint.productStartRow);
  const totalRow = Number(templatePoint.totalRow);
  for (let rowNumber = productStartRow; rowNumber <= totalRow; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    row.height = rowNumber === totalRow ? Math.max(row.height ?? 0, 22) : 21;
    for (let col = 1; col <= 13; col++) {
      const cell = row.getCell(col);
      cell.font = { name: "Calibri", size: 16, bold: rowNumber === totalRow || col === 2 };
      cell.alignment = { vertical: "middle", horizontal: col === 2 ? "left" : "center", wrapText: true };
      if (col >= 3) cell.numFmt = TEMPLATE_NUMBER_FORMAT;
    }
  }

  for (let rowNumber = layout.driverName; rowNumber <= layout.totalHandedOver; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    row.height = Math.max(row.height ?? 0, rowNumber === layout.driverName ? 48 : 21);
    for (let col = 3; col <= 12; col++) {
      const cell = row.getCell(col);
      const isImportantCashRow =
        rowNumber === layout.driverName || rowNumber === layout.productRevenue || rowNumber >= layout.handedOver;
      cell.font = { name: "Calibri", size: rowNumber >= layout.totalSales ? 20 : 16, bold: isImportantCashRow };
      cell.alignment = { vertical: "middle", horizontal: col <= 4 ? "left" : "center", wrapText: true };
      if (col >= 5) cell.numFmt = TEMPLATE_NUMBER_FORMAT;
    }
  }

  for (const columnKey of CASH_COLUMN_KEYS) {
    setMoneyStyle(worksheet, `${columnKey}${layout.productRevenue}`);
    setMoneyStyle(worksheet, `${columnKey}${layout.handedOver}`);
    setMoneyStyle(worksheet, `${columnKey}${layout.shouldHandOver}`, true);
    setMoneyStyle(worksheet, `${columnKey}${layout.shortageOrPlus}`, true);
  }
  setMoneyStyle(worksheet, `L${layout.productRevenue}`, true);
  setMoneyStyle(worksheet, `K${layout.totalShortage}`, true);
  setMoneyStyle(worksheet, `G${layout.totalSales}`, true);
  setMoneyStyle(worksheet, `G${layout.totalHandedOver}`, true);
}

/**
 * Формула "Должен сдать":
 * Выручка - расходы (питание, скидки, бензин, KFC, дом, мойка, тонировка, другие)
 * - клиент взял в долг + клиент вернул долг
 * - мы вернули долг + мы должны (нам дали)
 *
 * ВАЖНО: maybeBlankExpenseRow убран — он ссылался на несуществующую строку.
 */
function shouldHandOverFormula(columnKey: CashColumnKey, layout: ReturnType<typeof insertCustomExpenseRows>, customCount: number) {
  const customParts = customExpenseFormulaParts(layout, columnKey, customCount);

  return (
    `${columnKey}${layout.productRevenue}` +
    `-${columnKey}${layout.foodExpenses}` +
    `-${columnKey}${layout.weReturnedDebt}` +
    `+${columnKey}${layout.weOwe}` +
    `+${columnKey}${layout.clientReturnedDebt}` +
    `-${columnKey}${layout.clientTookDebt}` +
    `-${columnKey}${layout.discounts}` +
    `-${columnKey}${layout.fuel}` +
    `-${columnKey}${layout.kfc}` +
    `-${columnKey}${layout.forHome}` +
    `-${columnKey}${layout.carWash}` +
    `-${columnKey}${layout.tinting}` +
    `-${columnKey}${layout.otherExpenses}` +
    customParts
  );
}

function setCashRows(workbook: Workbook, state: AppState, pointId: string, date: string) {
  const templatePoint = getTemplatePoint(pointId);
  if (!templatePoint) return;

  const worksheet = workbook.getWorksheet(templatePoint.sheetName);
  if (!worksheet) return;

  const report = getReportOrVirtual(state, date, pointId);
  const baseRows = templatePoint.cashRows;
  const reportTotal = calculateReportRevenue(state, report);

  const maxCustomCount = Math.min(
    MAX_CUSTOM_EXPENSE_ROWS,
    Math.max(
      0,
      ...CASH_COLUMN_KEYS.map((columnKey) => report.cashColumns[columnKey]?.customExpenses?.length ?? 0)
    )
  );

  const layout = insertCustomExpenseRows(worksheet, baseRows, maxCustomCount);
  clearCustomExpenseBlock(worksheet, layout);

  for (const columnKey of CASH_COLUMN_KEYS) {
    const cash = report.cashColumns[columnKey] as CashInput | undefined;
    const result = calculateCash(cash ?? emptyCash(columnKey), 0);
    const customCount = cash?.customExpenses?.length ?? 0;

    setCashCell(worksheet, columnKey, layout.driverName, cash?.driverName ?? "");
    setCashCell(worksheet, columnKey, layout.productRevenue, cash?.productRevenue ?? 0);
    setCashCell(worksheet, columnKey, layout.foodExpenses, cash?.foodExpenses ?? 0);
    setCashCell(worksheet, columnKey, layout.weReturnedDebt, cash?.weReturnedDebt ?? 0);
    setCashCell(worksheet, columnKey, layout.weOwe, cash?.weOwe ?? 0);
    setCashCell(worksheet, columnKey, layout.clientReturnedDebt, cash?.clientReturnedDebt ?? 0);
    setCashCell(worksheet, columnKey, layout.clientTookDebt, cash?.clientTookDebt ?? 0);
    setCashCell(worksheet, columnKey, layout.discounts, cash?.discounts ?? 0);
    setCashCell(worksheet, columnKey, layout.fuel, cash?.fuel ?? 0);
    setCashCell(worksheet, columnKey, layout.kfc, cash?.kfc ?? 0);
    setCashCell(worksheet, columnKey, layout.forHome, cash?.forHome ?? 0);
    setCashCell(worksheet, columnKey, layout.carWash, cash?.carWash ?? 0);
    setCashCell(worksheet, columnKey, layout.tinting, cash?.tinting ?? 0);
    setCashCell(worksheet, columnKey, layout.otherExpenses, cash?.otherExpenses ?? 0);
    writeCustomExpenseBlock(worksheet, layout, columnKey, cash?.customExpenses);
    setCashCell(worksheet, columnKey, layout.handedOver, cash?.handedOver ?? 0);

    worksheet.getCell(`${columnKey}${layout.shouldHandOver}`).value = formulaWithResult(
      shouldHandOverFormula(columnKey, layout, customCount),
      result.shouldHandOver
    );
    worksheet.getCell(`${columnKey}${layout.shortageOrPlus}`).value = formulaWithResult(
      `${columnKey}${layout.handedOver}-${columnKey}${layout.shouldHandOver}`,
      result.shortageOrPlus
    );
  }

  // Сверка: сумма выручки водителей − итог продаж по товарам
  worksheet.getCell(`L${layout.productRevenue}`).value = {
    formula: `(E${layout.productRevenue}+F${layout.productRevenue}+G${layout.productRevenue}+H${layout.productRevenue}+I${layout.productRevenue}+J${layout.productRevenue}+K${layout.productRevenue})-J${templatePoint.totalRow}`,
    result: money(CASH_COLUMN_KEYS.reduce((total, columnKey) => total + (report.cashColumns[columnKey]?.productRevenue ?? 0), 0) - reportTotal)
  };

  worksheet.getCell(`K${layout.totalShortage}`).value = formulaWithResult(
    `E${layout.shortageOrPlus}+F${layout.shortageOrPlus}+G${layout.shortageOrPlus}+H${layout.shortageOrPlus}+I${layout.shortageOrPlus}+J${layout.shortageOrPlus}+K${layout.shortageOrPlus}`,
    CASH_COLUMN_KEYS.reduce((total, columnKey) => total + calculateCash(report.cashColumns[columnKey] ?? emptyCash(columnKey)).shortageOrPlus, 0)
  );

  worksheet.getCell(`G${layout.totalSales}`).value = formulaWithResult(`J${templatePoint.totalRow}`, reportTotal);

  worksheet.getCell(`G${layout.totalHandedOver}`).value = formulaWithResult(
    `E${layout.handedOver}+F${layout.handedOver}+G${layout.handedOver}+H${layout.handedOver}+I${layout.handedOver}+J${layout.handedOver}+K${layout.handedOver}`,
    CASH_COLUMN_KEYS.reduce((total, columnKey) => total + (report.cashColumns[columnKey]?.handedOver ?? 0), 0)
  );

  // Подписи доп. расходов в колонке C (как в шаблоне)
  for (let index = 0; index < layout.customCount; index++) {
    const row = layout.customStart + index;
    const labelCell = worksheet.getCell(`${CASH_LABEL_COLUMN}${row}`);
    if (!labelCell.value) labelCell.value = "доп расход";
  }

  polishTemplateWorksheet(worksheet, templatePoint, layout);
}

function emptyCash(columnKey: CashColumnKey): CashInput {
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

/**
 * Лист ЗАЯВКА: обновляем формулы по строкам.
 * Колонка K = заявка (MAX(норма - остаток дома, 0)).
 * leftNumber / rightNumber — это номер строки продукта на листах (A-колонка),
 * который совпадает с реальной строкой Excel (без offset).
 */
function refreshRequestSheet(workbook: Workbook, state: AppState) {
  const worksheet = workbook.getWorksheet("ЗАЯВКА");
  if (!worksheet) return;

  for (let row = 4; row <= 200; row++) {
    const leftNumber = worksheet.getCell(`B${row}`).value;
    const rightNumber = worksheet.getCell(`G${row}`).value;

    if (leftNumber !== null && leftNumber !== undefined && leftNumber !== "") {
      const productRow = Number(leftNumber);
      if (!isNaN(productRow) && productRow > 0) {
        // Ссылаемся на строку с номером продукта (как хранится в A-колонке листа)
        // Находим реальную строку Excel для этого номера продукта
        const jvcRow = findExcelRowByProductNumber(workbook, "JVC", productRow);
        const tikomRow = findExcelRowByProductNumber(workbook, "Tikom", productRow);
        const seliconRow = findExcelRowByProductNumber(workbook, "Selicon", productRow);

        if (jvcRow) worksheet.getCell(`D${row}`).value = { formula: `JVC!K${jvcRow}`, result: 0 };
        if (tikomRow) worksheet.getCell(`E${row}`).value = { formula: `Tikom!K${tikomRow}`, result: 0 };
        if (seliconRow) worksheet.getCell(`F${row}`).value = { formula: `Selicon!K${seliconRow}`, result: 0 };
      }
    }

    if (rightNumber !== null && rightNumber !== undefined && rightNumber !== "") {
      const productRow = Number(rightNumber);
      if (!isNaN(productRow) && productRow > 0) {
        const jvcRow = findExcelRowByProductNumber(workbook, "JVC", productRow);
        const tikomRow = findExcelRowByProductNumber(workbook, "Tikom", productRow);
        const seliconRow = findExcelRowByProductNumber(workbook, "Selicon", productRow);

        if (jvcRow) worksheet.getCell(`I${row}`).value = { formula: `JVC!K${jvcRow}`, result: 0 };
        if (tikomRow) worksheet.getCell(`J${row}`).value = { formula: `Tikom!K${tikomRow}`, result: 0 };
        if (seliconRow) worksheet.getCell(`K${row}`).value = { formula: `Selicon!K${seliconRow}`, result: 0 };
      }
    }

    // Если строка пустая — выходим досрочно
    if (
      (leftNumber === null || leftNumber === undefined || leftNumber === "") &&
      (rightNumber === null || rightNumber === undefined || rightNumber === "") &&
      row > 10
    ) {
      break;
    }
  }
}

/**
 * Ищет строку Excel на листе sheetName, где колонка A равна productNumber.
 * Это нужно чтобы правильно связать номер в ЗАЯВКА с реальной строкой.
 */
function findExcelRowByProductNumber(workbook: Workbook, sheetName: string, productNumber: number): number | null {
  const ws = workbook.getWorksheet(sheetName);
  if (!ws) return null;
  for (let r = 3; r <= 200; r++) {
    const val = ws.getCell(`A${r}`).value;
    if (Number(val) === productNumber) return r;
    if (r > 130 && (val === null || val === undefined || val === "")) break;
  }
  return null;
}

async function loadTemplateWorkbook() {
  const ExcelJS = await import("exceljs");
  const response = await fetch(TEMPLATE_FILE_URL);
  if (!response.ok) throw new Error("Не удалось загрузить Excel-шаблон");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await response.arrayBuffer());
  const calcProperties = workbook.calcProperties as typeof workbook.calcProperties & { forceFullCalc?: boolean };
  calcProperties.fullCalcOnLoad = true;
  calcProperties.forceFullCalc = true;
  return workbook;
}

export async function createExcelReportFile(state: AppState, options: ExportOptions): Promise<DownloadFile> {
  if (options.format === "modern") {
    const { createModernExcelReportFile } = await import("./excel-modern");
    return createModernExcelReportFile(state, options);
  }

  const workbook = await loadTemplateWorkbook();
  const dates = options.scope === "day" ? [options.date] : getDatesInRange(options.startDate, options.endDate);
  const exportDate = dates[0] ?? options.date;
  const pointIds =
    options.pointScope === "single"
      ? [options.pointId]
      : TEMPLATE_POINTS.map((point) => point.id);

  for (const pointId of pointIds) {
    setProductRows(workbook, state, pointId, exportDate);
    setCashRows(workbook, state, pointId, exportDate);
  }

  refreshRequestSheet(workbook, state);

  const buffer = await workbook.xlsx.writeBuffer();
  const fileDate = options.scope === "day" ? options.date : `${options.startDate}_${options.endDate}`;
  return {
    blob: new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    fileName: `report_template_${fileDate}.xlsx`
  };
}

export async function downloadExcelReport(state: AppState, options: ExportOptions) {
  const file = await createExcelReportFile(state, options);
  downloadBlob(file.blob, file.fileName);
}
