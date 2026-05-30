import type { Workbook, Worksheet } from "exceljs";
import { TEMPLATE_POINTS } from "./template-data";
import type { CashColumnKey, CustomExpense } from "./types";

export type TemplateCashRows = (typeof TEMPLATE_POINTS)[number]["cashRows"];

export type DynamicCashLayout = {
  driverName: number;
  productRevenue: number;
  foodExpenses: number;
  weReturnedDebt: number;
  weOwe: number;
  clientReturnedDebt: number;
  clientTookDebt: number;
  discounts: number;
  fuel: number;
  kfc: number;
  forHome: number;
  carWash: number;
  tinting: number;
  otherExpenses: number;
  handedOver: number;
  shouldHandOver: number;
  shortageOrPlus: number;
  totalShortage: number;
  totalSales: number;
  totalHandedOver: number;
  customStart: number;
  customCount: number;
  rowOffset: number;
};

export const MAX_CUSTOM_EXPENSE_ROWS = 12;
export const CASH_LABEL_COLUMN = "C";

type MergeModel = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};

function getMergeModels(worksheet: Worksheet): MergeModel[] {
  const internalWorksheet = worksheet as Worksheet & {
    _merges?: Record<string, { model?: MergeModel }>;
  };

  return Object.values(internalWorksheet._merges ?? {})
    .map((merge) => merge.model)
    .filter((model): model is MergeModel => Boolean(model));
}

export function resolveWorksheet(workbook: Workbook, sheetName: string, aliases: string[] = []) {
  const targets = [sheetName, ...aliases].map((name) => name.trim().toLowerCase());
  return (
    workbook.worksheets.find((sheet) => targets.includes(sheet.name.trim().toLowerCase())) ??
    workbook.getWorksheet(sheetName)
  );
}

export function resolvePointWorksheet(workbook: Workbook, point: (typeof TEMPLATE_POINTS)[number]) {
  return resolveWorksheet(workbook, point.sheetName, [point.name, point.excelTitle]);
}

export function buildDynamicCashLayout(baseRows: TemplateCashRows, customCount: number): DynamicCashLayout {
  const safeCount = Math.min(Math.max(customCount, 0), MAX_CUSTOM_EXPENSE_ROWS);
  const rowOffset = Math.max(0, safeCount - 1);

  return {
    driverName: baseRows.driverName,
    productRevenue: baseRows.productRevenue,
    foodExpenses: baseRows.foodExpenses,
    weReturnedDebt: baseRows.weReturnedDebt,
    weOwe: baseRows.weOwe,
    clientReturnedDebt: baseRows.clientReturnedDebt,
    clientTookDebt: baseRows.clientTookDebt,
    discounts: baseRows.discounts,
    fuel: baseRows.fuel,
    kfc: baseRows.kfc,
    forHome: baseRows.forHome,
    carWash: baseRows.carWash,
    tinting: baseRows.tinting,
    otherExpenses: baseRows.otherExpenses,
    customStart: baseRows.otherExpenses + 1,
    customCount: safeCount,
    rowOffset,
    handedOver: baseRows.handedOver + rowOffset,
    shouldHandOver: baseRows.shouldHandOver + rowOffset,
    shortageOrPlus: baseRows.shortageOrPlus + rowOffset,
    totalShortage: baseRows.totalShortage + rowOffset,
    totalSales: baseRows.totalSales + rowOffset,
    totalHandedOver: baseRows.totalHandedOver + rowOffset
  };
}

export function insertCustomExpenseRows(worksheet: Worksheet, baseRows: TemplateCashRows, customCount: number) {
  const layout = buildDynamicCashLayout(baseRows, customCount);
  if (layout.rowOffset > 0) {
    const blankRows = Array.from({ length: layout.rowOffset }, () => []);
    const styleSourceRow = worksheet.getRow(baseRows.handedOver - 1);
    const shiftedMerges = getMergeModels(worksheet).filter(
      (merge) => merge.top >= baseRows.handedOver && merge.top <= baseRows.totalHandedOver
    );

    for (const merge of shiftedMerges) {
      worksheet.unMergeCells(merge.top, merge.left, merge.bottom, merge.right);
    }

    worksheet.spliceRows(baseRows.handedOver, 0, ...blankRows);

    for (const merge of shiftedMerges) {
      worksheet.mergeCells(
        merge.top + layout.rowOffset,
        merge.left,
        merge.bottom + layout.rowOffset,
        merge.right
      );
    }

    for (let rowNumber = baseRows.handedOver; rowNumber < layout.handedOver; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      row.height = styleSourceRow.height;
      for (let col = 1; col <= Math.max(worksheet.columnCount, 13); col++) {
        row.getCell(col).style = { ...styleSourceRow.getCell(col).style };
      }
    }
  }
  for (let rowNumber = layout.customStart; rowNumber < layout.handedOver; rowNumber++) {
    const hasMerge = getMergeModels(worksheet).some(
      (merge) => merge.top === rowNumber && merge.left === 3 && merge.bottom === rowNumber && merge.right === 4
    );
    if (!hasMerge) worksheet.mergeCells(rowNumber, 3, rowNumber, 4);
  }
  return layout;
}

