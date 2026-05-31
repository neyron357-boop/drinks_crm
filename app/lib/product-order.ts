import type { Point, Product } from "./types";

export const CANONICAL_PRODUCT_NAMES = [
  "ABSOLUT BLUE LTR",
  "J/W RED LABEL  1 LTR",
  "J/W BLAK LABEL 1 LTR",
  "JACK DANIELS LTR",
  "CHIVAS REGAL 1 LTR",
  "HEINEKEN BEER CANS 33CL",
  "BUDWEISER BEER CAN 33/35",
  "CARLSBERG 50CL Can",
  "RED HORSE 50CL Can",
  "AMSTEL LIGHT Slim Can 35",
  "CORONA BEER BTL 35.5CL",
  "STELLA 33CL BTLS",
  "STELLA ARTOIS 33 CL cans",
  "HEINEKEN BEER BTL 33CL",
  "BUDWEISER BERR BTL 33cl",
  "SMIRNOFF ICE RED 27,5CL",
  "PERONI NASTRO AZURO BEER",
  "JC CHARDONNAY 75CL",
  "JC SHIRAZ CABARNET 75CL",
  "CES PINOT GRIG D VEN FIO",
  "Le GRAND Noir SAUV BLANC",
  "Le GRAND Noir MERLOT 75C",
  "MIP Collection ROSE Provienc 7",
  "CH KSARA SUNSET ROSE 75C",
  "MATEUS ROSE 75CL",
  "BACARDI WHITE RUM LTR",
  "BACARDI BLACK. 1 LTR",
  "BACARDI GOLD LTR",
  "JOSE CUERVO GOLD LTR",
  "JOSE CUERVO SILVER Espec",
  "TANQUERAY GIN LTR",
  "GORDONS PINK GIN Ltr",
  "GORDONS GIN LTR",
  "BOMBAY SAPPHIRE GIN LTR",
  "HENDRICKS GIN 1 LTR",
  "CAPTAIN MORGAN BLK LTR",
  "CAPTAIN MORGAN SPICED GO",
  "MALIBU WHITHE RUM LTR",
  "BAILEYS IRISH CREAM LTR",
  "AMARULA CREAM LTR",
  "JAMESON IRISH WSK LTR",
  "J&B RARE SCOTCH 1 LTR",
  "D/H CLARNET SELECT 5LTR",
  "D/H PREM GRN CRU 5LTR",
  "MARTINI BIANCO 1 LTR",
  "SMIRNOFF R/L 1 LTR",
  "STOLICHNAYA VODKA LTR",
  "RUSSIAN STD. PETERS L",
  "JAGERMEISTER  1 LTR",
  "BELVEDERE VODKA  LTR",
  "GREY GOOSE VODKA LTR",
  "BELUGA  NOBLE VODKA 70CL",
  "CIROK VODKA LTR",
  "SKYY VODKA 1 LTR",
  "ARAK TOUMA 50/54CL",
  "EFE Fresh Grape RAKI LTR Green",
  "J/W GOLD LABEL RESERV 1",
  "J/W DOUBLE BLACK LTR",
  "J/W BLUE LABEL 1 LTR",
  "HENNESSY VS LTR",
  "HENNESSY V.S.O.P 1 LTR Pr",
  "HENNESSY XO LTR",
  "REMY MARTIN VSOP LTR",
  "CHIVAS 18 YRS LTR",
  "ROYAL SALUTE 21 YRS LTR",
  "PATRON COFFE",
  "PATRON SILVER  75CL TEQUI",
  "PATRON ANEJO 75CL GOLD T",
  "DON JULIO BLANCO 70/75CL",
  "DON JULIO REPOSADO 70/75",
  "DON JULIO ANEJO 70/75CL",
  "DON JULIO 1942 ANEJO 70",
  "ASTI MARTINI 75CL",
  "JC CHARDONNAY PINOT NOIR",
  "BOTTEGA VINO D POET PROS",
  "BOTTEGA ROSE Proseco POE",
  "BOTTEGA GOLD BRUT 75C vi",
  "VEUVE CLICQUOT Y/L PONSR",
  "MOET & CHANDON BRUT IMP",
  "MOET & CHANDON  ROSE 75CL",
  "MOET ICE IMPERIAL 75cl",
  "DOM PERIGNON M&C 75CL",
  "GLENDFIDICH SPL R12YRS",
  "GLENDFIDICH 15 YRS LTR",
  "GLENDFIDICH 18Y Smal Bat",
  "BARON RIMAPERE SAUV BLAN",
  "MARCHESI GAVI D GAVI 75C",
  "LAROCHE CHABLIS ST MARTI",
  "L J BOURGOGNE BL Cuv D ja",
  "CASTEL CH. BARREYRES HAUT M 75",
  "CH SAINT LEON BOX SUP 75",
  "CAMPO VIEJO RESERVA RIOJ",
  "CAMPO VIEJO GRAN RESERVA",
  "M MINUTY ROSE PROVENCE",
  "Cav D ESCLN WHISPERING",
  "JACK DANIELS HONEY LTR",
  "BACCARDI BREEZER W/MELON",
  "ASAHI BEER BTLS SUPER DR",
  "APEROLE Aperitivo LTR",
  "CHIVAS 25 YRS",
  "CLASE AZUL Reposado 70/7",
  "MS CH PERRON LALANDE D POMEROL",
  "LA CELIA RESERVA MALBEC 75CL",
  "CALVET SANCERRE Les Hautes",
  "CHATEAU des LAURETS Saint Emilion",
  "GUINNESS BEER CANS 44cl",
  "XXL  VODKA MIX ENERGY CAN",
  "MONKEY 47  DRY GIN 50CL",
  "GENTLEMAN JACK 1 LTR JD",
  "MACALLAN 12 YR FIN TRIP",
  "MACALLAN 15 YRS Double Ca",
  "MACALLAN 18 YRS",
  "HOEGARDEN BLANCHE 33CL B",
  "TEQUILA ROSE LIQUER 70C S/Bery",
  "MALFY Con Ara Blood Orange GIN 70",
  "MALFY GIN ROSA 70cl GrapfruitE",
  "Drumshanb GUNPODER GIN",
  "CH SAINT MAUR L Exelenc ROS 7",
  "CH LAGRANGE 2010 St Julien",
  "RUINART BLANC D BLANC 75 CL",
  "ZONIN PROSECCO 75CL",
  "OYSTER BAY SAUVIGNON",
  "BALANTINES"
] as const;

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-|-$/g, "") || "product"
  );
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "");
}

