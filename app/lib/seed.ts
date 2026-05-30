import { AppState, CashColumnKey, CashInput, DailyReport, Driver, Point, Product } from "./types";
import { CASH_COLUMN_KEYS, TEMPLATE_POINT_SEEDS, TEMPLATE_PRODUCTS, TEMPLATE_REPORTS } from "./template-data";
import { normalizeProductCatalog } from "./product-order";

export const STORAGE_KEY = "drink-sales-ledger-state-v2";

export const initialPoints: Point[] = TEMPLATE_POINT_SEEDS;

export const initialProducts: Product[] = normalizeProductCatalog(TEMPLATE_PRODUCTS, initialPoints);

export const initialDrivers: Driver[] = [
  { id: "driver-farrukh", name: "Фаррух", pointId: "jvc", active: true },
  { id: "driver-bahodur", name: "Баходур", pointId: "business-bay", active: true },
  { id: "driver-avaz", name: "Аваз", pointId: "business-bay", active: true },
  { id: "driver-fakhridin", name: "Фахридин", pointId: "business-bay", active: true },
  { id: "driver-aziz", name: "Азиз", pointId: "silicon-oasis", active: true },
  { id: "driver-fariddun", name: "Фариддун", pointId: "silicon-oasis", active: true },
  { id: "driver-sunat", name: "СУНАТ", pointId: "al-qusais", active: true },
  { id: "driver-dovron", name: "ДОВРОН", pointId: "al-qusais", active: true },
  { id: "driver-alisher", name: "Алишер", pointId: "tikom", active: true },
  { id: "driver-fayzidin", name: "Файзидин", pointId: "tikom", active: true }
];

const DRIVER_CASH_COLUMNS: CashColumnKey[] = ["F", "G", "H", "I", "J", "K"];

export function emptyCash(columnKey: CashColumnKey, driverName = ""): CashInput {
  return {
    columnKey,
    driverName,
    productRevenue: 0,
    foodExpenses: driverName ? 80 : 0,
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
    comment: ""
  };
}

export function emptyCashColumns(pointId?: string, drivers: Driver[] = initialDrivers) {
  const pointDrivers = drivers.filter((driver) => driver.active && driver.pointId === pointId);
  return Object.fromEntries(
    CASH_COLUMN_KEYS.map((columnKey) => {
      const driverIndex = DRIVER_CASH_COLUMNS.indexOf(columnKey);
      return [columnKey, emptyCash(columnKey, driverIndex >= 0 ? pointDrivers[driverIndex]?.name ?? "" : "")];
    })
  ) as Record<CashColumnKey, CashInput>;
}

export function reportId(date: string, pointId: string) {
  return `${date}_${pointId}`;
}

export function createEmptyReport(date: string, pointId: string, driverId: string, products: Product[]): DailyReport {
  return {
    id: reportId(date, pointId),
    date,
    pointId,
    driverId,
    items: Object.fromEntries(
      products
        .filter((product) => !product.pointIds || product.pointIds.includes(pointId))
        .map((product) => [
          product.id,
          {
            productId: product.id,
            incoming: 0,
            movement: 0,
            homeRest: undefined,
            extraRequest: 0
          }
        ])
    ),
    cashColumns: emptyCashColumns(pointId),
    closed: false
  };
}

export function createInitialState(): AppState {
  return {
    version: 2,
    points: initialPoints,
    products: initialProducts,
    drivers: initialDrivers,
    reports: TEMPLATE_REPORTS,
    transfers: []
  };
}