export function clearCustomExpenseBlock(worksheet: Worksheet, layout: DynamicCashLayout) {
  for (let row = layout.customStart; row < layout.handedOver; row++) {
    worksheet.getCell(`${CASH_LABEL_COLUMN}${row}`).value = null;
    for (const columnKey of ["E", "F", "G", "H", "I", "J", "K"] as CashColumnKey[]) {
      worksheet.getCell(`${columnKey}${row}`).value = null;
    }
  }
}

export function writeCustomExpenseBlock(
  worksheet: Worksheet,
  layout: DynamicCashLayout,
  columnKey: CashColumnKey,
  expenses: CustomExpense[] | undefined
) {
  const list = expenses ?? [];
  for (let index = 0; index < layout.customCount; index++) {
    const row = layout.customStart + index;
    const expense = list[index];
    if (!expense) continue;
    const labelCell = worksheet.getCell(`${CASH_LABEL_COLUMN}${row}`);
    if (!labelCell.value) labelCell.value = expense.label;
    worksheet.getCell(`${columnKey}${row}`).value = expense.amount;
  }
}

export function customExpenseFormulaParts(layout: DynamicCashLayout, columnKey: CashColumnKey, count: number) {
  const safeCount = Math.min(count, layout.customCount);
  return Array.from({ length: safeCount }, (_, index) => `-${columnKey}${layout.customStart + index}`).join("");
}

export function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && value !== null && "text" in value) {
    return String((value as { text: string }).text).trim();
  }
  if (typeof value === "object" && value !== null && "richText" in value) {
    const richText = (value as { richText: Array<{ text: string }> }).richText;
    return richText.map((part) => part.text).join("").trim();
  }
  return String(value).trim();
}

export function cellNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "object" && value !== null && "result" in value) {
    return cellNumber((value as { result: unknown }).result);
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isHandedOverLabel(label: string) {
  return /^(сдал|handed)/i.test(label.replace(/\s+/g, " ").trim());
}

function isStandardCashLabel(label: string) {
  return /должен|плюс|недостача|выручка|итог/i.test(label);
}

/** Определяет строки кассы по подписям в колонке C (как в шаблоне). */
export function detectCashLayoutFromSheet(worksheet: Worksheet, baseRows: TemplateCashRows): DynamicCashLayout {
  const scanStart = baseRows.otherExpenses;
  const scanEnd = baseRows.totalHandedOver + MAX_CUSTOM_EXPENSE_ROWS + 5;
  let handedOverRow: number = baseRows.handedOver;

  for (let row = scanStart; row <= scanEnd; row++) {
    const label = cellText(worksheet.getCell(`${CASH_LABEL_COLUMN}${row}`).value);
    if (isHandedOverLabel(label)) {
      handedOverRow = row;
      break;
    }
  }

  const customStart = baseRows.otherExpenses + 1;
  const customCount = Math.max(0, handedOverRow - customStart);
  const rowOffset = Math.max(0, customCount - 1);

  return {
    driverName: baseRows.driverName,
    productRevenue: baseRows.productRevenue,
    foodExpenses: baseRows.foodExpenses,
    weReturnedDebt: baseRows.weReturnedDebt,
    weOwe: baseRows.weOwe,
    clientReturnedDebt: baseRows.clientReturnedDebt,
    clientTookDebt: baseRows.clientTookDebt,
    discounts: baseRows.discounts,
    fuel: baseRows.fuel,
    kfc: baseRows.kfc,
    forHome: baseRows.forHome,
    carWash: baseRows.carWash,
    tinting: baseRows.tinting,
    otherExpenses: baseRows.otherExpenses,
    customStart,
    customCount: Math.min(customCount, MAX_CUSTOM_EXPENSE_ROWS),
    rowOffset,
    handedOver: handedOverRow,
    shouldHandOver: baseRows.shouldHandOver + rowOffset,
    shortageOrPlus: baseRows.shortageOrPlus + rowOffset,
    totalShortage: baseRows.totalShortage + rowOffset,
    totalSales: baseRows.totalSales + rowOffset,
    totalHandedOver: baseRows.totalHandedOver + rowOffset
  };
}

export function readCustomExpensesFromSheet(
  worksheet: Worksheet,
  layout: DynamicCashLayout,
  columnKey: CashColumnKey
): CustomExpense[] {
  const expenses: CustomExpense[] = [];

  for (let index = 0; index < layout.customCount; index++) {
    const row = layout.customStart + index;
    const label = cellText(worksheet.getCell(`${CASH_LABEL_COLUMN}${row}`).value);
    const amount = cellNumber(worksheet.getCell(`${columnKey}${row}`).value);
    if (!label && (amount === undefined || amount === 0)) continue;
    if (isStandardCashLabel(label) || isHandedOverLabel(label)) continue;
    expenses.push({
      id: `import-${columnKey}-${row}`,
      label: label || `Доп. расход ${index + 1}`,
      amount: amount ?? 0
    });
  }

  return expenses;
}
