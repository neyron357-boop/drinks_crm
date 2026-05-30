import type { Row, Workbook, Worksheet } from "exceljs";
import {
  calculateCash,
  calculateCashColumns,
  calculateReportLines,
  calculateReportRevenue,
  getDatesInRange,
  getReportOrVirtual,
  money
} from "./calculations";
import { CASH_COLUMN_KEYS } from "./template-data";
import { downloadBlob, type DownloadFile } from "./download";
import type { AppState, CashColumnKey, CashInput, ExportOptions } from "./types";

const COLORS = {
  header: "FF1E3A5F",
  headerFont: "FFFFFFFF",
  subheader: "FFE8EEF4",
  border: "FFD0D7E2",
  warn: "FFFEF3C7",
  ok: "FFDCFCE7",
  bad: "FFFEE2E2"
};

const cashLabels: Array<[keyof CashInput, string]> = [
  ["foodExpenses", "Питание"],
  ["discounts", "Скидки"],
  ["fuel", "Бензин"],
  ["kfc", "KFC"],
  ["forHome", "Для дома"],
  ["carWash", "Мойка"],
  ["tinting", "Тонировка"],
  ["otherExpenses", "Прочие"],
  ["weReturnedDebt", "Мы вернули долг"],
  ["weOwe", "Нам должны"],
  ["clientReturnedDebt", "Клиент вернул"],
  ["clientTookDebt", "Клиент взял в долг"]
];

function styleHeaderRow(row: Row, fill = COLORS.header) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
    cell.font = { bold: true, color: { argb: COLORS.headerFont }, size: 10 };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } }
    };
  });
}

function styleBodyCell(cell: import("exceljs").Cell, opts?: { bold?: boolean; align?: "left" | "center" | "right" }) {
  cell.border = {
    top: { style: "thin", color: { argb: COLORS.border } },
    left: { style: "thin", color: { argb: COLORS.border } },
    bottom: { style: "thin", color: { argb: COLORS.border } },
    right: { style: "thin", color: { argb: COLORS.border } }
  };
  cell.alignment = { vertical: "middle", horizontal: opts?.align ?? "center", wrapText: true };
  if (opts?.bold) cell.font = { bold: true };
}

function formulaCell(formula: string, result: number) {
  return { formula, result: money(result) };
}

