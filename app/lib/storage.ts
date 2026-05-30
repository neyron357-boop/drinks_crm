import { AppState } from "./types";
import { createInitialState, emptyCashColumns, STORAGE_KEY } from "./seed";
import { normalizeProductCatalog } from "./product-order";

function normalizeState(state: AppState): AppState {
  const products = normalizeProductCatalog(state.products, state.points);

  return {
    ...state,
    products,
    reports: state.reports.map((report) => {
      const defaults = emptyCashColumns(report.pointId, state.drivers);
      return {
        ...report,
        items: {
          ...Object.fromEntries(
            products
              .filter((product) => !product.pointIds || product.pointIds.includes(report.pointId))
              .map((product) => [product.id, { productId: product.id, incoming: 0, movement: 0, extraRequest: 0 }])
          ),
          ...report.items
        },
        cashColumns: Object.fromEntries(
          Object.entries(defaults).map(([columnKey, defaultCash]) => {
            const savedCash = report.cashColumns[columnKey as keyof typeof defaults];
            const mergedCash = {
              ...defaultCash,
              ...savedCash,
              driverName: savedCash?.driverName || defaultCash.driverName
            };
            return [
              columnKey,
              {
                ...mergedCash,
                foodExpenses: mergedCash.driverName && !report.closed && Number(mergedCash.foodExpenses) === 0 ? 80 : mergedCash.foodExpenses
              }
            ];
          })
        ) as typeof report.cashColumns
      };
    })
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return createInitialState();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createInitialState();

    const parsed = JSON.parse(stored) as AppState;
    const reportsAreCompatible = Array.isArray(parsed.reports) && parsed.reports.every((report) => report.items && report.cashColumns);
    const hasTemplateProducts = Array.isArray(parsed.products) && parsed.products.some((product) => product.excelRowsByPoint);
    if (
      parsed.version !== 2 ||
      !parsed.points ||
      !parsed.products ||
      !parsed.drivers ||
      !parsed.reports ||
      !parsed.transfers ||
      !reportsAreCompatible ||
      !hasTemplateProducts
    ) {
      return createInitialState();
    }

    return normalizeState({
      ...createInitialState(),
      ...parsed,
      version: 2
    });
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