function inferCategory(name: string) {
  if (/beer|heineken|corona|stella|budweiser|carlsberg|amstel|peroni|guinness|hoegarden|asahi/i.test(name)) return "Пиво";
  if (/moet|veuve|prosecco|asti|bottega|ruinart|dom perignon|brut|zonin/i.test(name)) return "Шампанское";
  if (/chardonnay|merlot|sauv|cabernet|pinot|shiraz|malbec|rioj|chablis|gavi|sancerre|bourgogne|rose|chateau|oyster/i.test(name)) return "Вино";
  if (/blue label|gold label|xo|vsop|royal salute|macallan|clase azul|don julio 1942|ruinart|dom perignon/i.test(name)) return "Премиум";
  return "Крепкий алкоголь";
}

function inferAllowDecimal(name: string) {
  return /beer|heineken|corona|stella|budweiser|carlsberg|amstel|peroni|guinness|hoegarden|asahi|red horse|can|btl/i.test(name);
}

function pointNumberMap(points: Point[], number: number) {
  return Object.fromEntries(points.map((point) => [point.id, number]));
}

function nextUniqueId(products: Product[], base: string) {
  let id = base;
  let index = 2;
  while (products.some((product) => product.id === id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

export function normalizeProductCatalog(products: Product[], points: Point[]): Product[] {
  const byName = new Map<string, Product>();
  const allPointIds = points.map((point) => point.id);
  for (const product of products) {
    const key = normalizeName(product.name);
    if (!byName.has(key)) byName.set(key, product);
  }

  const usedIds = new Set<string>();
  const canonicalProducts = CANONICAL_PRODUCT_NAMES.map((name, index) => {
    const existing = byName.get(normalizeName(name));
    const rowNumber = index + 1;
    const id = existing?.id ?? nextUniqueId(products, slugify(name));
    usedIds.add(id);

    return {
      ...(existing ?? {
        id,
        price: 0,
        norm: 0,
        active: true
      }),
      id,
      name,
      category: existing?.category && existing.category !== "Товары из шаблона" ? existing.category : inferCategory(name),
      active: existing?.active ?? true,
      shelfOrder: existing?.shelfOrder ?? rowNumber,
      allowDecimal: existing?.allowDecimal ?? inferAllowDecimal(name),
      quantityStep: existing?.quantityStep ?? (inferAllowDecimal(name) ? 0.5 : 1),
      pointIds: allPointIds,
      numbersByPoint: pointNumberMap(points, rowNumber)
    } satisfies Product;
  });

  const extraProducts = products
    .filter((product) => !usedIds.has(product.id))
    .map((product, index) => ({
      ...product,
      shelfOrder: product.shelfOrder ?? CANONICAL_PRODUCT_NAMES.length + index + 1,
      allowDecimal: product.allowDecimal ?? inferAllowDecimal(product.name),
      quantityStep: product.quantityStep ?? (inferAllowDecimal(product.name) ? 0.5 : 1),
      numbersByPoint: pointNumberMap(points, CANONICAL_PRODUCT_NAMES.length + index + 1)
    }));

  return [...canonicalProducts, ...extraProducts];
}

export function productSortNumber(product: Product, pointId?: string) {
  if (typeof product.shelfOrder === "number") return product.shelfOrder;
  const canonicalIndex = CANONICAL_PRODUCT_NAMES.findIndex((name) => normalizeName(name) === normalizeName(product.name));
  if (canonicalIndex >= 0) return canonicalIndex + 1;
  return pointId ? product.numbersByPoint?.[pointId] ?? 10000 : 10000;
}