function buildPointSheet(workbook: Workbook, state: AppState, pointId: string, date: string) {
  const point = state.points.find((item) => item.id === pointId);
  const sheetName = (point?.name ?? pointId).slice(0, 31);
  const worksheet = workbook.addWorksheet(sheetName);
  const report = getReportOrVirtual(state, date, pointId);
  const lines = calculateReportLines(state, report);
  const revenue = calculateReportRevenue(state, report);

  worksheet.columns = [
    { width: 5 },
    { width: 34 },
    { width: 9 },
    { width: 8 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 11 },
    { width: 8 },
    { width: 8 },
    { width: 9 }
  ];

  worksheet.mergeCells("A1:M1");
  const title = worksheet.getCell("A1");
  title.value = `${point?.name ?? pointId} — отчёт ${date}`;
  title.font = { bold: true, size: 14, color: { argb: COLORS.headerFont } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.header } };
  title.alignment = { vertical: "middle", horizontal: "center" };

  const headers = ["№", "Товар", "Цена", "Норма", "Было", "Приход", "Перем.", "Остаток", "Продажа", "Сумма", "Заявка", "Доп", "Тек."];
  const headerRow = worksheet.getRow(3);
  headers.forEach((label, index) => {
    headerRow.getCell(index + 1).value = label;
  });
  styleHeaderRow(headerRow);

  const startRow = 4;
  lines.forEach((line, index) => {
    const row = startRow + index;
    const r = worksheet.getRow(row);
    r.getCell(1).value = line.rowNumber;
    r.getCell(2).value = line.product.name;
    r.getCell(3).value = line.product.price;
    r.getCell(4).value = line.product.norm;
    r.getCell(5).value = line.previousRest;
    r.getCell(6).value = line.incoming;
    r.getCell(7).value = line.movement;
    r.getCell(8).value = line.homeRest ?? null;
    r.getCell(9).value = formulaCell(`E${row}+F${row}-G${row}-H${row}`, line.sale);
    r.getCell(10).value = formulaCell(`C${row}*I${row}`, line.amount);
    r.getCell(11).value = formulaCell(`MAX(D${row}-H${row},0)`, line.request);
    r.getCell(12).value = line.extraRequest;
    r.getCell(13).value = line.currentRest ?? null;
    r.eachCell((cell, col) => styleBodyCell(cell, { align: col === 2 ? "left" : "center", bold: col === 2 }));
  });

  const totalRow = startRow + lines.length;
  worksheet.getCell(`A${totalRow}`).value = "ИТОГО";
  worksheet.getCell(`J${totalRow}`).value = formulaCell(
    `SUM(J${startRow}:J${totalRow - 1})`,
    revenue
  );
  styleHeaderRow(worksheet.getRow(totalRow), COLORS.subheader);

  let cashRow = totalRow + 2;
  worksheet.mergeCells(`A${cashRow}:M${cashRow}`);
  worksheet.getCell(`A${cashRow}`).value = "Касса водителей";
  worksheet.getCell(`A${cashRow}`).font = { bold: true, size: 12 };
  worksheet.getCell(`A${cashRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.subheader } };
  cashRow += 1;

  const cashColumns = calculateCashColumns(report).filter(
    (cash) => cash.driverName || cash.productRevenue || cash.handedOver || (cash.customExpenses?.length ?? 0) > 0
  );
  const activeColumns = (cashColumns.length ? cashColumns : calculateCashColumns(report)).slice(0, 7);

  for (const cash of activeColumns) {
    const columnKey = (cash.columnKey ?? "F") as CashColumnKey;
    const result = calculateCash(cash);

    const driverTitle = worksheet.getRow(cashRow);
    worksheet.mergeCells(`A${cashRow}:D${cashRow}`);
    driverTitle.getCell(1).value = cash.driverName || `Колонка ${columnKey}`;
    driverTitle.getCell(1).font = { bold: true, size: 11 };
    cashRow += 1;

    const minusRows: number[] = [];
    const plusRows: number[] = [];

    const writeAmountRow = (label: string, value: number | string) => {
      const row = worksheet.getRow(cashRow);
      row.getCell(1).value = label;
      row.getCell(2).value = value;
      row.getCell(1).font = { size: 10 };
      styleBodyCell(row.getCell(2), { align: "right", bold: true });
      cashRow += 1;
      return cashRow - 1;
    };

    const revenueRow = writeAmountRow("Выручка (товары)", cash.productRevenue);
    const creditFields = new Set<keyof CashInput>(["weOwe", "clientReturnedDebt"]);
    for (const [field, label] of cashLabels) {
      const value = Number(cash[field]) || 0;
      if (!value) continue;
      const row = writeAmountRow(label, value);
      if (creditFields.has(field)) plusRows.push(row);
      else minusRows.push(row);
    }
    for (const expense of cash.customExpenses ?? []) {
      minusRows.push(writeAmountRow(`+ ${expense.label}`, expense.amount));
    }

    const minusPart = minusRows.length ? `-${minusRows.map((row) => `B${row}`).join("-")}` : "";
    const plusPart = plusRows.length ? `+${plusRows.map((row) => `B${row}`).join("+")}` : "";
    const shouldFormula = `B${revenueRow}${minusPart}${plusPart}`;

    const shouldRow = writeAmountRow("Должен сдать", result.shouldHandOver);
    worksheet.getCell(`B${shouldRow}`).value = formulaCell(shouldFormula, result.shouldHandOver);

    const handedRow = writeAmountRow("Сдал", cash.handedOver);
    const diffRow = writeAmountRow("Разница", result.shortageOrPlus);
    worksheet.getCell(`B${diffRow}`).value = formulaCell(`B${handedRow}-B${shouldRow}`, result.shortageOrPlus);

    const diffCell = worksheet.getCell(`B${diffRow}`);
    diffCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: result.shortageOrPlus < 0 ? COLORS.bad : COLORS.ok }
    };

    cashRow += 1;
  }

  const cashRevenueTotal = money(
    CASH_COLUMN_KEYS.reduce((total, columnKey) => total + (report.cashColumns[columnKey]?.productRevenue ?? 0), 0)
  );
  const reconciliationDiff = money(cashRevenueTotal - revenue);

  worksheet.mergeCells(`A${cashRow}:D${cashRow}`);
  const reconTitle = worksheet.getCell(`A${cashRow}`);
  reconTitle.value = "Сверка с итогами продаж";
  reconTitle.font = { bold: true, size: 12 };
  reconTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.subheader } };
  cashRow += 1;

  const reconRows = [
    ["Выручка по товарам (итого)", revenue],
    ["Сумма выручки водителей", cashRevenueTotal],
    ["Разница (касса − товары)", reconciliationDiff]
  ] as const;

  for (const [label, value] of reconRows) {
    const row = worksheet.getRow(cashRow);
    row.getCell(1).value = label;
    row.getCell(2).value = value;
    row.getCell(1).font = { size: 10, bold: label.includes("Разница") };
    styleBodyCell(row.getCell(2), { align: "right", bold: true });
    if (label.includes("Разница")) {
      row.getCell(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: reconciliationDiff === 0 ? COLORS.ok : COLORS.warn }
      };
    }
    cashRow += 1;
  }

  worksheet.views = [{ state: "frozen", ySplit: 3 }];
}

export async function createModernExcelReportFile(state: AppState, options: ExportOptions): Promise<DownloadFile> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Drink Sales Ledger";
  workbook.created = new Date();

  const dates = options.scope === "day" ? [options.date] : getDatesInRange(options.startDate, options.endDate);
  const exportDate = dates[0] ?? options.date;
  const pointIds =
    options.pointScope === "single"
      ? [options.pointId]
      : state.points.filter((point) => point.active).map((point) => point.id);

  for (const pointId of pointIds) {
    buildPointSheet(workbook, state, pointId, exportDate);
  }

  const summary = workbook.addWorksheet("Сводка");
  summary.getCell("A1").value = "Сводка по точкам";
  summary.getCell("A1").font = { bold: true, size: 14 };
  summary.getRow(3).values = ["Точка", "Дата", "Выручка"];
  styleHeaderRow(summary.getRow(3));
  pointIds.forEach((pointId, index) => {
    const point = state.points.find((item) => item.id === pointId);
    const report = getReportOrVirtual(state, exportDate, pointId);
    const row = summary.getRow(4 + index);
    row.getCell(1).value = point?.name ?? pointId;
    row.getCell(2).value = exportDate;
    row.getCell(3).value = calculateReportRevenue(state, report);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileDate = options.scope === "day" ? options.date : `${options.startDate}_${options.endDate}`;
  return {
    blob: new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    fileName: `report_modern_${fileDate}.xlsx`
  };
}

export async function downloadModernExcelReport(state: AppState, options: ExportOptions) {
  const file = await createModernExcelReportFile(state, options);
  downloadBlob(file.blob, file.fileName);
}
