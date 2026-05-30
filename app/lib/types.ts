export type UserRole = "admin";

export type Point = {
  id: string;
  name: string;
  active: boolean;
  sheetName?: string;
  excelTitle?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  norm: number;
  category: string;
  active: boolean;
  pointIds?: string[];
  excelRowsByPoint?: Record<string, number>;
  numbersByPoint?: Record<string, number>;
};

export type Driver = {
  id: string;
  name: string;
  pointId: string;
  active: boolean;
};

export type ReportItemInput = {
  productId: string;
  previousRest?: number;
  incoming: number;
  movement?: number;
  homeRest?: number;
  extraRequest?: number;
  currentRest?: number;
  flagged?: boolean;
  driverRest?: number;
  driverSale?: number;
  discrepancyNote?: string;
};

export type CashColumnKey = "E" | "F" | "G" | "H" | "I" | "J" | "K";

export type CustomExpense = {
  id: string;
  label: string;
  amount: number;
};

export type CashInput = {
  columnKey?: CashColumnKey;
  driverId?: string;
  driverName: string;
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
  comment: string;
  customExpenses?: CustomExpense[];
};

export type DailyReport = {
  id: string;
  date: string;
  pointId: string;
  driverId: string;
  driverName?: string;
  items: Record<string, ReportItemInput>;
  cashColumns: Record<CashColumnKey, CashInput>;
  closed: boolean;
  closedAt?: string;
};

export type Transfer = {
  id: string;
  date: string;
  fromPointId: string;
  toPointId: string;
  productId: string;
  quantity: number;
  comment: string;
};

export type AppState = {
  version: number;
  points: Point[];
  products: Product[];
  drivers: Driver[];
  reports: DailyReport[];
  transfers: Transfer[];
};

export type WarningSeverity = "info" | "warn" | "error";

export type ReportWarning = {
  code: string;
  severity: WarningSeverity;
  message: string;
};

export type ReportLine = {
  product: Product;
  rowNumber: number;
  previousRest: number;
  incoming: number;
  movement: number;
  homeRest?: number;
  sale: number;
  amount: number;
  request: number;
  extraRequest: number;
  currentRest?: number;
  available: number;
  warnings: ReportWarning[];
};

export type ImportMode = "merge" | "replace";

export type ImportResult = {
  importedDates: string[];
  updatedReports: number;
  createdReports: number;
  skippedSheets: string[];
  warnings: string[];
};

export type CashResult = CashInput & {
  shouldHandOver: number;
  shortageOrPlus: number;
};

export type DashboardData = {
  daySales: number;
  monthSales: number;
  revenueByPoint: Array<{ pointId: string; name: string; value: number }>;
  revenueByDriver: Array<{ driverId: string; name: string; value: number }>;
  topProducts: Array<{ productId: string; name: string; quantity: number; revenue: number }>;
  belowNorm: Array<{ point: string; product: string; rest: number; norm: number; request: number }>;
  shortages: Array<{ point: string; driver: string; value: number }>;
  expenses: number;
  debts: number;
  totalHandedOver: number;
  totalShortage: number;
};

export type ExportScope = "day" | "period";
export type ExportPointScope = "all" | "single";

export type ExcelExportFormat = "template" | "modern";

export type ExportOptions = {
  scope: ExportScope;
  pointScope: ExportPointScope;
  format: ExcelExportFormat;
  date: string;
  startDate: string;
  endDate: string;
  pointId: string;
};
