import type { CashColumnKey, DailyReport, Point, Product } from "./types";

export const TEMPLATE_DATE = "2026-05-28";
export const TEMPLATE_FILE_URL = "/templates/report-template.xlsx";
export const CASH_COLUMN_KEYS = ["E","F","G","H","I","J","K"] as CashColumnKey[];

export const TEMPLATE_POINTS = [
  {
    "id": "jvc",
    "name": "JVC",
    "sheetName": "JVC",
    "excelTitle": "B1 JVC",
    "productStartRow": 3,
    "productEndRow": 124,
    "totalRow": 125,
    "cashStartRow": 129,
    "cashRows": {
      "driverName": 129,
      "productRevenue": 130,
      "foodExpenses": 131,
      "weReturnedDebt": 132,
      "weOwe": 133,
      "clientReturnedDebt": 134,
      "clientTookDebt": 135,
      "discounts": 136,
      "fuel": 137,
      "kfc": 138,
      "forHome": 139,
      "carWash": 140,
      "tinting": 141,
      "otherExpenses": 142,
      "handedOver": 144,
      "shouldHandOver": 145,
      "shortageOrPlus": 146,
      "totalShortage": 147,
      "totalSales": 149,
      "totalHandedOver": 150
    }
  },
  {
    "id": "business-bay",
    "name": "Bussines Bay",
    "sheetName": "Bussines Bay",
    "excelTitle": "B2 Bussines Bay",
    "productStartRow": 3,
    "productEndRow": 125,
    "totalRow": 126,
    "cashStartRow": 129,
    "cashRows": {
      "driverName": 129,
      "productRevenue": 130,
      "foodExpenses": 131,
      "weReturnedDebt": 132,
      "weOwe": 133,
      "clientReturnedDebt": 134,
      "clientTookDebt": 135,
      "discounts": 136,
      "fuel": 137,
      "kfc": 138,
      "forHome": 139,
      "carWash": 140,
      "tinting": 141,
      "otherExpenses": 142,
      "handedOver": 144,
      "shouldHandOver": 145,
      "shortageOrPlus": 146,
      "totalShortage": 147,
      "totalSales": 149,
      "totalHandedOver": 150
    }
  },
  {
    "id": "silicon-oasis",
    "name": "Silicon Oasis",
    "sheetName": "Selicon",
    "excelTitle": "B3 Silicon Oasis",
    "productStartRow": 3,
    "productEndRow": 124,
    "totalRow": 125,
    "cashStartRow": 128,
    "cashRows": {
      "driverName": 128,
      "productRevenue": 129,
      "foodExpenses": 130,
      "weReturnedDebt": 131,
      "weOwe": 132,
      "clientReturnedDebt": 133,
      "clientTookDebt": 134,
      "discounts": 135,
      "fuel": 136,
      "kfc": 137,
      "forHome": 138,
      "carWash": 139,
      "tinting": 140,
      "otherExpenses": 141,
      "handedOver": 143,
      "shouldHandOver": 144,
      "shortageOrPlus": 145,
      "totalShortage": 146,
      "totalSales": 148,
      "totalHandedOver": 149
    }
  },
  {
    "id": "al-qusais",
    "name": "Al-Qusais",
    "sheetName": "Al-Qusais",
    "excelTitle": "B4 Al Qusais",
    "productStartRow": 3,
    "productEndRow": 125,
    "totalRow": 126,
    "cashStartRow": 129,
    "cashRows": {
      "driverName": 129,
      "productRevenue": 130,
      "foodExpenses": 131,
      "weReturnedDebt": 132,
      "weOwe": 133,
      "clientReturnedDebt": 134,
      "clientTookDebt": 135,
      "discounts": 136,
      "fuel": 137,
      "kfc": 138,
      "forHome": 139,
      "carWash": 140,
      "tinting": 141,
      "otherExpenses": 142,
      "handedOver": 144,
      "shouldHandOver": 145,
      "shortageOrPlus": 146,
      "totalShortage": 147,
      "totalSales": 149,
      "totalHandedOver": 150
    }
  },
  {
    "id": "tikom",
    "name": "Tikom",
    "sheetName": "Tikom",
    "excelTitle": "B5 Tikkom",
    "productStartRow": 3,
    "productEndRow": 124,
    "totalRow": 125,
    "cashStartRow": 129,
    "cashRows": {
      "driverName": 129,
      "productRevenue": 130,
      "foodExpenses": 131,
      "weReturnedDebt": 132,
      "weOwe": 133,
      "clientReturnedDebt": 134,
      "clientTookDebt": 135,
      "discounts": 136,
      "fuel": 137,
      "kfc": 138,
      "forHome": 139,
      "carWash": 140,
      "tinting": 141,
      "otherExpenses": 142,
      "handedOver": 144,
      "shouldHandOver": 145,
      "shortageOrPlus": 146,
      "totalShortage": 147,
      "totalSales": 149,
      "totalHandedOver": 150
    }
  }
] as const;

export const TEMPLATE_PRODUCTS: Product[] = [
  {
    "id": "absolut-blue-ltr",
    "name": "ABSOLUT BLUE LTR",
    "price": 100,
    "norm": 40,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 3,
      "business-bay": 3,
      "silicon-oasis": 3,
      "al-qusais": 3,
      "tikom": 3
    },
    "numbersByPoint": {
      "jvc": 1,
      "business-bay": 1,
      "silicon-oasis": 1,
      "al-qusais": 1,
      "tikom": 1
    }
  },
  {
    "id": "j-w-red-label-1-ltr",
    "name": "J/W RED LABEL  1 LTR",
    "price": 100,
    "norm": 40,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 4,
      "business-bay": 4,
      "silicon-oasis": 4,
      "al-qusais": 4,
      "tikom": 4
    },
    "numbersByPoint": {
      "jvc": 2,
      "business-bay": 2,
      "silicon-oasis": 2,
      "al-qusais": 2,
      "tikom": 2
    }
  },
  {
    "id": "j-w-blak-label-1-ltr",
    "name": "J/W BLAK LABEL 1 LTR",
    "price": 200,
    "norm": 20,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 5,
      "business-bay": 5,
      "silicon-oasis": 5,
      "al-qusais": 5,
      "tikom": 5
    },
    "numbersByPoint": {
      "jvc": 3,
      "business-bay": 3,
      "silicon-oasis": 3,
      "al-qusais": 3,
      "tikom": 3
    }
  },
  {
    "id": "jack-daniels-ltr",
    "name": "JACK DANIELS LTR",
    "price": 200,
    "norm": 20,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 6,
      "business-bay": 6,
      "silicon-oasis": 6,
      "al-qusais": 6,
      "tikom": 6
    },
    "numbersByPoint": {
      "jvc": 4,
      "business-bay": 4,
      "silicon-oasis": 4,
      "al-qusais": 4,
      "tikom": 4
    }
  },
  {
    "id": "chivas-regal-1-ltr",
    "name": "CHIVAS REGAL 1 LTR",
    "price": 200,
    "norm": 20,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 7,
      "business-bay": 7,
      "silicon-oasis": 7,
      "al-qusais": 7,
      "tikom": 7
    },
    "numbersByPoint": {
      "jvc": 5,
      "business-bay": 5,
      "silicon-oasis": 5,
      "al-qusais": 5,
      "tikom": 5
    }
  },
  {
    "id": "heineken-beer-cans-33cl",
    "name": "HEINEKEN BEER CANS 33CL",
    "price": 200,
    "norm": 15,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 8,
      "business-bay": 8,
      "silicon-oasis": 8,
      "al-qusais": 8,
      "tikom": 8
    },
    "numbersByPoint": {
      "jvc": 6,
      "business-bay": 6,
      "silicon-oasis": 6,
      "al-qusais": 6,
      "tikom": 6
    }
  },
  {
    "id": "budweiser-beer-can-33-35",
    "name": "BUDWEISER BEER CAN 33/35",
    "price": 200,
    "norm": 12,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 9,
      "business-bay": 9,
      "silicon-oasis": 9,
      "al-qusais": 9,
      "tikom": 9
    },
    "numbersByPoint": {
      "jvc": 7,
      "business-bay": 7,
      "silicon-oasis": 7,
      "al-qusais": 7,
      "tikom": 7
    }
  },
  {
    "id": "carlsberg-50cl-can",
    "name": "CARLSBERG 50CL Can",
    "price": 200,
    "norm": 8,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 10,
      "business-bay": 10,
      "silicon-oasis": 10,
      "al-qusais": 10,
      "tikom": 10
    },
    "numbersByPoint": {
      "jvc": 8,
      "business-bay": 8,
      "silicon-oasis": 8,
      "al-qusais": 8,
      "tikom": 8
    }
  },
  {
    "id": "red-horse-50cl-can",
    "name": "RED HORSE 50CL Can",
    "price": 200,
    "norm": 5,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 11,
      "business-bay": 11,
      "silicon-oasis": 11,
      "al-qusais": 11,
      "tikom": 11
    },
    "numbersByPoint": {
      "jvc": 9,
      "business-bay": 9,
      "silicon-oasis": 9,
      "al-qusais": 9,
      "tikom": 9
    }
  },
  {
    "id": "amstel-light-slim-can-35",
    "name": "AMSTEL LIGHT Slim Can 35",
    "price": 200,
    "norm": 5,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 12,
      "business-bay": 12,
      "silicon-oasis": 12,
      "al-qusais": 12,
      "tikom": 12
    },
    "numbersByPoint": {
      "jvc": 10,
      "business-bay": 10,
      "silicon-oasis": 10,
      "al-qusais": 10,
      "tikom": 10
    }
  },
  {
    "id": "corona-beer-btl-35-5cl",
    "name": "CORONA BEER BTL 35.5CL",
    "price": 300,
    "norm": 10,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 13,
      "business-bay": 13,
      "silicon-oasis": 13,
      "al-qusais": 13,
      "tikom": 13
    },
    "numbersByPoint": {
      "jvc": 11,
      "business-bay": 11,
      "silicon-oasis": 11,
      "al-qusais": 11,
      "tikom": 11
    }
  },
  {
    "id": "stella-33cl-btls",
    "name": "STELLA 33CL BTLS",
    "price": 300,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 14,
      "business-bay": 14,
      "silicon-oasis": 14,
      "al-qusais": 14,
      "tikom": 14
    },
    "numbersByPoint": {
      "jvc": 12,
      "business-bay": 12,
      "silicon-oasis": 12,
      "al-qusais": 12,
      "tikom": 12
    }
  },
  {
    "id": "stella-artois-33-cl-cans",
    "name": "STELLA ARTOIS 33 CL cans",
    "price": 200,
    "norm": 5,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 15,
      "business-bay": 15,
      "silicon-oasis": 15,
      "al-qusais": 15,
      "tikom": 15
    },
    "numbersByPoint": {
      "jvc": 13,
      "business-bay": 13,
      "silicon-oasis": 13,
      "al-qusais": 13,
      "tikom": 13
    }
  },
  {
    "id": "heineken-beer-btl-33cl",
    "name": "HEINEKEN BEER BTL 33CL",
    "price": 300,
    "norm": 1.5,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 16,
      "business-bay": 16,
      "silicon-oasis": 16,
      "al-qusais": 16,
      "tikom": 16
    },
    "numbersByPoint": {
      "jvc": 14,
      "business-bay": 14,
      "silicon-oasis": 14,
      "al-qusais": 14,
      "tikom": 14
    }
  },
  {
    "id": "budweiser-berr-btl-33cl",
    "name": "BUDWEISER BERR BTL 33cl",
    "price": 300,
    "norm": 1.5,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 17,
      "business-bay": 17,
      "silicon-oasis": 17,
      "al-qusais": 17,
      "tikom": 17
    },
    "numbersByPoint": {
      "jvc": 15,
      "business-bay": 15,
      "silicon-oasis": 15,
      "al-qusais": 15,
      "tikom": 15
    }
  },
  {
    "id": "smirnoff-ice-red-27-5cl",
    "name": "SMIRNOFF ICE RED 27,5CL",
    "price": 300,
    "norm": 1.5,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 18,
      "business-bay": 18,
      "silicon-oasis": 18,
      "al-qusais": 18,
      "tikom": 18
    },
    "numbersByPoint": {
      "jvc": 16,
      "business-bay": 16,
      "silicon-oasis": 16,
      "al-qusais": 16,
      "tikom": 16
    }
  },
  {
    "id": "peroni-nastro-azuro-beer",
    "name": "PERONI NASTRO AZURO BEER",
    "price": 300,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 19,
      "business-bay": 19,
      "silicon-oasis": 19,
      "al-qusais": 19,
      "tikom": 19
    },
    "numbersByPoint": {
      "jvc": 17,
      "business-bay": 17,
      "silicon-oasis": 17,
      "al-qusais": 17,
      "tikom": 17
    }
  },
  {
    "id": "jc-chardonnay-75cl",
    "name": "JC CHARDONNAY 75CL",
    "price": 100,
    "norm": 20,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 20,
      "business-bay": 20,
      "silicon-oasis": 20,
      "al-qusais": 20,
      "tikom": 20
    },
    "numbersByPoint": {
      "jvc": 18,
      "business-bay": 18,
      "silicon-oasis": 18,
      "al-qusais": 18,
      "tikom": 18
    }
  },
  {
    "id": "jc-shiraz-cabarnet-75cl",
    "name": "JC SHIRAZ CABARNET 75CL",
    "price": 100,
    "norm": 20,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 21,
      "business-bay": 21,
      "silicon-oasis": 21,
      "al-qusais": 21,
      "tikom": 21
    },
    "numbersByPoint": {
      "jvc": 19,
      "business-bay": 19,
      "silicon-oasis": 19,
      "al-qusais": 19,
      "tikom": 19
    }
  },
  {
    "id": "ces-pinot-grig-d-ven-fio",
    "name": "CES PINOT GRIG D VEN FIO",
    "price": 100,
    "norm": 20,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 22,
      "business-bay": 22,
      "silicon-oasis": 22,
      "al-qusais": 22,
      "tikom": 22
    },
    "numbersByPoint": {
      "jvc": 20,
      "business-bay": 20,
      "silicon-oasis": 20,
      "al-qusais": 20,
      "tikom": 20
    }
  },
  {
    "id": "le-grand-noir-sauv-blanc",
    "name": "Le GRAND Noir SAUV BLANC",
    "price": 100,
    "norm": 20,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 23,
      "business-bay": 23,
      "silicon-oasis": 23,
      "al-qusais": 23,
      "tikom": 23
    },
    "numbersByPoint": {
      "jvc": 21,
      "business-bay": 21,
      "silicon-oasis": 21,
      "al-qusais": 21,
      "tikom": 21
    }
  },
  {
    "id": "le-grand-noir-merlot-75c",
    "name": "Le GRAND Noir MERLOT 75C",
    "price": 100,
    "norm": 15,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 24,
      "business-bay": 24,
      "silicon-oasis": 24,
      "al-qusais": 24,
      "tikom": 24
    },
    "numbersByPoint": {
      "jvc": 22,
      "business-bay": 22,
      "silicon-oasis": 22,
      "al-qusais": 22,
      "tikom": 22
    }
  },
  {
    "id": "mip-collection-rose-provienc-7",
    "name": "MIP Collection ROSE Provienc 7",
    "price": 150,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 25,
      "business-bay": 25,
      "silicon-oasis": 25,
      "al-qusais": 25,
      "tikom": 25
    },
    "numbersByPoint": {
      "jvc": 23,
      "business-bay": 23,
      "silicon-oasis": 23,
      "al-qusais": 23,
      "tikom": 23
    }
  },
  {
    "id": "ch-ksara-sunset-rose-75c",
    "name": "CH KSARA SUNSET ROSE 75C",
    "price": 100,
    "norm": 15,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 26,
      "business-bay": 26,
      "silicon-oasis": 26,
      "al-qusais": 26,
      "tikom": 26
    },
    "numbersByPoint": {
      "jvc": 24,
      "business-bay": 24,
      "silicon-oasis": 24,
      "al-qusais": 24,
      "tikom": 24
    }
  },
  {
    "id": "mateus-rose-75cl",
    "name": "MATEUS ROSE 75CL",
    "price": 100,
    "norm": 15,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 27,
      "business-bay": 27,
      "silicon-oasis": 27,
      "al-qusais": 27,
      "tikom": 27
    },
    "numbersByPoint": {
      "jvc": 25,
      "business-bay": 25,
      "silicon-oasis": 25,
      "al-qusais": 25,
      "tikom": 25
    }
  },
  {
    "id": "bacardi-white-rum-ltr",
    "name": "BACARDI WHITE RUM LTR",
    "price": 100,
    "norm": 15,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 28,
      "business-bay": 28,
      "silicon-oasis": 28,
      "al-qusais": 28,
      "tikom": 28
    },
    "numbersByPoint": {
      "jvc": 26,
      "business-bay": 26,
      "silicon-oasis": 26,
      "al-qusais": 26,
      "tikom": 26
    }
  },
  {
    "id": "bacardi-black-1-ltr",
    "name": "BACARDI BLACK. 1 LTR",
    "price": 100,
    "norm": 6,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 29,
      "business-bay": 29,
      "silicon-oasis": 29,
      "al-qusais": 29,
      "tikom": 29
    },
    "numbersByPoint": {
      "jvc": 27,
      "business-bay": 27,
      "silicon-oasis": 27,
      "al-qusais": 27,
      "tikom": 27
    }
  },
  {
    "id": "bacardi-gold-ltr",
    "name": "BACARDI GOLD LTR",
    "price": 100,
    "norm": 8,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 30,
      "business-bay": 30,
      "silicon-oasis": 30,
      "al-qusais": 30,
      "tikom": 30
    },
    "numbersByPoint": {
      "jvc": 28,
      "business-bay": 28,
      "silicon-oasis": 28,
      "al-qusais": 28,
      "tikom": 28
    }
  },
  {
    "id": "jose-cuervo-gold-ltr",
    "name": "JOSE CUERVO GOLD LTR",
    "price": 100,
    "norm": 10,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 31,
      "business-bay": 31,
      "silicon-oasis": 31,
      "al-qusais": 31,
      "tikom": 31
    },
    "numbersByPoint": {
      "jvc": 29,
      "business-bay": 29,
      "silicon-oasis": 29,
      "al-qusais": 29,
      "tikom": 29
    }
  },
  {
    "id": "jose-cuervo-silver-espec",
    "name": "JOSE CUERVO SILVER Espec",
    "price": 100,
    "norm": 10,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 32,
      "business-bay": 32,
      "silicon-oasis": 32,
      "al-qusais": 32,
      "tikom": 32
    },
    "numbersByPoint": {
      "jvc": 30,
      "business-bay": 30,
      "silicon-oasis": 30,
      "al-qusais": 30,
      "tikom": 30
    }
  },
  {
    "id": "tanqueray-gin-ltr",
    "name": "TANQUERAY GIN LTR",
    "price": 200,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 33,
      "business-bay": 33,
      "silicon-oasis": 33,
      "al-qusais": 33,
      "tikom": 33
    },
    "numbersByPoint": {
      "jvc": 31,
      "business-bay": 31,
      "silicon-oasis": 31,
      "al-qusais": 31,
      "tikom": 31
    }
  },
  {
    "id": "gordons-pink-gin-ltr",
    "name": "GORDONS PINK GIN Ltr",
    "price": 150,
    "norm": 6,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 34,
      "business-bay": 34,
      "silicon-oasis": 34,
      "al-qusais": 34,
      "tikom": 34
    },
    "numbersByPoint": {
      "jvc": 32,
      "business-bay": 32,
      "silicon-oasis": 32,
      "al-qusais": 32,
      "tikom": 32
    }
  },
  {
    "id": "gordons-gin-ltr",
    "name": "GORDONS GIN LTR",
    "price": 100,
    "norm": 12,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 35,
      "business-bay": 35,
      "silicon-oasis": 35,
      "al-qusais": 35,
      "tikom": 35
    },
    "numbersByPoint": {
      "jvc": 33,
      "business-bay": 33,
      "silicon-oasis": 33,
      "al-qusais": 33,
      "tikom": 33
    }
  },
  {
    "id": "bombay-sapphire-gin-ltr",
    "name": "BOMBAY SAPPHIRE GIN LTR",
    "price": 150,
    "norm": 12,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 36,
      "business-bay": 36,
      "silicon-oasis": 36,
      "al-qusais": 36,
      "tikom": 36
    },
    "numbersByPoint": {
      "jvc": 34,
      "business-bay": 34,
      "silicon-oasis": 34,
      "al-qusais": 34,
      "tikom": 34
    }
  },
  {
    "id": "hendricks-gin-1-ltr",
    "name": "HENDRICKS GIN 1 LTR",
    "price": 250,
    "norm": 10,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 37,
      "business-bay": 37,
      "silicon-oasis": 37,
      "al-qusais": 37,
      "tikom": 37
    },
    "numbersByPoint": {
      "jvc": 35,
      "business-bay": 35,
      "silicon-oasis": 35,
      "al-qusais": 35,
      "tikom": 35
    }
  },
  {
    "id": "captain-morgan-blk-ltr",
    "name": "CAPTAIN MORGAN BLK LTR",
    "price": 150,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 38,
      "business-bay": 38,
      "silicon-oasis": 38,
      "al-qusais": 38,
      "tikom": 38
    },
    "numbersByPoint": {
      "jvc": 36,
      "business-bay": 36,
      "silicon-oasis": 36,
      "al-qusais": 36,
      "tikom": 36
    }
  },
  {
    "id": "captain-morgan-spiced-go",
    "name": "CAPTAIN MORGAN SPICED GO",
    "price": 150,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 39,
      "business-bay": 39,
      "silicon-oasis": 39,
      "al-qusais": 39,
      "tikom": 39
    },
    "numbersByPoint": {
      "jvc": 37,
      "business-bay": 37,
      "silicon-oasis": 37,
      "al-qusais": 37,
      "tikom": 37
    }
  },
  {
    "id": "malibu-whithe-rum-ltr",
    "name": "MALIBU WHITHE RUM LTR",
    "price": 150,
    "norm": 5,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 40,
      "business-bay": 40,
      "silicon-oasis": 40,
      "al-qusais": 40,
      "tikom": 40
    },
    "numbersByPoint": {
      "jvc": 38,
      "business-bay": 38,
      "silicon-oasis": 38,
      "al-qusais": 38,
      "tikom": 38
    }
  },
  {
    "id": "baileys-irish-cream-ltr",
    "name": "BAILEYS IRISH CREAM LTR",
    "price": 150,
    "norm": 6,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 41,
      "business-bay": 41,
      "silicon-oasis": 41,
      "al-qusais": 41,
      "tikom": 41
    },
    "numbersByPoint": {
      "jvc": 39,
      "business-bay": 39,
      "silicon-oasis": 39,
      "al-qusais": 39,
      "tikom": 39
    }
  },
  {
    "id": "amarula-cream-ltr",
    "name": "AMARULA CREAM LTR",
    "price": 150,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 42,
      "business-bay": 42,
      "silicon-oasis": 42,
      "al-qusais": 42,
      "tikom": 42
    },
    "numbersByPoint": {
      "jvc": 40,
      "business-bay": 40,
      "silicon-oasis": 40,
      "al-qusais": 40,
      "tikom": 40
    }
  },
  {
    "id": "jameson-irish-wsk-ltr",
    "name": "JAMESON IRISH WSK LTR",
    "price": 200,
    "norm": 10,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 43,
      "business-bay": 43,
      "silicon-oasis": 43,
      "al-qusais": 43,
      "tikom": 43
    },
    "numbersByPoint": {
      "jvc": 41,
      "business-bay": 41,
      "silicon-oasis": 41,
      "al-qusais": 41,
      "tikom": 41
    }
  },
  {
    "id": "j-b-rare-scotch-1-ltr",
    "name": "J&B RARE SCOTCH 1 LTR",
    "price": 150,
    "norm": 10,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 44,
      "business-bay": 44,
      "silicon-oasis": 44,
      "al-qusais": 44,
      "tikom": 44
    },
    "numbersByPoint": {
      "jvc": 42,
      "business-bay": 42,
      "silicon-oasis": 42,
      "al-qusais": 42,
      "tikom": 42
    }
  },
  {
    "id": "d-h-clarnet-select-5ltr",
    "name": "D/H CLARNET SELECT 5LTR",
    "price": 200,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 45,
      "business-bay": 45,
      "silicon-oasis": 45,
      "al-qusais": 45,
      "tikom": 45
    },
    "numbersByPoint": {
      "jvc": 43,
      "business-bay": 43,
      "silicon-oasis": 43,
      "al-qusais": 43,
      "tikom": 43
    }
  },
  {
    "id": "d-h-prem-grn-cru-5ltr",
    "name": "D/H PREM GRN CRU 5LTR",
    "price": 200,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 46,
      "business-bay": 46,
      "silicon-oasis": 46,
      "al-qusais": 46,
      "tikom": 46
    },
    "numbersByPoint": {
      "jvc": 44,
      "business-bay": 44,
      "silicon-oasis": 44,
      "al-qusais": 44,
      "tikom": 44
    }
  },
  {
    "id": "martini-bianco-1-ltr",
    "name": "MARTINI BIANCO 1 LTR",
    "price": 150,
    "norm": 7,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 47,
      "business-bay": 47,
      "silicon-oasis": 47,
      "al-qusais": 47,
      "tikom": 47
    },
    "numbersByPoint": {
      "jvc": 45,
      "business-bay": 45,
      "silicon-oasis": 45,
      "al-qusais": 45,
      "tikom": 45
    }
  },
  {
    "id": "smirnoff-r-l-1-ltr",
    "name": "SMIRNOFF R/L 1 LTR",
    "price": 100,
    "norm": 8,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 48,
      "business-bay": 48,
      "silicon-oasis": 48,
      "al-qusais": 48,
      "tikom": 48
    },
    "numbersByPoint": {
      "jvc": 46,
      "business-bay": 46,
      "silicon-oasis": 46,
      "al-qusais": 46,
      "tikom": 46
    }
  },
  {
    "id": "stolichnaya-vodka-ltr",
    "name": "STOLICHNAYA VODKA LTR",
    "price": 100,
    "norm": 8,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 49,
      "business-bay": 49,
      "silicon-oasis": 49,
      "al-qusais": 49,
      "tikom": 49
    },
    "numbersByPoint": {
      "jvc": 47,
      "business-bay": 47,
      "silicon-oasis": 47,
      "al-qusais": 47,
      "tikom": 47
    }
  },
  {
    "id": "russian-std-peters-l",
    "name": "RUSSIAN STD. PETERS L",
    "price": 150,
    "norm": 6,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 50,
      "business-bay": 50,
      "silicon-oasis": 50,
      "al-qusais": 50,
      "tikom": 50
    },
    "numbersByPoint": {
      "jvc": 48,
      "business-bay": 48,
      "silicon-oasis": 48,
      "al-qusais": 48,
      "tikom": 48
    }
  },
  {
    "id": "jagermeister-1-ltr",
    "name": "JAGERMEISTER  1 LTR",
    "price": 200,
    "norm": 10,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 51,
      "business-bay": 51,
      "silicon-oasis": 51,
      "al-qusais": 51,
      "tikom": 51
    },
    "numbersByPoint": {
      "jvc": 49,
      "business-bay": 49,
      "silicon-oasis": 49,
      "al-qusais": 49,
      "tikom": 49
    }
  },
  {
    "id": "belvedere-vodka-ltr",
    "name": "BELVEDERE VODKA  LTR",
    "price": 200,
    "norm": 10,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 52,
      "business-bay": 52,
      "silicon-oasis": 52,
      "al-qusais": 52,
      "tikom": 52
    },
    "numbersByPoint": {
      "jvc": 50,
      "business-bay": 50,
      "silicon-oasis": 50,
      "al-qusais": 50,
      "tikom": 50
    }
  },
  {
    "id": "grey-goose-vodka-ltr",
    "name": "GREY GOOSE VODKA LTR",
    "price": 200,
    "norm": 15,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 53,
      "business-bay": 53,
      "silicon-oasis": 53,
      "al-qusais": 53,
      "tikom": 53
    },
    "numbersByPoint": {
      "jvc": 51,
      "business-bay": 51,
      "silicon-oasis": 51,
      "al-qusais": 51,
      "tikom": 51
    }
  },
  {
    "id": "beluga-noble-vodka-70cl",
    "name": "BELUGA  NOBLE VODKA 70CL",
    "price": 250,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 54,
      "business-bay": 54,
      "silicon-oasis": 54,
      "al-qusais": 54,
      "tikom": 54
    },
    "numbersByPoint": {
      "jvc": 52,
      "business-bay": 52,
      "silicon-oasis": 52,
      "al-qusais": 52,
      "tikom": 52
    }
  },
  {
    "id": "cirok-vodka-ltr",
    "name": "CIROK VODKA LTR",
    "price": 300,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 55,
      "business-bay": 55,
      "silicon-oasis": 55,
      "al-qusais": 55,
      "tikom": 55
    },
    "numbersByPoint": {
      "jvc": 53,
      "business-bay": 53,
      "silicon-oasis": 53,
      "al-qusais": 53,
      "tikom": 53
    }
  },
  {
    "id": "skyy-vodka-1-ltr",
    "name": "SKYY VODKA 1 LTR",
    "price": 150,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 56,
      "business-bay": 56,
      "silicon-oasis": 56,
      "al-qusais": 56,
      "tikom": 56
    },
    "numbersByPoint": {
      "jvc": 54,
      "business-bay": 54,
      "silicon-oasis": 54,
      "al-qusais": 54,
      "tikom": 54
    }
  },
  {
    "id": "arak-touma-50-54cl",
    "name": "ARAK TOUMA 50/54CL",
    "price": 100,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 57,
      "business-bay": 57,
      "silicon-oasis": 57,
      "al-qusais": 57,
      "tikom": 57
    },
    "numbersByPoint": {
      "jvc": 55,
      "business-bay": 55,
      "silicon-oasis": 55,
      "al-qusais": 55,
      "tikom": 55
    }
  },
  {
    "id": "efe-fresh-grape-raki-ltr-green",
    "name": "EFE Fresh Grape RAKI LTR Green",
    "price": 150,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 58,
      "business-bay": 58,
      "silicon-oasis": 58,
      "al-qusais": 58,
      "tikom": 58
    },
    "numbersByPoint": {
      "jvc": 56,
      "business-bay": 56,
      "silicon-oasis": 56,
      "al-qusais": 56,
      "tikom": 56
    }
  },
  {
    "id": "j-w-gold-label-reserv-1",
    "name": "J/W GOLD LABEL RESERV 1",
    "price": 350,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 59,
      "business-bay": 59,
      "silicon-oasis": 59,
      "al-qusais": 59,
      "tikom": 59
    },
    "numbersByPoint": {
      "jvc": 57,
      "business-bay": 57,
      "silicon-oasis": 57,
      "al-qusais": 57,
      "tikom": 57
    }
  },
  {
    "id": "j-w-double-black-ltr",
    "name": "J/W DOUBLE BLACK LTR",
    "price": 250,
    "norm": 6,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 60,
      "business-bay": 60,
      "silicon-oasis": 60,
      "al-qusais": 60,
      "tikom": 60
    },
    "numbersByPoint": {
      "jvc": 58,
      "business-bay": 58,
      "silicon-oasis": 58,
      "al-qusais": 58,
      "tikom": 58
    }
  },
  {
    "id": "j-w-blue-label-1-ltr",
    "name": "J/W BLUE LABEL 1 LTR",
    "price": 1400,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 61,
      "business-bay": 61,
      "silicon-oasis": 61,
      "al-qusais": 61,
      "tikom": 61
    },
    "numbersByPoint": {
      "jvc": 59,
      "business-bay": 59,
      "silicon-oasis": 59,
      "al-qusais": 59,
      "tikom": 59
    }
  },
  {
    "id": "hennessy-vs-ltr",
    "name": "HENNESSY VS LTR",
    "price": 400,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 62,
      "business-bay": 62,
      "silicon-oasis": 62,
      "al-qusais": 62,
      "tikom": 62
    },
    "numbersByPoint": {
      "jvc": 60,
      "business-bay": 60,
      "silicon-oasis": 60,
      "al-qusais": 60,
      "tikom": 60
    }
  },
  {
    "id": "hennessy-v-s-o-p-1-ltr-pr",
    "name": "HENNESSY V.S.O.P 1 LTR Pr",
    "price": 500,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 63,
      "business-bay": 63,
      "silicon-oasis": 63,
      "al-qusais": 63,
      "tikom": 63
    },
    "numbersByPoint": {
      "jvc": 61,
      "business-bay": 61,
      "silicon-oasis": 61,
      "al-qusais": 61,
      "tikom": 61
    }
  },
  {
    "id": "hennessy-xo-ltr",
    "name": "HENNESSY XO LTR",
    "price": 1600,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 64,
      "business-bay": 64,
      "silicon-oasis": 64,
      "al-qusais": 64,
      "tikom": 64
    },
    "numbersByPoint": {
      "jvc": 62,
      "business-bay": 62,
      "silicon-oasis": 62,
      "al-qusais": 62,
      "tikom": 62
    }
  },
  {
    "id": "remy-martin-vsop-ltr",
    "name": "REMY MARTIN VSOP LTR",
    "price": 400,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 65,
      "business-bay": 65,
      "silicon-oasis": 65,
      "al-qusais": 65,
      "tikom": 65
    },
    "numbersByPoint": {
      "jvc": 63,
      "business-bay": 63,
      "silicon-oasis": 63,
      "al-qusais": 63,
      "tikom": 63
    }
  },
  {
    "id": "chivas-18-yrs-ltr",
    "name": "CHIVAS 18 YRS LTR",
    "price": 400,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 66,
      "business-bay": 66,
      "silicon-oasis": 66,
      "al-qusais": 66,
      "tikom": 66
    },
    "numbersByPoint": {
      "jvc": 64,
      "business-bay": 64,
      "silicon-oasis": 64,
      "al-qusais": 64,
      "tikom": 64
    }
  },
  {
    "id": "royal-salute-21-yrs-ltr",
    "name": "ROYAL SALUTE 21 YRS LTR",
    "price": 1300,
    "norm": 0,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 67,
      "business-bay": 67,
      "silicon-oasis": 67,
      "al-qusais": 67,
      "tikom": 67
    },
    "numbersByPoint": {
      "jvc": 65,
      "business-bay": 65,
      "silicon-oasis": 65,
      "al-qusais": 65,
      "tikom": 65
    }
  },
  {
    "id": "patron-coffe",
    "name": "PATRON COFFE",
    "price": 250,
    "norm": 0,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 68,
      "business-bay": 68,
      "silicon-oasis": 68,
      "al-qusais": 68,
      "tikom": 68
    },
    "numbersByPoint": {
      "jvc": 66,
      "business-bay": 66,
      "silicon-oasis": 66,
      "al-qusais": 66,
      "tikom": 66
    }
  },
  {
    "id": "patron-silver-75cl-tequi",
    "name": "PATRON SILVER  75CL TEQUI",
    "price": 350,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 69,
      "business-bay": 69,
      "silicon-oasis": 69,
      "al-qusais": 69,
      "tikom": 69
    },
    "numbersByPoint": {
      "jvc": 67,
      "business-bay": 67,
      "silicon-oasis": 67,
      "al-qusais": 67,
      "tikom": 67
    }
  },
  {
    "id": "patron-anejo-75cl-gold-t",
    "name": "PATRON ANEJO 75CL GOLD T",
    "price": 400,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 70,
      "business-bay": 70,
      "silicon-oasis": 70,
      "al-qusais": 70,
      "tikom": 70
    },
    "numbersByPoint": {
      "jvc": 68,
      "business-bay": 68,
      "silicon-oasis": 68,
      "al-qusais": 68,
      "tikom": 68
    }
  },
  {
    "id": "don-julio-blanco-70-75cl",
    "name": "DON JULIO BLANCO 70/75CL",
    "price": 400,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 71,
      "business-bay": 71,
      "silicon-oasis": 71,
      "al-qusais": 71,
      "tikom": 71
    },
    "numbersByPoint": {
      "jvc": 69,
      "business-bay": 69,
      "silicon-oasis": 69,
      "al-qusais": 69,
      "tikom": 69
    }
  },
  {
    "id": "don-julio-reposado-70-75",
    "name": "DON JULIO REPOSADO 70/75",
    "price": 450,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 72,
      "business-bay": 72,
      "silicon-oasis": 72,
      "al-qusais": 72,
      "tikom": 72
    },
    "numbersByPoint": {
      "jvc": 70,
      "business-bay": 70,
      "silicon-oasis": 70,
      "al-qusais": 70,
      "tikom": 70
    }
  },
  {
    "id": "don-julio-anejo-70-75cl",
    "name": "DON JULIO ANEJO 70/75CL",
    "price": 550,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 73,
      "business-bay": 73,
      "silicon-oasis": 73,
      "al-qusais": 73,
      "tikom": 73
    },
    "numbersByPoint": {
      "jvc": 71,
      "business-bay": 71,
      "silicon-oasis": 71,
      "al-qusais": 71,
      "tikom": 71
    }
  },
  {
    "id": "don-julio-1942-anejo-70",
    "name": "DON JULIO 1942 ANEJO 70",
    "price": 1600,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 74,
      "business-bay": 74,
      "silicon-oasis": 74,
      "al-qusais": 74,
      "tikom": 74
    },
    "numbersByPoint": {
      "jvc": 72,
      "business-bay": 72,
      "silicon-oasis": 72,
      "al-qusais": 72,
      "tikom": 72
    }
  },
  {
    "id": "asti-martini-75cl",
    "name": "ASTI MARTINI 75CL",
    "price": 150,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 75,
      "business-bay": 75,
      "silicon-oasis": 75,
      "al-qusais": 75,
      "tikom": 75
    },
    "numbersByPoint": {
      "jvc": 73,
      "business-bay": 73,
      "silicon-oasis": 73,
      "al-qusais": 73,
      "tikom": 73
    }
  },
  {
    "id": "jc-chardonnay-pinot-noir",
    "name": "JC CHARDONNAY PINOT NOIR",
    "price": 100,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 76,
      "business-bay": 76,
      "silicon-oasis": 76,
      "al-qusais": 76,
      "tikom": 76
    },
    "numbersByPoint": {
      "jvc": 74,
      "business-bay": 74,
      "silicon-oasis": 74,
      "al-qusais": 74,
      "tikom": 74
    }
  },
  {
    "id": "bottega-vino-d-poet-pros",
    "name": "BOTTEGA VINO D POET PROS",
    "price": 150,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 77,
      "business-bay": 77,
      "silicon-oasis": 77,
      "al-qusais": 77,
      "tikom": 77
    },
    "numbersByPoint": {
      "jvc": 75,
      "business-bay": 75,
      "silicon-oasis": 75,
      "al-qusais": 75,
      "tikom": 75
    }
  },
  {
    "id": "bottega-rose-proseco-poe",
    "name": "BOTTEGA ROSE Proseco POE",
    "price": 200,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 78,
      "business-bay": 78,
      "silicon-oasis": 78,
      "al-qusais": 78,
      "tikom": 78
    },
    "numbersByPoint": {
      "jvc": 76,
      "business-bay": 76,
      "silicon-oasis": 76,
      "al-qusais": 76,
      "tikom": 76
    }
  },
  {
    "id": "bottega-gold-brut-75c-vi",
    "name": "BOTTEGA GOLD BRUT 75C vi",
    "price": 250,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 79,
      "business-bay": 79,
      "silicon-oasis": 79,
      "al-qusais": 79,
      "tikom": 79
    },
    "numbersByPoint": {
      "jvc": 77,
      "business-bay": 77,
      "silicon-oasis": 77,
      "al-qusais": 77,
      "tikom": 77
    }
  },
  {
    "id": "veuve-clicquot-y-l-ponsr",
    "name": "VEUVE CLICQUOT Y/L PONSR",
    "price": 450,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 80,
      "business-bay": 80,
      "silicon-oasis": 80,
      "al-qusais": 80,
      "tikom": 80
    },
    "numbersByPoint": {
      "jvc": 78,
      "business-bay": 78,
      "silicon-oasis": 78,
      "al-qusais": 78,
      "tikom": 78
    }
  },
  {
    "id": "moet-chandon-brut-imp",
    "name": "MOET & CHANDON BRUT IMP",
    "price": 300,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 81,
      "business-bay": 81,
      "silicon-oasis": 81,
      "al-qusais": 81,
      "tikom": 81
    },
    "numbersByPoint": {
      "jvc": 79,
      "business-bay": 79,
      "silicon-oasis": 79,
      "al-qusais": 79,
      "tikom": 79
    }
  },
  {
    "id": "moet-chandon-rose-75cl",
    "name": "MOET & CHANDON  ROSE 75CL",
    "price": 400,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 82,
      "business-bay": 82,
      "silicon-oasis": 82,
      "al-qusais": 82,
      "tikom": 82
    },
    "numbersByPoint": {
      "jvc": 80,
      "business-bay": 80,
      "silicon-oasis": 80,
      "al-qusais": 80,
      "tikom": 80
    }
  },
  {
    "id": "moet-ice-imperial-75cl",
    "name": "MOET ICE IMPERIAL 75cl",
    "price": 500,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 83,
      "business-bay": 83,
      "silicon-oasis": 83,
      "al-qusais": 83,
      "tikom": 83
    },
    "numbersByPoint": {
      "jvc": 81,
      "business-bay": 81,
      "silicon-oasis": 81,
      "al-qusais": 81,
      "tikom": 81
    }
  },
  {
    "id": "dom-perignon-m-c-75cl",
    "name": "DOM PERIGNON M&C 75CL",
    "price": 1500,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 84,
      "business-bay": 84,
      "silicon-oasis": 84,
      "al-qusais": 84,
      "tikom": 84
    },
    "numbersByPoint": {
      "jvc": 82,
      "business-bay": 82,
      "silicon-oasis": 82,
      "al-qusais": 82,
      "tikom": 82
    }
  },
  {
    "id": "glendfidich-spl-r12yrs",
    "name": "GLENDFIDICH SPL R12YRS",
    "price": 300,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 85,
      "business-bay": 85,
      "silicon-oasis": 85,
      "al-qusais": 85,
      "tikom": 85
    },
    "numbersByPoint": {
      "jvc": 83,
      "business-bay": 83,
      "silicon-oasis": 83,
      "al-qusais": 83,
      "tikom": 83
    }
  },
  {
    "id": "glendfidich-15-yrs-ltr",
    "name": "GLENDFIDICH 15 YRS LTR",
    "price": 400,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 86,
      "business-bay": 86,
      "silicon-oasis": 86,
      "al-qusais": 86,
      "tikom": 86
    },
    "numbersByPoint": {
      "jvc": 84,
      "business-bay": 84,
      "silicon-oasis": 84,
      "al-qusais": 84,
      "tikom": 84
    }
  },
  {
    "id": "glendfidich-18y-smal-bat",
    "name": "GLENDFIDICH 18Y Smal Bat",
    "price": 500,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 87,
      "business-bay": 87,
      "silicon-oasis": 87,
      "al-qusais": 87,
      "tikom": 87
    },
    "numbersByPoint": {
      "jvc": 85,
      "business-bay": 85,
      "silicon-oasis": 85,
      "al-qusais": 85,
      "tikom": 85
    }
  },
  {
    "id": "baron-rimapere-sauv-blan",
    "name": "BARON RIMAPERE SAUV BLAN",
    "price": 200,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 88,
      "business-bay": 88,
      "silicon-oasis": 88,
      "al-qusais": 88,
      "tikom": 88
    },
    "numbersByPoint": {
      "jvc": 86,
      "business-bay": 86,
      "silicon-oasis": 86,
      "al-qusais": 86,
      "tikom": 86
    }
  },
  {
    "id": "marchesi-gavi-d-gavi-75c",
    "name": "MARCHESI GAVI D GAVI 75C",
    "price": 200,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 89,
      "business-bay": 89,
      "silicon-oasis": 89,
      "al-qusais": 89,
      "tikom": 89
    },
    "numbersByPoint": {
      "jvc": 87,
      "business-bay": 87,
      "silicon-oasis": 87,
      "al-qusais": 87,
      "tikom": 87
    }
  },
  {
    "id": "laroche-chablis-st-marti",
    "name": "LAROCHE CHABLIS ST MARTI",
    "price": 200,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 90,
      "business-bay": 90,
      "silicon-oasis": 90,
      "al-qusais": 90,
      "tikom": 90
    },
    "numbersByPoint": {
      "jvc": 88,
      "business-bay": 88,
      "silicon-oasis": 88,
      "al-qusais": 88,
      "tikom": 88
    }
  },
  {
    "id": "l-j-bourgogne-bl-cuv-d-ja",
    "name": "L J BOURGOGNE BL Cuv D ja",
    "price": 200,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 91,
      "business-bay": 91,
      "silicon-oasis": 91,
      "al-qusais": 91,
      "tikom": 91
    },
    "numbersByPoint": {
      "jvc": 89,
      "business-bay": 89,
      "silicon-oasis": 89,
      "al-qusais": 89,
      "tikom": 89
    }
  },
  {
    "id": "castel-ch-barreyres-haut-m-75",
    "name": "CASTEL CH. BARREYRES HAUT M 75",
    "price": 150,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 92,
      "business-bay": 92,
      "silicon-oasis": 92,
      "al-qusais": 92,
      "tikom": 92
    },
    "numbersByPoint": {
      "jvc": 90,
      "business-bay": 90,
      "silicon-oasis": 90,
      "al-qusais": 90,
      "tikom": 90
    }
  },
  {
    "id": "ch-saint-leon-box-sup-75",
    "name": "CH SAINT LEON BOX SUP 75",
    "price": 100,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 93,
      "business-bay": 93,
      "silicon-oasis": 93,
      "al-qusais": 93,
      "tikom": 93
    },
    "numbersByPoint": {
      "jvc": 91,
      "business-bay": 91,
      "silicon-oasis": 91,
      "al-qusais": 91,
      "tikom": 91
    }
  },
  {
    "id": "campo-viejo-reserva-rioj",
    "name": "CAMPO VIEJO RESERVA RIOJ",
    "price": 150,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 94,
      "business-bay": 94,
      "silicon-oasis": 94,
      "al-qusais": 94,
      "tikom": 94
    },
    "numbersByPoint": {
      "jvc": 92,
      "business-bay": 92,
      "silicon-oasis": 92,
      "al-qusais": 92,
      "tikom": 92
    }
  },
  {
    "id": "campo-viejo-gran-reserva",
    "name": "CAMPO VIEJO GRAN RESERVA",
    "price": 200,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 95,
      "business-bay": 95,
      "silicon-oasis": 95,
      "al-qusais": 95,
      "tikom": 95
    },
    "numbersByPoint": {
      "jvc": 93,
      "business-bay": 93,
      "silicon-oasis": 93,
      "al-qusais": 93,
      "tikom": 93
    }
  },
  {
    "id": "m-minuty-rose-provence",
    "name": "M MINUTY ROSE PROVENCE",
    "price": 150,
    "norm": 4,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 96,
      "business-bay": 96,
      "silicon-oasis": 96,
      "al-qusais": 96,
      "tikom": 96
    },
    "numbersByPoint": {
      "jvc": 94,
      "business-bay": 94,
      "silicon-oasis": 94,
      "al-qusais": 94,
      "tikom": 94
    }
  },
  {
    "id": "cav-d-escln-whispering",
    "name": "Cav D ESCLN WHISPERING",
    "price": 200,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 97,
      "business-bay": 97,
      "silicon-oasis": 97,
      "al-qusais": 97,
      "tikom": 97
    },
    "numbersByPoint": {
      "jvc": 95,
      "business-bay": 95,
      "silicon-oasis": 95,
      "al-qusais": 95,
      "tikom": 95
    }
  },
  {
    "id": "jack-daniels-honey-ltr",
    "name": "JACK DANIELS HONEY LTR",
    "price": 250,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 98,
      "business-bay": 98,
      "silicon-oasis": 98,
      "al-qusais": 98,
      "tikom": 98
    },
    "numbersByPoint": {
      "jvc": 96,
      "business-bay": 96,
      "silicon-oasis": 96,
      "al-qusais": 96,
      "tikom": 96
    }
  },
  {
    "id": "baccardi-breezer-w-melon",
    "name": "BACCARDI BREEZER W/MELON",
    "price": 300,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 99,
      "business-bay": 99,
      "silicon-oasis": 99,
      "al-qusais": 99,
      "tikom": 99
    },
    "numbersByPoint": {
      "jvc": 97,
      "business-bay": 97,
      "silicon-oasis": 97,
      "al-qusais": 97,
      "tikom": 97
    }
  },
  {
    "id": "asahi-beer-btls-super-dr",
    "name": "ASAHI BEER BTLS SUPER DR",
    "price": 300,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 100,
      "business-bay": 100,
      "silicon-oasis": 100,
      "al-qusais": 100,
      "tikom": 100
    },
    "numbersByPoint": {
      "jvc": 98,
      "business-bay": 98,
      "silicon-oasis": 98,
      "al-qusais": 98,
      "tikom": 98
    }
  },
  {
    "id": "aperole-aperitivo-ltr",
    "name": "APEROLE Aperitivo LTR",
    "price": 150,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 101,
      "business-bay": 101,
      "silicon-oasis": 101,
      "al-qusais": 101,
      "tikom": 101
    },
    "numbersByPoint": {
      "jvc": 99,
      "business-bay": 99,
      "silicon-oasis": 99,
      "al-qusais": 99,
      "tikom": 99
    }
  },
  {
    "id": "chivas-25-yrs",
    "name": "CHIVAS 25 YRS",
    "price": 1500,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 102,
      "business-bay": 102,
      "silicon-oasis": 102,
      "al-qusais": 102,
      "tikom": 102
    },
    "numbersByPoint": {
      "jvc": 100,
      "business-bay": 100,
      "silicon-oasis": 100,
      "al-qusais": 100,
      "tikom": 100
    }
  },
  {
    "id": "clase-azul-reposado-70-7",
    "name": "CLASE AZUL Reposado 70/7",
    "price": 1800,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 103,
      "business-bay": 103,
      "silicon-oasis": 103,
      "al-qusais": 103,
      "tikom": 103
    },
    "numbersByPoint": {
      "jvc": 101,
      "business-bay": 101,
      "silicon-oasis": 101,
      "al-qusais": 101,
      "tikom": 101
    }
  },
  {
    "id": "ms-ch-perron-lalande-d-pomerol",
    "name": "MS CH PERRON LALANDE D POMEROL",
    "price": 200,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 104,
      "business-bay": 104,
      "silicon-oasis": 104,
      "al-qusais": 104,
      "tikom": 104
    },
    "numbersByPoint": {
      "jvc": 102,
      "business-bay": 102,
      "silicon-oasis": 102,
      "al-qusais": 102,
      "tikom": 102
    }
  },
  {
    "id": "la-celia-reserva-malbec-75cl",
    "name": "LA CELIA RESERVA MALBEC 75CL",
    "price": 150,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 105,
      "business-bay": 105,
      "silicon-oasis": 105,
      "al-qusais": 105,
      "tikom": 105
    },
    "numbersByPoint": {
      "jvc": 103,
      "business-bay": 103,
      "silicon-oasis": 103,
      "al-qusais": 103,
      "tikom": 103
    }
  },
  {
    "id": "calvet-sancerre-les-hautes",
    "name": "CALVET SANCERRE Les Hautes",
    "price": 150,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 106,
      "business-bay": 106,
      "silicon-oasis": 106,
      "al-qusais": 106,
      "tikom": 106
    },
    "numbersByPoint": {
      "jvc": 104,
      "business-bay": 104,
      "silicon-oasis": 104,
      "al-qusais": 104,
      "tikom": 104
    }
  },
  {
    "id": "chateau-des-laurets-saint-emilion",
    "name": "CHATEAU des LAURETS Saint Emilion",
    "price": 200,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 107,
      "business-bay": 107,
      "silicon-oasis": 107,
      "al-qusais": 107,
      "tikom": 107
    },
    "numbersByPoint": {
      "jvc": 105,
      "business-bay": 105,
      "silicon-oasis": 105,
      "al-qusais": 105,
      "tikom": 105
    }
  },
  {
    "id": "guinness-beer-cans-44cl",
    "name": "GUINNESS BEER CANS 44cl",
    "price": 400,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 108,
      "business-bay": 108,
      "silicon-oasis": 108,
      "al-qusais": 108,
      "tikom": 108
    },
    "numbersByPoint": {
      "jvc": 106,
      "business-bay": 106,
      "silicon-oasis": 106,
      "al-qusais": 106,
      "tikom": 106
    }
  },
  {
    "id": "xxl-vodka-mix-energy-can",
    "name": "XXL  VODKA MIX ENERGY CAN",
    "price": 200,
    "norm": 5,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 109,
      "business-bay": 109,
      "silicon-oasis": 109,
      "al-qusais": 109,
      "tikom": 109
    },
    "numbersByPoint": {
      "jvc": 107,
      "business-bay": 107,
      "silicon-oasis": 107,
      "al-qusais": 107,
      "tikom": 107
    }
  },
  {
    "id": "monkey-47-dry-gin-50cl",
    "name": "MONKEY 47  DRY GIN 50CL",
    "price": 350,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 110,
      "business-bay": 110,
      "silicon-oasis": 110,
      "al-qusais": 110,
      "tikom": 110
    },
    "numbersByPoint": {
      "jvc": 108,
      "business-bay": 108,
      "silicon-oasis": 108,
      "al-qusais": 108,
      "tikom": 108
    }
  },
  {
    "id": "gentleman-jack-1-ltr-jd",
    "name": "GENTLEMAN JACK 1 LTR JD",
    "price": 250,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 111,
      "business-bay": 111,
      "silicon-oasis": 111,
      "al-qusais": 111,
      "tikom": 111
    },
    "numbersByPoint": {
      "jvc": 109,
      "business-bay": 109,
      "silicon-oasis": 109,
      "al-qusais": 109,
      "tikom": 109
    }
  },
  {
    "id": "macallan-12-yr-fin-trip",
    "name": "MACALLAN 12 YR FIN TRIP",
    "price": 550,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 112,
      "business-bay": 112,
      "silicon-oasis": 112,
      "al-qusais": 112,
      "tikom": 112
    },
    "numbersByPoint": {
      "jvc": 110,
      "business-bay": 110,
      "silicon-oasis": 110,
      "al-qusais": 110,
      "tikom": 110
    }
  },
  {
    "id": "macallan-15-yrs-double-ca",
    "name": "MACALLAN 15 YRS Double Ca",
    "price": 800,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 113,
      "business-bay": 113,
      "silicon-oasis": 113,
      "al-qusais": 113,
      "tikom": 113
    },
    "numbersByPoint": {
      "jvc": 111,
      "business-bay": 111,
      "silicon-oasis": 111,
      "al-qusais": 111,
      "tikom": 111
    }
  },
  {
    "id": "macallan-18-yrs",
    "name": "MACALLAN 18 YRS",
    "price": 2000,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 114,
      "business-bay": 114,
      "silicon-oasis": 114,
      "al-qusais": 114,
      "tikom": 114
    },
    "numbersByPoint": {
      "jvc": 112,
      "business-bay": 112,
      "silicon-oasis": 112,
      "al-qusais": 112,
      "tikom": 112
    }
  },
  {
    "id": "hoegarden-blanche-33cl-b",
    "name": "HOEGARDEN BLANCHE 33CL B",
    "price": 300,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 115,
      "business-bay": 115,
      "silicon-oasis": 115,
      "al-qusais": 115,
      "tikom": 115
    },
    "numbersByPoint": {
      "jvc": 113,
      "business-bay": 113,
      "silicon-oasis": 113,
      "al-qusais": 113,
      "tikom": 113
    }
  },
  {
    "id": "tequila-rose-liquer-70c-s-bery",
    "name": "TEQUILA ROSE LIQUER 70C S/Bery",
    "price": 200,
    "norm": 0,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 116,
      "business-bay": 116,
      "silicon-oasis": 116,
      "al-qusais": 116,
      "tikom": 116
    },
    "numbersByPoint": {
      "jvc": 114,
      "business-bay": 114,
      "silicon-oasis": 114,
      "al-qusais": 114,
      "tikom": 114
    }
  },
  {
    "id": "malfy-con-ara-blood-orange-gin-70",
    "name": "MALFY Con Ara Blood Orange GIN 70",
    "price": 250,
    "norm": 0,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 117,
      "business-bay": 117,
      "silicon-oasis": 117,
      "al-qusais": 117,
      "tikom": 117
    },
    "numbersByPoint": {
      "jvc": 115,
      "business-bay": 115,
      "silicon-oasis": 115,
      "al-qusais": 115,
      "tikom": 115
    }
  },
  {
    "id": "malfy-gin-rosa-70cl-grapfruite",
    "name": "MALFY GIN ROSA 70cl GrapfruitE",
    "price": 250,
    "norm": 0,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 118,
      "business-bay": 118,
      "silicon-oasis": 118,
      "al-qusais": 118,
      "tikom": 118
    },
    "numbersByPoint": {
      "jvc": 116,
      "business-bay": 116,
      "silicon-oasis": 116,
      "al-qusais": 116,
      "tikom": 116
    }
  },
  {
    "id": "drumshanb-gunpoder-gin",
    "name": "Drumshanb GUNPODER GIN",
    "price": 250,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 119,
      "business-bay": 119,
      "silicon-oasis": 119,
      "al-qusais": 119,
      "tikom": 119
    },
    "numbersByPoint": {
      "jvc": 117,
      "business-bay": 117,
      "silicon-oasis": 117,
      "al-qusais": 117,
      "tikom": 117
    }
  },
  {
    "id": "ch-saint-maur-l-exelenc-ros-7",
    "name": "CH SAINT MAUR L Exelenc ROS 7",
    "price": 250,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 120,
      "business-bay": 120,
      "silicon-oasis": 120,
      "al-qusais": 120,
      "tikom": 120
    },
    "numbersByPoint": {
      "jvc": 118,
      "business-bay": 118,
      "silicon-oasis": 118,
      "al-qusais": 118,
      "tikom": 118
    }
  },
  {
    "id": "ch-lagrange-2010-st-julien",
    "name": "CH LAGRANGE 2010 St Julien",
    "price": 750,
    "norm": 1,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 121,
      "business-bay": 121,
      "silicon-oasis": 121,
      "al-qusais": 121,
      "tikom": 121
    },
    "numbersByPoint": {
      "jvc": 119,
      "business-bay": 119,
      "silicon-oasis": 119,
      "al-qusais": 119,
      "tikom": 119
    }
  },
  {
    "id": "ruinart-blanc-d-blanc-75-cl",
    "name": "RUINART BLANC D BLANC 75 CL",
    "price": 800,
    "norm": 3,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 122,
      "business-bay": 122,
      "silicon-oasis": 122,
      "al-qusais": 122,
      "tikom": 122
    },
    "numbersByPoint": {
      "jvc": 120,
      "business-bay": 120,
      "silicon-oasis": 120,
      "al-qusais": 120,
      "tikom": 120
    }
  },
  {
    "id": "zonin-prosecco-75cl",
    "name": "ZONIN PROSECCO 75CL",
    "price": 150,
    "norm": 2,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 123,
      "business-bay": 123,
      "silicon-oasis": 123,
      "al-qusais": 123,
      "tikom": 123
    },
    "numbersByPoint": {
      "jvc": 121,
      "business-bay": 121,
      "silicon-oasis": 121,
      "al-qusais": 121,
      "tikom": 121
    }
  },
  {
    "id": "oyster-bay-sauvignon",
    "name": "OYSTER BAY SAUVIGNON",
    "price": 150,
    "norm": 6,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "jvc",
      "business-bay",
      "silicon-oasis",
      "al-qusais",
      "tikom"
    ],
    "excelRowsByPoint": {
      "jvc": 124,
      "business-bay": 124,
      "silicon-oasis": 124,
      "al-qusais": 124,
      "tikom": 124
    },
    "numbersByPoint": {
      "jvc": 122,
      "business-bay": 122,
      "silicon-oasis": 122,
      "al-qusais": 122,
      "tikom": 122
    }
  },
  {
    "id": "balantines",
    "name": "BALANTINES",
    "price": 100,
    "norm": 7,
    "category": "Товары из шаблона",
    "active": true,
    "pointIds": [
      "business-bay",
      "al-qusais"
    ],
    "excelRowsByPoint": {
      "business-bay": 125,
      "al-qusais": 125
    },
    "numbersByPoint": {
      "business-bay": 123,
      "al-qusais": 123
    }
  }
];

export const TEMPLATE_REPORTS: DailyReport[] = [
  {
    "id": "2026-05-28_jvc",
    "date": "2026-05-28",
    "pointId": "jvc",
    "driverId": "",
    "driverName": "Фаррух",
    "items": {
      "absolut-blue-ltr": {
        "productId": "absolut-blue-ltr",
        "previousRest": 7,
        "incoming": 23,
        "movement": 0,
        "homeRest": 24,
        "extraRequest": 0
      },
      "j-w-red-label-1-ltr": {
        "productId": "j-w-red-label-1-ltr",
        "previousRest": 17,
        "incoming": 13,
        "movement": 0,
        "homeRest": 28,
        "extraRequest": 0
      },
      "j-w-blak-label-1-ltr": {
        "productId": "j-w-blak-label-1-ltr",
        "previousRest": 8,
        "incoming": 6,
        "movement": 0,
        "homeRest": 13,
        "extraRequest": 0
      },
      "jack-daniels-ltr": {
        "productId": "jack-daniels-ltr",
        "previousRest": 6,
        "incoming": 4,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "chivas-regal-1-ltr": {
        "productId": "chivas-regal-1-ltr",
        "previousRest": 26,
        "incoming": 10,
        "movement": 0,
        "homeRest": 35,
        "extraRequest": 0
      },
      "heineken-beer-cans-33cl": {
        "productId": "heineken-beer-cans-33cl",
        "previousRest": 1,
        "incoming": 6,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "budweiser-beer-can-33-35": {
        "productId": "budweiser-beer-can-33-35",
        "previousRest": 4.5,
        "incoming": 3.5,
        "movement": 0,
        "homeRest": 7.5,
        "extraRequest": 0
      },
      "carlsberg-50cl-can": {
        "productId": "carlsberg-50cl-can",
        "previousRest": 2.5,
        "incoming": 4.5,
        "movement": 0,
        "homeRest": 4.5,
        "extraRequest": 0
      },
      "red-horse-50cl-can": {
        "productId": "red-horse-50cl-can",
        "previousRest": 7.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7.5,
        "extraRequest": 0
      },
      "amstel-light-slim-can-35": {
        "productId": "amstel-light-slim-can-35",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "corona-beer-btl-35-5cl": {
        "productId": "corona-beer-btl-35-5cl",
        "previousRest": 2,
        "incoming": 6,
        "movement": 0,
        "homeRest": 7.5,
        "extraRequest": 0
      },
      "stella-33cl-btls": {
        "productId": "stella-33cl-btls",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "stella-artois-33-cl-cans": {
        "productId": "stella-artois-33-cl-cans",
        "previousRest": 0.5,
        "incoming": 1.5,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "heineken-beer-btl-33cl": {
        "productId": "heineken-beer-btl-33cl",
        "previousRest": 1,
        "incoming": 1,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "budweiser-berr-btl-33cl": {
        "productId": "budweiser-berr-btl-33cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "smirnoff-ice-red-27-5cl": {
        "productId": "smirnoff-ice-red-27-5cl",
        "previousRest": 1.5,
        "incoming": 0.5,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "peroni-nastro-azuro-beer": {
        "productId": "peroni-nastro-azuro-beer",
        "previousRest": 0.5,
        "incoming": 1.5,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "jc-chardonnay-75cl": {
        "productId": "jc-chardonnay-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "jc-shiraz-cabarnet-75cl": {
        "productId": "jc-shiraz-cabarnet-75cl",
        "previousRest": 15,
        "incoming": 0,
        "movement": 0,
        "homeRest": 14,
        "extraRequest": 0
      },
      "ces-pinot-grig-d-ven-fio": {
        "productId": "ces-pinot-grig-d-ven-fio",
        "previousRest": 7,
        "incoming": 13,
        "movement": 0,
        "homeRest": 20,
        "extraRequest": 0
      },
      "le-grand-noir-sauv-blanc": {
        "productId": "le-grand-noir-sauv-blanc",
        "previousRest": 6,
        "incoming": 14,
        "movement": 0,
        "homeRest": 17,
        "extraRequest": 0
      },
      "le-grand-noir-merlot-75c": {
        "productId": "le-grand-noir-merlot-75c",
        "previousRest": 11,
        "incoming": 9,
        "movement": 0,
        "homeRest": 20,
        "extraRequest": 0
      },
      "mip-collection-rose-provienc-7": {
        "productId": "mip-collection-rose-provienc-7",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "ch-ksara-sunset-rose-75c": {
        "productId": "ch-ksara-sunset-rose-75c",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "mateus-rose-75cl": {
        "productId": "mateus-rose-75cl",
        "previousRest": 1,
        "incoming": 6,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "bacardi-white-rum-ltr": {
        "productId": "bacardi-white-rum-ltr",
        "previousRest": 2,
        "incoming": 4,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "bacardi-black-1-ltr": {
        "productId": "bacardi-black-1-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "bacardi-gold-ltr": {
        "productId": "bacardi-gold-ltr",
        "previousRest": 4,
        "incoming": 2,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "jose-cuervo-gold-ltr": {
        "productId": "jose-cuervo-gold-ltr",
        "previousRest": 6,
        "incoming": 4,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "jose-cuervo-silver-espec": {
        "productId": "jose-cuervo-silver-espec",
        "previousRest": 3,
        "incoming": 7,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "tanqueray-gin-ltr": {
        "productId": "tanqueray-gin-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "gordons-pink-gin-ltr": {
        "productId": "gordons-pink-gin-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "gordons-gin-ltr": {
        "productId": "gordons-gin-ltr",
        "previousRest": 0,
        "incoming": 10,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "bombay-sapphire-gin-ltr": {
        "productId": "bombay-sapphire-gin-ltr",
        "previousRest": 2,
        "incoming": 8,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "hendricks-gin-1-ltr": {
        "productId": "hendricks-gin-1-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "captain-morgan-blk-ltr": {
        "productId": "captain-morgan-blk-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "captain-morgan-spiced-go": {
        "productId": "captain-morgan-spiced-go",
        "previousRest": 4,
        "incoming": 3,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "malibu-whithe-rum-ltr": {
        "productId": "malibu-whithe-rum-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "baileys-irish-cream-ltr": {
        "productId": "baileys-irish-cream-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "amarula-cream-ltr": {
        "productId": "amarula-cream-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "jameson-irish-wsk-ltr": {
        "productId": "jameson-irish-wsk-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "j-b-rare-scotch-1-ltr": {
        "productId": "j-b-rare-scotch-1-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "d-h-clarnet-select-5ltr": {
        "productId": "d-h-clarnet-select-5ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "d-h-prem-grn-cru-5ltr": {
        "productId": "d-h-prem-grn-cru-5ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "martini-bianco-1-ltr": {
        "productId": "martini-bianco-1-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "smirnoff-r-l-1-ltr": {
        "productId": "smirnoff-r-l-1-ltr",
        "previousRest": 4,
        "incoming": 6,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "stolichnaya-vodka-ltr": {
        "productId": "stolichnaya-vodka-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "russian-std-peters-l": {
        "productId": "russian-std-peters-l",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "jagermeister-1-ltr": {
        "productId": "jagermeister-1-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "belvedere-vodka-ltr": {
        "productId": "belvedere-vodka-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "grey-goose-vodka-ltr": {
        "productId": "grey-goose-vodka-ltr",
        "previousRest": 8,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "beluga-noble-vodka-70cl": {
        "productId": "beluga-noble-vodka-70cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "cirok-vodka-ltr": {
        "productId": "cirok-vodka-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "skyy-vodka-1-ltr": {
        "productId": "skyy-vodka-1-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "arak-touma-50-54cl": {
        "productId": "arak-touma-50-54cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "efe-fresh-grape-raki-ltr-green": {
        "productId": "efe-fresh-grape-raki-ltr-green",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "j-w-gold-label-reserv-1": {
        "productId": "j-w-gold-label-reserv-1",
        "previousRest": 2,
        "incoming": 2,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "j-w-double-black-ltr": {
        "productId": "j-w-double-black-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "j-w-blue-label-1-ltr": {
        "productId": "j-w-blue-label-1-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "hennessy-vs-ltr": {
        "productId": "hennessy-vs-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hennessy-v-s-o-p-1-ltr-pr": {
        "productId": "hennessy-v-s-o-p-1-ltr-pr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hennessy-xo-ltr": {
        "productId": "hennessy-xo-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "remy-martin-vsop-ltr": {
        "productId": "remy-martin-vsop-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "chivas-18-yrs-ltr": {
        "productId": "chivas-18-yrs-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "royal-salute-21-yrs-ltr": {
        "productId": "royal-salute-21-yrs-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "patron-coffe": {
        "productId": "patron-coffe",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "patron-silver-75cl-tequi": {
        "productId": "patron-silver-75cl-tequi",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "patron-anejo-75cl-gold-t": {
        "productId": "patron-anejo-75cl-gold-t",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "don-julio-blanco-70-75cl": {
        "productId": "don-julio-blanco-70-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-reposado-70-75": {
        "productId": "don-julio-reposado-70-75",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "don-julio-anejo-70-75cl": {
        "productId": "don-julio-anejo-70-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-1942-anejo-70": {
        "productId": "don-julio-1942-anejo-70",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "asti-martini-75cl": {
        "productId": "asti-martini-75cl",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "jc-chardonnay-pinot-noir": {
        "productId": "jc-chardonnay-pinot-noir",
        "previousRest": 2,
        "incoming": 4,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "bottega-vino-d-poet-pros": {
        "productId": "bottega-vino-d-poet-pros",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "bottega-rose-proseco-poe": {
        "productId": "bottega-rose-proseco-poe",
        "previousRest": 9,
        "incoming": 0,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "bottega-gold-brut-75c-vi": {
        "productId": "bottega-gold-brut-75c-vi",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "veuve-clicquot-y-l-ponsr": {
        "productId": "veuve-clicquot-y-l-ponsr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "moet-chandon-brut-imp": {
        "productId": "moet-chandon-brut-imp",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "moet-chandon-rose-75cl": {
        "productId": "moet-chandon-rose-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "moet-ice-imperial-75cl": {
        "productId": "moet-ice-imperial-75cl",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "dom-perignon-m-c-75cl": {
        "productId": "dom-perignon-m-c-75cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "glendfidich-spl-r12yrs": {
        "productId": "glendfidich-spl-r12yrs",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "glendfidich-15-yrs-ltr": {
        "productId": "glendfidich-15-yrs-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "glendfidich-18y-smal-bat": {
        "productId": "glendfidich-18y-smal-bat",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "baron-rimapere-sauv-blan": {
        "productId": "baron-rimapere-sauv-blan",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "marchesi-gavi-d-gavi-75c": {
        "productId": "marchesi-gavi-d-gavi-75c",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "laroche-chablis-st-marti": {
        "productId": "laroche-chablis-st-marti",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "l-j-bourgogne-bl-cuv-d-ja": {
        "productId": "l-j-bourgogne-bl-cuv-d-ja",
        "previousRest": 3,
        "incoming": 3,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "castel-ch-barreyres-haut-m-75": {
        "productId": "castel-ch-barreyres-haut-m-75",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "ch-saint-leon-box-sup-75": {
        "productId": "ch-saint-leon-box-sup-75",
        "previousRest": 8,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "campo-viejo-reserva-rioj": {
        "productId": "campo-viejo-reserva-rioj",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "campo-viejo-gran-reserva": {
        "productId": "campo-viejo-gran-reserva",
        "previousRest": 4,
        "incoming": 2,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "m-minuty-rose-provence": {
        "productId": "m-minuty-rose-provence",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "cav-d-escln-whispering": {
        "productId": "cav-d-escln-whispering",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "jack-daniels-honey-ltr": {
        "productId": "jack-daniels-honey-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "baccardi-breezer-w-melon": {
        "productId": "baccardi-breezer-w-melon",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "asahi-beer-btls-super-dr": {
        "productId": "asahi-beer-btls-super-dr",
        "previousRest": 0.5,
        "incoming": 1.5,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "aperole-aperitivo-ltr": {
        "productId": "aperole-aperitivo-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "chivas-25-yrs": {
        "productId": "chivas-25-yrs",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "clase-azul-reposado-70-7": {
        "productId": "clase-azul-reposado-70-7",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "ms-ch-perron-lalande-d-pomerol": {
        "productId": "ms-ch-perron-lalande-d-pomerol",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "la-celia-reserva-malbec-75cl": {
        "productId": "la-celia-reserva-malbec-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "calvet-sancerre-les-hautes": {
        "productId": "calvet-sancerre-les-hautes",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "chateau-des-laurets-saint-emilion": {
        "productId": "chateau-des-laurets-saint-emilion",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "guinness-beer-cans-44cl": {
        "productId": "guinness-beer-cans-44cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "xxl-vodka-mix-energy-can": {
        "productId": "xxl-vodka-mix-energy-can",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "monkey-47-dry-gin-50cl": {
        "productId": "monkey-47-dry-gin-50cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "gentleman-jack-1-ltr-jd": {
        "productId": "gentleman-jack-1-ltr-jd",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-12-yr-fin-trip": {
        "productId": "macallan-12-yr-fin-trip",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-15-yrs-double-ca": {
        "productId": "macallan-15-yrs-double-ca",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "macallan-18-yrs": {
        "productId": "macallan-18-yrs",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "hoegarden-blanche-33cl-b": {
        "productId": "hoegarden-blanche-33cl-b",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "tequila-rose-liquer-70c-s-bery": {
        "productId": "tequila-rose-liquer-70c-s-bery",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "malfy-con-ara-blood-orange-gin-70": {
        "productId": "malfy-con-ara-blood-orange-gin-70",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "malfy-gin-rosa-70cl-grapfruite": {
        "productId": "malfy-gin-rosa-70cl-grapfruite",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "drumshanb-gunpoder-gin": {
        "productId": "drumshanb-gunpoder-gin",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "ch-saint-maur-l-exelenc-ros-7": {
        "productId": "ch-saint-maur-l-exelenc-ros-7",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "ch-lagrange-2010-st-julien": {
        "productId": "ch-lagrange-2010-st-julien",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "ruinart-blanc-d-blanc-75-cl": {
        "productId": "ruinart-blanc-d-blanc-75-cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "zonin-prosecco-75cl": {
        "productId": "zonin-prosecco-75cl",
        "previousRest": 3,
        "incoming": 4,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "oyster-bay-sauvignon": {
        "productId": "oyster-bay-sauvignon",
        "previousRest": 4,
        "incoming": 2,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      }
    },
    "cashColumns": {
      "E": {
        "columnKey": "E",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "F": {
        "columnKey": "F",
        "driverName": "Фаррух",
        "productRevenue": 4350,
        "foodExpenses": 100,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 155,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 4095,
        "comment": ""
      },
      "G": {
        "columnKey": "G",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "H": {
        "columnKey": "H",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "I": {
        "columnKey": "I",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "J": {
        "columnKey": "J",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "K": {
        "columnKey": "K",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      }
    },
    "closed": false
  },
  {
    "id": "2026-05-28_business-bay",
    "date": "2026-05-28",
    "pointId": "business-bay",
    "driverId": "",
    "driverName": "Баходур",
    "items": {
      "absolut-blue-ltr": {
        "productId": "absolut-blue-ltr",
        "previousRest": 20,
        "incoming": 30,
        "movement": 0,
        "homeRest": 47,
        "extraRequest": 0
      },
      "j-w-red-label-1-ltr": {
        "productId": "j-w-red-label-1-ltr",
        "previousRest": 28,
        "incoming": 24,
        "movement": 0,
        "homeRest": 48,
        "extraRequest": 0
      },
      "j-w-blak-label-1-ltr": {
        "productId": "j-w-blak-label-1-ltr",
        "previousRest": 15,
        "incoming": 5,
        "movement": 0,
        "homeRest": 19,
        "extraRequest": 0
      },
      "jack-daniels-ltr": {
        "productId": "jack-daniels-ltr",
        "previousRest": 19,
        "incoming": 1,
        "movement": 0,
        "homeRest": 19,
        "extraRequest": 0
      },
      "chivas-regal-1-ltr": {
        "productId": "chivas-regal-1-ltr",
        "previousRest": 17,
        "incoming": 3,
        "movement": 0,
        "homeRest": 19,
        "extraRequest": 0
      },
      "heineken-beer-cans-33cl": {
        "productId": "heineken-beer-cans-33cl",
        "previousRest": 5,
        "incoming": 7,
        "movement": 0,
        "homeRest": 11,
        "extraRequest": 0
      },
      "budweiser-beer-can-33-35": {
        "productId": "budweiser-beer-can-33-35",
        "previousRest": 7,
        "incoming": 6,
        "movement": 0,
        "homeRest": 12.5,
        "extraRequest": 0
      },
      "carlsberg-50cl-can": {
        "productId": "carlsberg-50cl-can",
        "previousRest": 3.5,
        "incoming": 8,
        "movement": 0,
        "homeRest": 11.5,
        "extraRequest": 0
      },
      "red-horse-50cl-can": {
        "productId": "red-horse-50cl-can",
        "previousRest": 2,
        "incoming": 1,
        "movement": 0,
        "homeRest": 2.5,
        "extraRequest": 0
      },
      "amstel-light-slim-can-35": {
        "productId": "amstel-light-slim-can-35",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "corona-beer-btl-35-5cl": {
        "productId": "corona-beer-btl-35-5cl",
        "previousRest": 1.5,
        "incoming": 12,
        "movement": 0,
        "homeRest": 11.5,
        "extraRequest": 0
      },
      "stella-33cl-btls": {
        "productId": "stella-33cl-btls",
        "previousRest": 2.5,
        "incoming": 0.5,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "stella-artois-33-cl-cans": {
        "productId": "stella-artois-33-cl-cans",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "heineken-beer-btl-33cl": {
        "productId": "heineken-beer-btl-33cl",
        "previousRest": 2,
        "incoming": 1,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "budweiser-berr-btl-33cl": {
        "productId": "budweiser-berr-btl-33cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "smirnoff-ice-red-27-5cl": {
        "productId": "smirnoff-ice-red-27-5cl",
        "previousRest": 1.5,
        "incoming": 1.5,
        "movement": 0,
        "homeRest": 2.5,
        "extraRequest": 0
      },
      "peroni-nastro-azuro-beer": {
        "productId": "peroni-nastro-azuro-beer",
        "previousRest": 2.5,
        "incoming": 0.5,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "jc-chardonnay-75cl": {
        "productId": "jc-chardonnay-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "jc-shiraz-cabarnet-75cl": {
        "productId": "jc-shiraz-cabarnet-75cl",
        "previousRest": 16,
        "incoming": 6,
        "movement": 0,
        "homeRest": 22,
        "extraRequest": 0
      },
      "ces-pinot-grig-d-ven-fio": {
        "productId": "ces-pinot-grig-d-ven-fio",
        "previousRest": 14,
        "incoming": 6,
        "movement": 0,
        "homeRest": 19,
        "extraRequest": 0
      },
      "le-grand-noir-sauv-blanc": {
        "productId": "le-grand-noir-sauv-blanc",
        "previousRest": 5,
        "incoming": 18,
        "movement": 0,
        "homeRest": 22,
        "extraRequest": 0
      },
      "le-grand-noir-merlot-75c": {
        "productId": "le-grand-noir-merlot-75c",
        "previousRest": 12,
        "incoming": 3,
        "movement": 0,
        "homeRest": 15,
        "extraRequest": 0
      },
      "mip-collection-rose-provienc-7": {
        "productId": "mip-collection-rose-provienc-7",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "ch-ksara-sunset-rose-75c": {
        "productId": "ch-ksara-sunset-rose-75c",
        "previousRest": 12,
        "incoming": 0,
        "movement": 0,
        "homeRest": 12,
        "extraRequest": 0
      },
      "mateus-rose-75cl": {
        "productId": "mateus-rose-75cl",
        "previousRest": 11,
        "incoming": 2,
        "movement": 0,
        "homeRest": 13,
        "extraRequest": 0
      },
      "bacardi-white-rum-ltr": {
        "productId": "bacardi-white-rum-ltr",
        "previousRest": 9,
        "incoming": 1,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "bacardi-black-1-ltr": {
        "productId": "bacardi-black-1-ltr",
        "previousRest": 9,
        "incoming": 1,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "bacardi-gold-ltr": {
        "productId": "bacardi-gold-ltr",
        "previousRest": 7,
        "incoming": 3,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "jose-cuervo-gold-ltr": {
        "productId": "jose-cuervo-gold-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "jose-cuervo-silver-espec": {
        "productId": "jose-cuervo-silver-espec",
        "previousRest": 9,
        "incoming": 1,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "tanqueray-gin-ltr": {
        "productId": "tanqueray-gin-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "gordons-pink-gin-ltr": {
        "productId": "gordons-pink-gin-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "gordons-gin-ltr": {
        "productId": "gordons-gin-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "bombay-sapphire-gin-ltr": {
        "productId": "bombay-sapphire-gin-ltr",
        "previousRest": 7,
        "incoming": 3,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "hendricks-gin-1-ltr": {
        "productId": "hendricks-gin-1-ltr",
        "previousRest": 9,
        "incoming": 2,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "captain-morgan-blk-ltr": {
        "productId": "captain-morgan-blk-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "captain-morgan-spiced-go": {
        "productId": "captain-morgan-spiced-go",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "malibu-whithe-rum-ltr": {
        "productId": "malibu-whithe-rum-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "baileys-irish-cream-ltr": {
        "productId": "baileys-irish-cream-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "amarula-cream-ltr": {
        "productId": "amarula-cream-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "jameson-irish-wsk-ltr": {
        "productId": "jameson-irish-wsk-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "j-b-rare-scotch-1-ltr": {
        "productId": "j-b-rare-scotch-1-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "d-h-clarnet-select-5ltr": {
        "productId": "d-h-clarnet-select-5ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "d-h-prem-grn-cru-5ltr": {
        "productId": "d-h-prem-grn-cru-5ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "martini-bianco-1-ltr": {
        "productId": "martini-bianco-1-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "smirnoff-r-l-1-ltr": {
        "productId": "smirnoff-r-l-1-ltr",
        "previousRest": 1,
        "incoming": 10,
        "movement": 0,
        "homeRest": 11,
        "extraRequest": 0
      },
      "stolichnaya-vodka-ltr": {
        "productId": "stolichnaya-vodka-ltr",
        "previousRest": 9,
        "incoming": 0,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "russian-std-peters-l": {
        "productId": "russian-std-peters-l",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "jagermeister-1-ltr": {
        "productId": "jagermeister-1-ltr",
        "previousRest": 8,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "belvedere-vodka-ltr": {
        "productId": "belvedere-vodka-ltr",
        "previousRest": 11,
        "incoming": 0,
        "movement": 0,
        "homeRest": 11,
        "extraRequest": 0
      },
      "grey-goose-vodka-ltr": {
        "productId": "grey-goose-vodka-ltr",
        "previousRest": 9,
        "incoming": 15,
        "movement": 0,
        "homeRest": 19,
        "extraRequest": 0
      },
      "beluga-noble-vodka-70cl": {
        "productId": "beluga-noble-vodka-70cl",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "cirok-vodka-ltr": {
        "productId": "cirok-vodka-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "skyy-vodka-1-ltr": {
        "productId": "skyy-vodka-1-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "arak-touma-50-54cl": {
        "productId": "arak-touma-50-54cl",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "efe-fresh-grape-raki-ltr-green": {
        "productId": "efe-fresh-grape-raki-ltr-green",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "j-w-gold-label-reserv-1": {
        "productId": "j-w-gold-label-reserv-1",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "j-w-double-black-ltr": {
        "productId": "j-w-double-black-ltr",
        "previousRest": 1,
        "incoming": 5,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "j-w-blue-label-1-ltr": {
        "productId": "j-w-blue-label-1-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hennessy-vs-ltr": {
        "productId": "hennessy-vs-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "hennessy-v-s-o-p-1-ltr-pr": {
        "productId": "hennessy-v-s-o-p-1-ltr-pr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "hennessy-xo-ltr": {
        "productId": "hennessy-xo-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "remy-martin-vsop-ltr": {
        "productId": "remy-martin-vsop-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "chivas-18-yrs-ltr": {
        "productId": "chivas-18-yrs-ltr",
        "previousRest": 4,
        "incoming": 4,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "royal-salute-21-yrs-ltr": {
        "productId": "royal-salute-21-yrs-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "patron-coffe": {
        "productId": "patron-coffe",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "patron-silver-75cl-tequi": {
        "productId": "patron-silver-75cl-tequi",
        "previousRest": 5,
        "incoming": 1,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "patron-anejo-75cl-gold-t": {
        "productId": "patron-anejo-75cl-gold-t",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "don-julio-blanco-70-75cl": {
        "productId": "don-julio-blanco-70-75cl",
        "previousRest": 4,
        "incoming": 1,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "don-julio-reposado-70-75": {
        "productId": "don-julio-reposado-70-75",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "don-julio-anejo-70-75cl": {
        "productId": "don-julio-anejo-70-75cl",
        "previousRest": 1,
        "incoming": 4,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "don-julio-1942-anejo-70": {
        "productId": "don-julio-1942-anejo-70",
        "previousRest": 2,
        "incoming": 1,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "asti-martini-75cl": {
        "productId": "asti-martini-75cl",
        "previousRest": 9,
        "incoming": 0,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "jc-chardonnay-pinot-noir": {
        "productId": "jc-chardonnay-pinot-noir",
        "previousRest": 8,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "bottega-vino-d-poet-pros": {
        "productId": "bottega-vino-d-poet-pros",
        "previousRest": 5,
        "incoming": 2,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "bottega-rose-proseco-poe": {
        "productId": "bottega-rose-proseco-poe",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "bottega-gold-brut-75c-vi": {
        "productId": "bottega-gold-brut-75c-vi",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "veuve-clicquot-y-l-ponsr": {
        "productId": "veuve-clicquot-y-l-ponsr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "moet-chandon-brut-imp": {
        "productId": "moet-chandon-brut-imp",
        "previousRest": 9,
        "incoming": 6,
        "movement": 0,
        "homeRest": 15,
        "extraRequest": 0
      },
      "moet-chandon-rose-75cl": {
        "productId": "moet-chandon-rose-75cl",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "moet-ice-imperial-75cl": {
        "productId": "moet-ice-imperial-75cl",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "dom-perignon-m-c-75cl": {
        "productId": "dom-perignon-m-c-75cl",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "glendfidich-spl-r12yrs": {
        "productId": "glendfidich-spl-r12yrs",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "glendfidich-15-yrs-ltr": {
        "productId": "glendfidich-15-yrs-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "glendfidich-18y-smal-bat": {
        "productId": "glendfidich-18y-smal-bat",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "baron-rimapere-sauv-blan": {
        "productId": "baron-rimapere-sauv-blan",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "marchesi-gavi-d-gavi-75c": {
        "productId": "marchesi-gavi-d-gavi-75c",
        "previousRest": 5,
        "incoming": 2,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "laroche-chablis-st-marti": {
        "productId": "laroche-chablis-st-marti",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "l-j-bourgogne-bl-cuv-d-ja": {
        "productId": "l-j-bourgogne-bl-cuv-d-ja",
        "previousRest": 7,
        "incoming": 1,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "castel-ch-barreyres-haut-m-75": {
        "productId": "castel-ch-barreyres-haut-m-75",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "ch-saint-leon-box-sup-75": {
        "productId": "ch-saint-leon-box-sup-75",
        "previousRest": 12,
        "incoming": 0,
        "movement": 0,
        "homeRest": 12,
        "extraRequest": 0
      },
      "campo-viejo-reserva-rioj": {
        "productId": "campo-viejo-reserva-rioj",
        "previousRest": 5,
        "incoming": 2,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "campo-viejo-gran-reserva": {
        "productId": "campo-viejo-gran-reserva",
        "previousRest": 5,
        "incoming": 2,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "m-minuty-rose-provence": {
        "productId": "m-minuty-rose-provence",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "cav-d-escln-whispering": {
        "productId": "cav-d-escln-whispering",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "jack-daniels-honey-ltr": {
        "productId": "jack-daniels-honey-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "baccardi-breezer-w-melon": {
        "productId": "baccardi-breezer-w-melon",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2.5,
        "extraRequest": 0
      },
      "asahi-beer-btls-super-dr": {
        "productId": "asahi-beer-btls-super-dr",
        "previousRest": 2.5,
        "incoming": 0.5,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "aperole-aperitivo-ltr": {
        "productId": "aperole-aperitivo-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "chivas-25-yrs": {
        "productId": "chivas-25-yrs",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "clase-azul-reposado-70-7": {
        "productId": "clase-azul-reposado-70-7",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "ms-ch-perron-lalande-d-pomerol": {
        "productId": "ms-ch-perron-lalande-d-pomerol",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "la-celia-reserva-malbec-75cl": {
        "productId": "la-celia-reserva-malbec-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "calvet-sancerre-les-hautes": {
        "productId": "calvet-sancerre-les-hautes",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "chateau-des-laurets-saint-emilion": {
        "productId": "chateau-des-laurets-saint-emilion",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "guinness-beer-cans-44cl": {
        "productId": "guinness-beer-cans-44cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "xxl-vodka-mix-energy-can": {
        "productId": "xxl-vodka-mix-energy-can",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "monkey-47-dry-gin-50cl": {
        "productId": "monkey-47-dry-gin-50cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "gentleman-jack-1-ltr-jd": {
        "productId": "gentleman-jack-1-ltr-jd",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-12-yr-fin-trip": {
        "productId": "macallan-12-yr-fin-trip",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-15-yrs-double-ca": {
        "productId": "macallan-15-yrs-double-ca",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "macallan-18-yrs": {
        "productId": "macallan-18-yrs",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hoegarden-blanche-33cl-b": {
        "productId": "hoegarden-blanche-33cl-b",
        "previousRest": 2,
        "incoming": 1,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "tequila-rose-liquer-70c-s-bery": {
        "productId": "tequila-rose-liquer-70c-s-bery",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "malfy-con-ara-blood-orange-gin-70": {
        "productId": "malfy-con-ara-blood-orange-gin-70",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "malfy-gin-rosa-70cl-grapfruite": {
        "productId": "malfy-gin-rosa-70cl-grapfruite",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "drumshanb-gunpoder-gin": {
        "productId": "drumshanb-gunpoder-gin",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ch-saint-maur-l-exelenc-ros-7": {
        "productId": "ch-saint-maur-l-exelenc-ros-7",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "ch-lagrange-2010-st-julien": {
        "productId": "ch-lagrange-2010-st-julien",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ruinart-blanc-d-blanc-75-cl": {
        "productId": "ruinart-blanc-d-blanc-75-cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "zonin-prosecco-75cl": {
        "productId": "zonin-prosecco-75cl",
        "previousRest": 8,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "oyster-bay-sauvignon": {
        "productId": "oyster-bay-sauvignon",
        "previousRest": 4,
        "incoming": 5,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "balantines": {
        "productId": "balantines",
        "previousRest": 1,
        "incoming": 3,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      }
    },
    "cashColumns": {
      "E": {
        "columnKey": "E",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "F": {
        "columnKey": "F",
        "driverName": "Баходур",
        "productRevenue": 1300,
        "foodExpenses": 80,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 120,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 1100,
        "comment": ""
      },
      "G": {
        "columnKey": "G",
        "driverName": "Аваз",
        "productRevenue": 2450,
        "foodExpenses": 80,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 2370,
        "comment": ""
      },
      "H": {
        "columnKey": "H",
        "driverName": "Фахридин",
        "productRevenue": 1500,
        "foodExpenses": 80,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 1420,
        "comment": ""
      },
      "I": {
        "columnKey": "I",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "J": {
        "columnKey": "J",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "K": {
        "columnKey": "K",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      }
    },
    "closed": false
  },
  {
    "id": "2026-05-28_silicon-oasis",
    "date": "2026-05-28",
    "pointId": "silicon-oasis",
    "driverId": "",
    "driverName": "Азиз",
    "items": {
      "absolut-blue-ltr": {
        "productId": "absolut-blue-ltr",
        "previousRest": 38,
        "incoming": 0,
        "movement": 0,
        "homeRest": 37,
        "extraRequest": 0
      },
      "j-w-red-label-1-ltr": {
        "productId": "j-w-red-label-1-ltr",
        "previousRest": 33,
        "incoming": 0,
        "movement": 0,
        "homeRest": 31,
        "extraRequest": 0
      },
      "j-w-blak-label-1-ltr": {
        "productId": "j-w-blak-label-1-ltr",
        "previousRest": 12,
        "incoming": 0,
        "movement": 0,
        "homeRest": 12,
        "extraRequest": 0
      },
      "jack-daniels-ltr": {
        "productId": "jack-daniels-ltr",
        "previousRest": 15,
        "incoming": 0,
        "movement": 0,
        "homeRest": 15,
        "extraRequest": 0
      },
      "chivas-regal-1-ltr": {
        "productId": "chivas-regal-1-ltr",
        "previousRest": 11,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "heineken-beer-cans-33cl": {
        "productId": "heineken-beer-cans-33cl",
        "previousRest": 16.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 16.5,
        "extraRequest": 0
      },
      "budweiser-beer-can-33-35": {
        "productId": "budweiser-beer-can-33-35",
        "previousRest": 8.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "carlsberg-50cl-can": {
        "productId": "carlsberg-50cl-can",
        "previousRest": 7.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5.5,
        "extraRequest": 0
      },
      "red-horse-50cl-can": {
        "productId": "red-horse-50cl-can",
        "previousRest": 5.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "amstel-light-slim-can-35": {
        "productId": "amstel-light-slim-can-35",
        "previousRest": 3.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3.5,
        "extraRequest": 0
      },
      "corona-beer-btl-35-5cl": {
        "productId": "corona-beer-btl-35-5cl",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "stella-33cl-btls": {
        "productId": "stella-33cl-btls",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "stella-artois-33-cl-cans": {
        "productId": "stella-artois-33-cl-cans",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3.5,
        "extraRequest": 0
      },
      "heineken-beer-btl-33cl": {
        "productId": "heineken-beer-btl-33cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "budweiser-berr-btl-33cl": {
        "productId": "budweiser-berr-btl-33cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "smirnoff-ice-red-27-5cl": {
        "productId": "smirnoff-ice-red-27-5cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1.5,
        "extraRequest": 0
      },
      "peroni-nastro-azuro-beer": {
        "productId": "peroni-nastro-azuro-beer",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "jc-chardonnay-75cl": {
        "productId": "jc-chardonnay-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "jc-shiraz-cabarnet-75cl": {
        "productId": "jc-shiraz-cabarnet-75cl",
        "previousRest": 13,
        "incoming": 0,
        "movement": 0,
        "homeRest": 13,
        "extraRequest": 0
      },
      "ces-pinot-grig-d-ven-fio": {
        "productId": "ces-pinot-grig-d-ven-fio",
        "previousRest": 14,
        "incoming": 0,
        "movement": 0,
        "homeRest": 14,
        "extraRequest": 0
      },
      "le-grand-noir-sauv-blanc": {
        "productId": "le-grand-noir-sauv-blanc",
        "previousRest": 13,
        "incoming": 0,
        "movement": 0,
        "homeRest": 12,
        "extraRequest": 0
      },
      "le-grand-noir-merlot-75c": {
        "productId": "le-grand-noir-merlot-75c",
        "previousRest": 15,
        "incoming": 0,
        "movement": 0,
        "homeRest": 15,
        "extraRequest": 0
      },
      "mip-collection-rose-provienc-7": {
        "productId": "mip-collection-rose-provienc-7",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "ch-ksara-sunset-rose-75c": {
        "productId": "ch-ksara-sunset-rose-75c",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "mateus-rose-75cl": {
        "productId": "mateus-rose-75cl",
        "previousRest": 14,
        "incoming": 0,
        "movement": 0,
        "homeRest": 14,
        "extraRequest": 0
      },
      "bacardi-white-rum-ltr": {
        "productId": "bacardi-white-rum-ltr",
        "previousRest": 13,
        "incoming": 0,
        "movement": 0,
        "homeRest": 13,
        "extraRequest": 0
      },
      "bacardi-black-1-ltr": {
        "productId": "bacardi-black-1-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "bacardi-gold-ltr": {
        "productId": "bacardi-gold-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "jose-cuervo-gold-ltr": {
        "productId": "jose-cuervo-gold-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "jose-cuervo-silver-espec": {
        "productId": "jose-cuervo-silver-espec",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "tanqueray-gin-ltr": {
        "productId": "tanqueray-gin-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "gordons-pink-gin-ltr": {
        "productId": "gordons-pink-gin-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "gordons-gin-ltr": {
        "productId": "gordons-gin-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "bombay-sapphire-gin-ltr": {
        "productId": "bombay-sapphire-gin-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "hendricks-gin-1-ltr": {
        "productId": "hendricks-gin-1-ltr",
        "previousRest": 8,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "captain-morgan-blk-ltr": {
        "productId": "captain-morgan-blk-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "captain-morgan-spiced-go": {
        "productId": "captain-morgan-spiced-go",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "malibu-whithe-rum-ltr": {
        "productId": "malibu-whithe-rum-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "baileys-irish-cream-ltr": {
        "productId": "baileys-irish-cream-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "amarula-cream-ltr": {
        "productId": "amarula-cream-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "jameson-irish-wsk-ltr": {
        "productId": "jameson-irish-wsk-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "j-b-rare-scotch-1-ltr": {
        "productId": "j-b-rare-scotch-1-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "d-h-clarnet-select-5ltr": {
        "productId": "d-h-clarnet-select-5ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "d-h-prem-grn-cru-5ltr": {
        "productId": "d-h-prem-grn-cru-5ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "martini-bianco-1-ltr": {
        "productId": "martini-bianco-1-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "smirnoff-r-l-1-ltr": {
        "productId": "smirnoff-r-l-1-ltr",
        "previousRest": 9,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "stolichnaya-vodka-ltr": {
        "productId": "stolichnaya-vodka-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "russian-std-peters-l": {
        "productId": "russian-std-peters-l",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "jagermeister-1-ltr": {
        "productId": "jagermeister-1-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "belvedere-vodka-ltr": {
        "productId": "belvedere-vodka-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "grey-goose-vodka-ltr": {
        "productId": "grey-goose-vodka-ltr",
        "previousRest": 9,
        "incoming": 0,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "beluga-noble-vodka-70cl": {
        "productId": "beluga-noble-vodka-70cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "cirok-vodka-ltr": {
        "productId": "cirok-vodka-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "skyy-vodka-1-ltr": {
        "productId": "skyy-vodka-1-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "arak-touma-50-54cl": {
        "productId": "arak-touma-50-54cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "efe-fresh-grape-raki-ltr-green": {
        "productId": "efe-fresh-grape-raki-ltr-green",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "j-w-gold-label-reserv-1": {
        "productId": "j-w-gold-label-reserv-1",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "j-w-double-black-ltr": {
        "productId": "j-w-double-black-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "j-w-blue-label-1-ltr": {
        "productId": "j-w-blue-label-1-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "hennessy-vs-ltr": {
        "productId": "hennessy-vs-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hennessy-v-s-o-p-1-ltr-pr": {
        "productId": "hennessy-v-s-o-p-1-ltr-pr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hennessy-xo-ltr": {
        "productId": "hennessy-xo-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "remy-martin-vsop-ltr": {
        "productId": "remy-martin-vsop-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "chivas-18-yrs-ltr": {
        "productId": "chivas-18-yrs-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "royal-salute-21-yrs-ltr": {
        "productId": "royal-salute-21-yrs-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "patron-coffe": {
        "productId": "patron-coffe",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "patron-silver-75cl-tequi": {
        "productId": "patron-silver-75cl-tequi",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "patron-anejo-75cl-gold-t": {
        "productId": "patron-anejo-75cl-gold-t",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-blanco-70-75cl": {
        "productId": "don-julio-blanco-70-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-reposado-70-75": {
        "productId": "don-julio-reposado-70-75",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-anejo-70-75cl": {
        "productId": "don-julio-anejo-70-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-1942-anejo-70": {
        "productId": "don-julio-1942-anejo-70",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "asti-martini-75cl": {
        "productId": "asti-martini-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "jc-chardonnay-pinot-noir": {
        "productId": "jc-chardonnay-pinot-noir",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "bottega-vino-d-poet-pros": {
        "productId": "bottega-vino-d-poet-pros",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "bottega-rose-proseco-poe": {
        "productId": "bottega-rose-proseco-poe",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "bottega-gold-brut-75c-vi": {
        "productId": "bottega-gold-brut-75c-vi",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "veuve-clicquot-y-l-ponsr": {
        "productId": "veuve-clicquot-y-l-ponsr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "moet-chandon-brut-imp": {
        "productId": "moet-chandon-brut-imp",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "moet-chandon-rose-75cl": {
        "productId": "moet-chandon-rose-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "moet-ice-imperial-75cl": {
        "productId": "moet-ice-imperial-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "dom-perignon-m-c-75cl": {
        "productId": "dom-perignon-m-c-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "glendfidich-spl-r12yrs": {
        "productId": "glendfidich-spl-r12yrs",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "glendfidich-15-yrs-ltr": {
        "productId": "glendfidich-15-yrs-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "glendfidich-18y-smal-bat": {
        "productId": "glendfidich-18y-smal-bat",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "baron-rimapere-sauv-blan": {
        "productId": "baron-rimapere-sauv-blan",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "marchesi-gavi-d-gavi-75c": {
        "productId": "marchesi-gavi-d-gavi-75c",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "laroche-chablis-st-marti": {
        "productId": "laroche-chablis-st-marti",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "l-j-bourgogne-bl-cuv-d-ja": {
        "productId": "l-j-bourgogne-bl-cuv-d-ja",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "castel-ch-barreyres-haut-m-75": {
        "productId": "castel-ch-barreyres-haut-m-75",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "ch-saint-leon-box-sup-75": {
        "productId": "ch-saint-leon-box-sup-75",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "campo-viejo-reserva-rioj": {
        "productId": "campo-viejo-reserva-rioj",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "campo-viejo-gran-reserva": {
        "productId": "campo-viejo-gran-reserva",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "m-minuty-rose-provence": {
        "productId": "m-minuty-rose-provence",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "cav-d-escln-whispering": {
        "productId": "cav-d-escln-whispering",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "jack-daniels-honey-ltr": {
        "productId": "jack-daniels-honey-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "baccardi-breezer-w-melon": {
        "productId": "baccardi-breezer-w-melon",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "asahi-beer-btls-super-dr": {
        "productId": "asahi-beer-btls-super-dr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "aperole-aperitivo-ltr": {
        "productId": "aperole-aperitivo-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "chivas-25-yrs": {
        "productId": "chivas-25-yrs",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "clase-azul-reposado-70-7": {
        "productId": "clase-azul-reposado-70-7",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "ms-ch-perron-lalande-d-pomerol": {
        "productId": "ms-ch-perron-lalande-d-pomerol",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "la-celia-reserva-malbec-75cl": {
        "productId": "la-celia-reserva-malbec-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "calvet-sancerre-les-hautes": {
        "productId": "calvet-sancerre-les-hautes",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "chateau-des-laurets-saint-emilion": {
        "productId": "chateau-des-laurets-saint-emilion",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "guinness-beer-cans-44cl": {
        "productId": "guinness-beer-cans-44cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "xxl-vodka-mix-energy-can": {
        "productId": "xxl-vodka-mix-energy-can",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "monkey-47-dry-gin-50cl": {
        "productId": "monkey-47-dry-gin-50cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "gentleman-jack-1-ltr-jd": {
        "productId": "gentleman-jack-1-ltr-jd",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-12-yr-fin-trip": {
        "productId": "macallan-12-yr-fin-trip",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-15-yrs-double-ca": {
        "productId": "macallan-15-yrs-double-ca",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "macallan-18-yrs": {
        "productId": "macallan-18-yrs",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "hoegarden-blanche-33cl-b": {
        "productId": "hoegarden-blanche-33cl-b",
        "previousRest": 1.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1.5,
        "extraRequest": 0
      },
      "tequila-rose-liquer-70c-s-bery": {
        "productId": "tequila-rose-liquer-70c-s-bery",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "malfy-con-ara-blood-orange-gin-70": {
        "productId": "malfy-con-ara-blood-orange-gin-70",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "malfy-gin-rosa-70cl-grapfruite": {
        "productId": "malfy-gin-rosa-70cl-grapfruite",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "drumshanb-gunpoder-gin": {
        "productId": "drumshanb-gunpoder-gin",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ch-saint-maur-l-exelenc-ros-7": {
        "productId": "ch-saint-maur-l-exelenc-ros-7",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "ch-lagrange-2010-st-julien": {
        "productId": "ch-lagrange-2010-st-julien",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ruinart-blanc-d-blanc-75-cl": {
        "productId": "ruinart-blanc-d-blanc-75-cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "zonin-prosecco-75cl": {
        "productId": "zonin-prosecco-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "oyster-bay-sauvignon": {
        "productId": "oyster-bay-sauvignon",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      }
    },
    "cashColumns": {
      "E": {
        "columnKey": "E",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "F": {
        "columnKey": "F",
        "driverName": "Азиз",
        "productRevenue": 2300,
        "foodExpenses": 80,
        "weReturnedDebt": 0,
        "weOwe": 500,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 175,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 2045,
        "comment": ""
      },
      "G": {
        "columnKey": "G",
        "driverName": "Фариддун",
        "productRevenue": 1200,
        "foodExpenses": 80,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 100,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 1020,
        "comment": ""
      },
      "H": {
        "columnKey": "H",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "I": {
        "columnKey": "I",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "J": {
        "columnKey": "J",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "K": {
        "columnKey": "K",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      }
    },
    "closed": false
  },
  {
    "id": "2026-05-28_al-qusais",
    "date": "2026-05-28",
    "pointId": "al-qusais",
    "driverId": "",
    "driverName": "СУНАТ",
    "items": {
      "absolut-blue-ltr": {
        "productId": "absolut-blue-ltr",
        "previousRest": 26,
        "incoming": 18,
        "movement": 0,
        "homeRest": 37,
        "extraRequest": 0
      },
      "j-w-red-label-1-ltr": {
        "productId": "j-w-red-label-1-ltr",
        "previousRest": 18,
        "incoming": 27,
        "movement": 0,
        "homeRest": 43,
        "extraRequest": 0
      },
      "j-w-blak-label-1-ltr": {
        "productId": "j-w-blak-label-1-ltr",
        "previousRest": 12,
        "incoming": 6,
        "movement": 0,
        "homeRest": 16,
        "extraRequest": 0
      },
      "jack-daniels-ltr": {
        "productId": "jack-daniels-ltr",
        "previousRest": 12,
        "incoming": 3,
        "movement": 0,
        "homeRest": 15,
        "extraRequest": 0
      },
      "chivas-regal-1-ltr": {
        "productId": "chivas-regal-1-ltr",
        "previousRest": 9,
        "incoming": 5,
        "movement": 0,
        "homeRest": 12,
        "extraRequest": 0
      },
      "heineken-beer-cans-33cl": {
        "productId": "heineken-beer-cans-33cl",
        "previousRest": 7.5,
        "incoming": 5.5,
        "movement": 0,
        "homeRest": 11,
        "extraRequest": 0
      },
      "budweiser-beer-can-33-35": {
        "productId": "budweiser-beer-can-33-35",
        "previousRest": 11.5,
        "incoming": 2.5,
        "movement": 0,
        "homeRest": 14,
        "extraRequest": 0
      },
      "carlsberg-50cl-can": {
        "productId": "carlsberg-50cl-can",
        "previousRest": 11,
        "incoming": 3,
        "movement": 0,
        "homeRest": 13.5,
        "extraRequest": 0
      },
      "red-horse-50cl-can": {
        "productId": "red-horse-50cl-can",
        "previousRest": 3.5,
        "incoming": 1,
        "movement": 0,
        "homeRest": 4.5,
        "extraRequest": 0
      },
      "amstel-light-slim-can-35": {
        "productId": "amstel-light-slim-can-35",
        "previousRest": 1.5,
        "incoming": 0.5,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "corona-beer-btl-35-5cl": {
        "productId": "corona-beer-btl-35-5cl",
        "previousRest": 4.5,
        "incoming": 2.5,
        "movement": 0,
        "homeRest": 6.5,
        "extraRequest": 0
      },
      "stella-33cl-btls": {
        "productId": "stella-33cl-btls",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "stella-artois-33-cl-cans": {
        "productId": "stella-artois-33-cl-cans",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "heineken-beer-btl-33cl": {
        "productId": "heineken-beer-btl-33cl",
        "previousRest": 0.5,
        "incoming": 0.5,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "budweiser-berr-btl-33cl": {
        "productId": "budweiser-berr-btl-33cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "smirnoff-ice-red-27-5cl": {
        "productId": "smirnoff-ice-red-27-5cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "peroni-nastro-azuro-beer": {
        "productId": "peroni-nastro-azuro-beer",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "jc-chardonnay-75cl": {
        "productId": "jc-chardonnay-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "jc-shiraz-cabarnet-75cl": {
        "productId": "jc-shiraz-cabarnet-75cl",
        "previousRest": 9,
        "incoming": 1,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "ces-pinot-grig-d-ven-fio": {
        "productId": "ces-pinot-grig-d-ven-fio",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "le-grand-noir-sauv-blanc": {
        "productId": "le-grand-noir-sauv-blanc",
        "previousRest": 9,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "le-grand-noir-merlot-75c": {
        "productId": "le-grand-noir-merlot-75c",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "mip-collection-rose-provienc-7": {
        "productId": "mip-collection-rose-provienc-7",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ch-ksara-sunset-rose-75c": {
        "productId": "ch-ksara-sunset-rose-75c",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "mateus-rose-75cl": {
        "productId": "mateus-rose-75cl",
        "previousRest": 9,
        "incoming": 0,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "bacardi-white-rum-ltr": {
        "productId": "bacardi-white-rum-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "bacardi-black-1-ltr": {
        "productId": "bacardi-black-1-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "bacardi-gold-ltr": {
        "productId": "bacardi-gold-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "jose-cuervo-gold-ltr": {
        "productId": "jose-cuervo-gold-ltr",
        "previousRest": 7,
        "incoming": 1,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "jose-cuervo-silver-espec": {
        "productId": "jose-cuervo-silver-espec",
        "previousRest": 9,
        "incoming": 1,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "tanqueray-gin-ltr": {
        "productId": "tanqueray-gin-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "gordons-pink-gin-ltr": {
        "productId": "gordons-pink-gin-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "gordons-gin-ltr": {
        "productId": "gordons-gin-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "bombay-sapphire-gin-ltr": {
        "productId": "bombay-sapphire-gin-ltr",
        "previousRest": 6,
        "incoming": 2,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "hendricks-gin-1-ltr": {
        "productId": "hendricks-gin-1-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "captain-morgan-blk-ltr": {
        "productId": "captain-morgan-blk-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "captain-morgan-spiced-go": {
        "productId": "captain-morgan-spiced-go",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "malibu-whithe-rum-ltr": {
        "productId": "malibu-whithe-rum-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "baileys-irish-cream-ltr": {
        "productId": "baileys-irish-cream-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "amarula-cream-ltr": {
        "productId": "amarula-cream-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "jameson-irish-wsk-ltr": {
        "productId": "jameson-irish-wsk-ltr",
        "previousRest": 6,
        "incoming": 1,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "j-b-rare-scotch-1-ltr": {
        "productId": "j-b-rare-scotch-1-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "d-h-clarnet-select-5ltr": {
        "productId": "d-h-clarnet-select-5ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "d-h-prem-grn-cru-5ltr": {
        "productId": "d-h-prem-grn-cru-5ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "martini-bianco-1-ltr": {
        "productId": "martini-bianco-1-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "smirnoff-r-l-1-ltr": {
        "productId": "smirnoff-r-l-1-ltr",
        "previousRest": 3,
        "incoming": 3,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "stolichnaya-vodka-ltr": {
        "productId": "stolichnaya-vodka-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "russian-std-peters-l": {
        "productId": "russian-std-peters-l",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "jagermeister-1-ltr": {
        "productId": "jagermeister-1-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "belvedere-vodka-ltr": {
        "productId": "belvedere-vodka-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "grey-goose-vodka-ltr": {
        "productId": "grey-goose-vodka-ltr",
        "previousRest": 10,
        "incoming": 2,
        "movement": 0,
        "homeRest": 12,
        "extraRequest": 0
      },
      "beluga-noble-vodka-70cl": {
        "productId": "beluga-noble-vodka-70cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "cirok-vodka-ltr": {
        "productId": "cirok-vodka-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "skyy-vodka-1-ltr": {
        "productId": "skyy-vodka-1-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "arak-touma-50-54cl": {
        "productId": "arak-touma-50-54cl",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "efe-fresh-grape-raki-ltr-green": {
        "productId": "efe-fresh-grape-raki-ltr-green",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "j-w-gold-label-reserv-1": {
        "productId": "j-w-gold-label-reserv-1",
        "previousRest": 9,
        "incoming": 1,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "j-w-double-black-ltr": {
        "productId": "j-w-double-black-ltr",
        "previousRest": 10,
        "incoming": 0,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "j-w-blue-label-1-ltr": {
        "productId": "j-w-blue-label-1-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "hennessy-vs-ltr": {
        "productId": "hennessy-vs-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hennessy-v-s-o-p-1-ltr-pr": {
        "productId": "hennessy-v-s-o-p-1-ltr-pr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hennessy-xo-ltr": {
        "productId": "hennessy-xo-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "remy-martin-vsop-ltr": {
        "productId": "remy-martin-vsop-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "chivas-18-yrs-ltr": {
        "productId": "chivas-18-yrs-ltr",
        "previousRest": 4,
        "incoming": 1,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "royal-salute-21-yrs-ltr": {
        "productId": "royal-salute-21-yrs-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "patron-coffe": {
        "productId": "patron-coffe",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "patron-silver-75cl-tequi": {
        "productId": "patron-silver-75cl-tequi",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "patron-anejo-75cl-gold-t": {
        "productId": "patron-anejo-75cl-gold-t",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "don-julio-blanco-70-75cl": {
        "productId": "don-julio-blanco-70-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "don-julio-reposado-70-75": {
        "productId": "don-julio-reposado-70-75",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "don-julio-anejo-70-75cl": {
        "productId": "don-julio-anejo-70-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "don-julio-1942-anejo-70": {
        "productId": "don-julio-1942-anejo-70",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "asti-martini-75cl": {
        "productId": "asti-martini-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "jc-chardonnay-pinot-noir": {
        "productId": "jc-chardonnay-pinot-noir",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "bottega-vino-d-poet-pros": {
        "productId": "bottega-vino-d-poet-pros",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "bottega-rose-proseco-poe": {
        "productId": "bottega-rose-proseco-poe",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "bottega-gold-brut-75c-vi": {
        "productId": "bottega-gold-brut-75c-vi",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "veuve-clicquot-y-l-ponsr": {
        "productId": "veuve-clicquot-y-l-ponsr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "moet-chandon-brut-imp": {
        "productId": "moet-chandon-brut-imp",
        "previousRest": 1,
        "incoming": 1,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "moet-chandon-rose-75cl": {
        "productId": "moet-chandon-rose-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "moet-ice-imperial-75cl": {
        "productId": "moet-ice-imperial-75cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "dom-perignon-m-c-75cl": {
        "productId": "dom-perignon-m-c-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "glendfidich-spl-r12yrs": {
        "productId": "glendfidich-spl-r12yrs",
        "previousRest": 3,
        "incoming": 2,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "glendfidich-15-yrs-ltr": {
        "productId": "glendfidich-15-yrs-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "glendfidich-18y-smal-bat": {
        "productId": "glendfidich-18y-smal-bat",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "baron-rimapere-sauv-blan": {
        "productId": "baron-rimapere-sauv-blan",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "marchesi-gavi-d-gavi-75c": {
        "productId": "marchesi-gavi-d-gavi-75c",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "laroche-chablis-st-marti": {
        "productId": "laroche-chablis-st-marti",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "l-j-bourgogne-bl-cuv-d-ja": {
        "productId": "l-j-bourgogne-bl-cuv-d-ja",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "castel-ch-barreyres-haut-m-75": {
        "productId": "castel-ch-barreyres-haut-m-75",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "ch-saint-leon-box-sup-75": {
        "productId": "ch-saint-leon-box-sup-75",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "campo-viejo-reserva-rioj": {
        "productId": "campo-viejo-reserva-rioj",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "campo-viejo-gran-reserva": {
        "productId": "campo-viejo-gran-reserva",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "m-minuty-rose-provence": {
        "productId": "m-minuty-rose-provence",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "cav-d-escln-whispering": {
        "productId": "cav-d-escln-whispering",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "jack-daniels-honey-ltr": {
        "productId": "jack-daniels-honey-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "baccardi-breezer-w-melon": {
        "productId": "baccardi-breezer-w-melon",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "asahi-beer-btls-super-dr": {
        "productId": "asahi-beer-btls-super-dr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "aperole-aperitivo-ltr": {
        "productId": "aperole-aperitivo-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "chivas-25-yrs": {
        "productId": "chivas-25-yrs",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "clase-azul-reposado-70-7": {
        "productId": "clase-azul-reposado-70-7",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ms-ch-perron-lalande-d-pomerol": {
        "productId": "ms-ch-perron-lalande-d-pomerol",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "la-celia-reserva-malbec-75cl": {
        "productId": "la-celia-reserva-malbec-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "calvet-sancerre-les-hautes": {
        "productId": "calvet-sancerre-les-hautes",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "chateau-des-laurets-saint-emilion": {
        "productId": "chateau-des-laurets-saint-emilion",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "guinness-beer-cans-44cl": {
        "productId": "guinness-beer-cans-44cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "xxl-vodka-mix-energy-can": {
        "productId": "xxl-vodka-mix-energy-can",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "monkey-47-dry-gin-50cl": {
        "productId": "monkey-47-dry-gin-50cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "gentleman-jack-1-ltr-jd": {
        "productId": "gentleman-jack-1-ltr-jd",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-12-yr-fin-trip": {
        "productId": "macallan-12-yr-fin-trip",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-15-yrs-double-ca": {
        "productId": "macallan-15-yrs-double-ca",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "macallan-18-yrs": {
        "productId": "macallan-18-yrs",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "hoegarden-blanche-33cl-b": {
        "productId": "hoegarden-blanche-33cl-b",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "tequila-rose-liquer-70c-s-bery": {
        "productId": "tequila-rose-liquer-70c-s-bery",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "malfy-con-ara-blood-orange-gin-70": {
        "productId": "malfy-con-ara-blood-orange-gin-70",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "malfy-gin-rosa-70cl-grapfruite": {
        "productId": "malfy-gin-rosa-70cl-grapfruite",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "drumshanb-gunpoder-gin": {
        "productId": "drumshanb-gunpoder-gin",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ch-saint-maur-l-exelenc-ros-7": {
        "productId": "ch-saint-maur-l-exelenc-ros-7",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ch-lagrange-2010-st-julien": {
        "productId": "ch-lagrange-2010-st-julien",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ruinart-blanc-d-blanc-75-cl": {
        "productId": "ruinart-blanc-d-blanc-75-cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "zonin-prosecco-75cl": {
        "productId": "zonin-prosecco-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "oyster-bay-sauvignon": {
        "productId": "oyster-bay-sauvignon",
        "previousRest": 0,
        "incoming": 12,
        "movement": 0,
        "homeRest": 12,
        "extraRequest": 0
      },
      "balantines": {
        "productId": "balantines",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      }
    },
    "cashColumns": {
      "E": {
        "columnKey": "E",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "F": {
        "columnKey": "F",
        "driverName": "СУНАТ",
        "productRevenue": 1850,
        "foodExpenses": 80,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 100,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 1870,
        "comment": ""
      },
      "G": {
        "columnKey": "G",
        "driverName": "ДОВРОН",
        "productRevenue": 600,
        "foodExpenses": 80,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 100,
        "discounts": 0,
        "fuel": 170,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 250,
        "comment": ""
      },
      "H": {
        "columnKey": "H",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "I": {
        "columnKey": "I",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "J": {
        "columnKey": "J",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "K": {
        "columnKey": "K",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      }
    },
    "closed": false
  },
  {
    "id": "2026-05-28_tikom",
    "date": "2026-05-28",
    "pointId": "tikom",
    "driverId": "",
    "driverName": "Алишер",
    "items": {
      "absolut-blue-ltr": {
        "productId": "absolut-blue-ltr",
        "previousRest": 4,
        "incoming": 26,
        "movement": 0,
        "homeRest": 24,
        "extraRequest": 0
      },
      "j-w-red-label-1-ltr": {
        "productId": "j-w-red-label-1-ltr",
        "previousRest": 9,
        "incoming": 24,
        "movement": 0,
        "homeRest": 30,
        "extraRequest": 0
      },
      "j-w-blak-label-1-ltr": {
        "productId": "j-w-blak-label-1-ltr",
        "previousRest": 1,
        "incoming": 9,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "jack-daniels-ltr": {
        "productId": "jack-daniels-ltr",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "chivas-regal-1-ltr": {
        "productId": "chivas-regal-1-ltr",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "heineken-beer-cans-33cl": {
        "productId": "heineken-beer-cans-33cl",
        "previousRest": 1,
        "incoming": 5,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "budweiser-beer-can-33-35": {
        "productId": "budweiser-beer-can-33-35",
        "previousRest": 3.5,
        "incoming": 1.5,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "carlsberg-50cl-can": {
        "productId": "carlsberg-50cl-can",
        "previousRest": 2.5,
        "incoming": 3.5,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "red-horse-50cl-can": {
        "productId": "red-horse-50cl-can",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "amstel-light-slim-can-35": {
        "productId": "amstel-light-slim-can-35",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "corona-beer-btl-35-5cl": {
        "productId": "corona-beer-btl-35-5cl",
        "previousRest": 0,
        "incoming": 7,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "stella-33cl-btls": {
        "productId": "stella-33cl-btls",
        "previousRest": 0.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0.5,
        "extraRequest": 0
      },
      "stella-artois-33-cl-cans": {
        "productId": "stella-artois-33-cl-cans",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "heineken-beer-btl-33cl": {
        "productId": "heineken-beer-btl-33cl",
        "previousRest": 0.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0.5,
        "extraRequest": 0
      },
      "budweiser-berr-btl-33cl": {
        "productId": "budweiser-berr-btl-33cl",
        "previousRest": 0.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0.5,
        "extraRequest": 0
      },
      "smirnoff-ice-red-27-5cl": {
        "productId": "smirnoff-ice-red-27-5cl",
        "previousRest": 0,
        "incoming": 0.5,
        "movement": 0,
        "homeRest": 0.5,
        "extraRequest": 0
      },
      "peroni-nastro-azuro-beer": {
        "productId": "peroni-nastro-azuro-beer",
        "previousRest": 0.5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0.5,
        "extraRequest": 0
      },
      "jc-chardonnay-75cl": {
        "productId": "jc-chardonnay-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "jc-shiraz-cabarnet-75cl": {
        "productId": "jc-shiraz-cabarnet-75cl",
        "previousRest": 13,
        "incoming": 0,
        "movement": 0,
        "homeRest": 13,
        "extraRequest": 0
      },
      "ces-pinot-grig-d-ven-fio": {
        "productId": "ces-pinot-grig-d-ven-fio",
        "previousRest": 5,
        "incoming": 5,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "le-grand-noir-sauv-blanc": {
        "productId": "le-grand-noir-sauv-blanc",
        "previousRest": 2,
        "incoming": 13,
        "movement": 0,
        "homeRest": 14,
        "extraRequest": 0
      },
      "le-grand-noir-merlot-75c": {
        "productId": "le-grand-noir-merlot-75c",
        "previousRest": 4,
        "incoming": 6,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "mip-collection-rose-provienc-7": {
        "productId": "mip-collection-rose-provienc-7",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "ch-ksara-sunset-rose-75c": {
        "productId": "ch-ksara-sunset-rose-75c",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "mateus-rose-75cl": {
        "productId": "mateus-rose-75cl",
        "previousRest": 3,
        "incoming": 2,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "bacardi-white-rum-ltr": {
        "productId": "bacardi-white-rum-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "bacardi-black-1-ltr": {
        "productId": "bacardi-black-1-ltr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "bacardi-gold-ltr": {
        "productId": "bacardi-gold-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "jose-cuervo-gold-ltr": {
        "productId": "jose-cuervo-gold-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "jose-cuervo-silver-espec": {
        "productId": "jose-cuervo-silver-espec",
        "previousRest": 2,
        "incoming": 3,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "tanqueray-gin-ltr": {
        "productId": "tanqueray-gin-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "gordons-pink-gin-ltr": {
        "productId": "gordons-pink-gin-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "gordons-gin-ltr": {
        "productId": "gordons-gin-ltr",
        "previousRest": 2,
        "incoming": 3,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "bombay-sapphire-gin-ltr": {
        "productId": "bombay-sapphire-gin-ltr",
        "previousRest": 3,
        "incoming": 2,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "hendricks-gin-1-ltr": {
        "productId": "hendricks-gin-1-ltr",
        "previousRest": 0,
        "incoming": 5,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "captain-morgan-blk-ltr": {
        "productId": "captain-morgan-blk-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "captain-morgan-spiced-go": {
        "productId": "captain-morgan-spiced-go",
        "previousRest": 0,
        "incoming": 4,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "malibu-whithe-rum-ltr": {
        "productId": "malibu-whithe-rum-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "baileys-irish-cream-ltr": {
        "productId": "baileys-irish-cream-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "amarula-cream-ltr": {
        "productId": "amarula-cream-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "jameson-irish-wsk-ltr": {
        "productId": "jameson-irish-wsk-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "j-b-rare-scotch-1-ltr": {
        "productId": "j-b-rare-scotch-1-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "d-h-clarnet-select-5ltr": {
        "productId": "d-h-clarnet-select-5ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "d-h-prem-grn-cru-5ltr": {
        "productId": "d-h-prem-grn-cru-5ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "martini-bianco-1-ltr": {
        "productId": "martini-bianco-1-ltr",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "smirnoff-r-l-1-ltr": {
        "productId": "smirnoff-r-l-1-ltr",
        "previousRest": 3,
        "incoming": 7,
        "movement": 0,
        "homeRest": 10,
        "extraRequest": 0
      },
      "stolichnaya-vodka-ltr": {
        "productId": "stolichnaya-vodka-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "russian-std-peters-l": {
        "productId": "russian-std-peters-l",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "jagermeister-1-ltr": {
        "productId": "jagermeister-1-ltr",
        "previousRest": 4,
        "incoming": 1,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "belvedere-vodka-ltr": {
        "productId": "belvedere-vodka-ltr",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 5,
        "extraRequest": 0
      },
      "grey-goose-vodka-ltr": {
        "productId": "grey-goose-vodka-ltr",
        "previousRest": 5,
        "incoming": 10,
        "movement": 0,
        "homeRest": 13,
        "extraRequest": 0
      },
      "beluga-noble-vodka-70cl": {
        "productId": "beluga-noble-vodka-70cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "cirok-vodka-ltr": {
        "productId": "cirok-vodka-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "skyy-vodka-1-ltr": {
        "productId": "skyy-vodka-1-ltr",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "arak-touma-50-54cl": {
        "productId": "arak-touma-50-54cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "efe-fresh-grape-raki-ltr-green": {
        "productId": "efe-fresh-grape-raki-ltr-green",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "j-w-gold-label-reserv-1": {
        "productId": "j-w-gold-label-reserv-1",
        "previousRest": 5,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "j-w-double-black-ltr": {
        "productId": "j-w-double-black-ltr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "j-w-blue-label-1-ltr": {
        "productId": "j-w-blue-label-1-ltr",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "hennessy-vs-ltr": {
        "productId": "hennessy-vs-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "hennessy-v-s-o-p-1-ltr-pr": {
        "productId": "hennessy-v-s-o-p-1-ltr-pr",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "hennessy-xo-ltr": {
        "productId": "hennessy-xo-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "remy-martin-vsop-ltr": {
        "productId": "remy-martin-vsop-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "chivas-18-yrs-ltr": {
        "productId": "chivas-18-yrs-ltr",
        "previousRest": 2,
        "incoming": 4,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "royal-salute-21-yrs-ltr": {
        "productId": "royal-salute-21-yrs-ltr",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "patron-coffe": {
        "productId": "patron-coffe",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "patron-silver-75cl-tequi": {
        "productId": "patron-silver-75cl-tequi",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "patron-anejo-75cl-gold-t": {
        "productId": "patron-anejo-75cl-gold-t",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-blanco-70-75cl": {
        "productId": "don-julio-blanco-70-75cl",
        "previousRest": 0,
        "incoming": 3,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-reposado-70-75": {
        "productId": "don-julio-reposado-70-75",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "don-julio-anejo-70-75cl": {
        "productId": "don-julio-anejo-70-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "don-julio-1942-anejo-70": {
        "productId": "don-julio-1942-anejo-70",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "asti-martini-75cl": {
        "productId": "asti-martini-75cl",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "jc-chardonnay-pinot-noir": {
        "productId": "jc-chardonnay-pinot-noir",
        "previousRest": 5,
        "incoming": 1,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "bottega-vino-d-poet-pros": {
        "productId": "bottega-vino-d-poet-pros",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "bottega-rose-proseco-poe": {
        "productId": "bottega-rose-proseco-poe",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "bottega-gold-brut-75c-vi": {
        "productId": "bottega-gold-brut-75c-vi",
        "previousRest": 4,
        "incoming": 2,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "veuve-clicquot-y-l-ponsr": {
        "productId": "veuve-clicquot-y-l-ponsr",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "moet-chandon-brut-imp": {
        "productId": "moet-chandon-brut-imp",
        "previousRest": 9,
        "incoming": 0,
        "movement": 0,
        "homeRest": 9,
        "extraRequest": 0
      },
      "moet-chandon-rose-75cl": {
        "productId": "moet-chandon-rose-75cl",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "moet-ice-imperial-75cl": {
        "productId": "moet-ice-imperial-75cl",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "dom-perignon-m-c-75cl": {
        "productId": "dom-perignon-m-c-75cl",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "glendfidich-spl-r12yrs": {
        "productId": "glendfidich-spl-r12yrs",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "glendfidich-15-yrs-ltr": {
        "productId": "glendfidich-15-yrs-ltr",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "glendfidich-18y-smal-bat": {
        "productId": "glendfidich-18y-smal-bat",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "baron-rimapere-sauv-blan": {
        "productId": "baron-rimapere-sauv-blan",
        "previousRest": 4,
        "incoming": 0,
        "movement": 0,
        "homeRest": 4,
        "extraRequest": 0
      },
      "marchesi-gavi-d-gavi-75c": {
        "productId": "marchesi-gavi-d-gavi-75c",
        "previousRest": 2,
        "incoming": 4,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "laroche-chablis-st-marti": {
        "productId": "laroche-chablis-st-marti",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "l-j-bourgogne-bl-cuv-d-ja": {
        "productId": "l-j-bourgogne-bl-cuv-d-ja",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "castel-ch-barreyres-haut-m-75": {
        "productId": "castel-ch-barreyres-haut-m-75",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "ch-saint-leon-box-sup-75": {
        "productId": "ch-saint-leon-box-sup-75",
        "previousRest": 2,
        "incoming": 7,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "campo-viejo-reserva-rioj": {
        "productId": "campo-viejo-reserva-rioj",
        "previousRest": 8,
        "incoming": 0,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "campo-viejo-gran-reserva": {
        "productId": "campo-viejo-gran-reserva",
        "previousRest": 7,
        "incoming": 0,
        "movement": 0,
        "homeRest": 7,
        "extraRequest": 0
      },
      "m-minuty-rose-provence": {
        "productId": "m-minuty-rose-provence",
        "previousRest": 2,
        "incoming": 4,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "cav-d-escln-whispering": {
        "productId": "cav-d-escln-whispering",
        "previousRest": 4,
        "incoming": 2,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "jack-daniels-honey-ltr": {
        "productId": "jack-daniels-honey-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "baccardi-breezer-w-melon": {
        "productId": "baccardi-breezer-w-melon",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "asahi-beer-btls-super-dr": {
        "productId": "asahi-beer-btls-super-dr",
        "previousRest": 0,
        "incoming": 2,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "aperole-aperitivo-ltr": {
        "productId": "aperole-aperitivo-ltr",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "chivas-25-yrs": {
        "productId": "chivas-25-yrs",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "clase-azul-reposado-70-7": {
        "productId": "clase-azul-reposado-70-7",
        "previousRest": 3,
        "incoming": 0,
        "movement": 0,
        "homeRest": 3,
        "extraRequest": 0
      },
      "ms-ch-perron-lalande-d-pomerol": {
        "productId": "ms-ch-perron-lalande-d-pomerol",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "la-celia-reserva-malbec-75cl": {
        "productId": "la-celia-reserva-malbec-75cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "calvet-sancerre-les-hautes": {
        "productId": "calvet-sancerre-les-hautes",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "chateau-des-laurets-saint-emilion": {
        "productId": "chateau-des-laurets-saint-emilion",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "guinness-beer-cans-44cl": {
        "productId": "guinness-beer-cans-44cl",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "xxl-vodka-mix-energy-can": {
        "productId": "xxl-vodka-mix-energy-can",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "monkey-47-dry-gin-50cl": {
        "productId": "monkey-47-dry-gin-50cl",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "gentleman-jack-1-ltr-jd": {
        "productId": "gentleman-jack-1-ltr-jd",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-12-yr-fin-trip": {
        "productId": "macallan-12-yr-fin-trip",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "macallan-15-yrs-double-ca": {
        "productId": "macallan-15-yrs-double-ca",
        "previousRest": 2,
        "incoming": 0,
        "movement": 0,
        "homeRest": 2,
        "extraRequest": 0
      },
      "macallan-18-yrs": {
        "productId": "macallan-18-yrs",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "hoegarden-blanche-33cl-b": {
        "productId": "hoegarden-blanche-33cl-b",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "tequila-rose-liquer-70c-s-bery": {
        "productId": "tequila-rose-liquer-70c-s-bery",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "malfy-con-ara-blood-orange-gin-70": {
        "productId": "malfy-con-ara-blood-orange-gin-70",
        "previousRest": 0,
        "incoming": 1,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "malfy-gin-rosa-70cl-grapfruite": {
        "productId": "malfy-gin-rosa-70cl-grapfruite",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "drumshanb-gunpoder-gin": {
        "productId": "drumshanb-gunpoder-gin",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ch-saint-maur-l-exelenc-ros-7": {
        "productId": "ch-saint-maur-l-exelenc-ros-7",
        "previousRest": 0,
        "incoming": 0,
        "movement": 0,
        "homeRest": 0,
        "extraRequest": 0
      },
      "ch-lagrange-2010-st-julien": {
        "productId": "ch-lagrange-2010-st-julien",
        "previousRest": 1,
        "incoming": 0,
        "movement": 0,
        "homeRest": 1,
        "extraRequest": 0
      },
      "ruinart-blanc-d-blanc-75-cl": {
        "productId": "ruinart-blanc-d-blanc-75-cl",
        "previousRest": 6,
        "incoming": 0,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      },
      "zonin-prosecco-75cl": {
        "productId": "zonin-prosecco-75cl",
        "previousRest": 0,
        "incoming": 8,
        "movement": 0,
        "homeRest": 8,
        "extraRequest": 0
      },
      "oyster-bay-sauvignon": {
        "productId": "oyster-bay-sauvignon",
        "previousRest": 2,
        "incoming": 6,
        "movement": 0,
        "homeRest": 6,
        "extraRequest": 0
      }
    },
    "cashColumns": {
      "E": {
        "columnKey": "E",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "F": {
        "columnKey": "F",
        "driverName": "Алишер",
        "productRevenue": 3750,
        "foodExpenses": 80,
        "weReturnedDebt": 50,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 150,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 3470,
        "comment": ""
      },
      "G": {
        "columnKey": "G",
        "driverName": "Файзидин",
        "productRevenue": 2500,
        "foodExpenses": 80,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 2420,
        "comment": ""
      },
      "H": {
        "columnKey": "H",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "I": {
        "columnKey": "I",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "J": {
        "columnKey": "J",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      },
      "K": {
        "columnKey": "K",
        "driverName": "",
        "productRevenue": 0,
        "foodExpenses": 0,
        "weReturnedDebt": 0,
        "weOwe": 0,
        "clientReturnedDebt": 0,
        "clientTookDebt": 0,
        "discounts": 0,
        "fuel": 0,
        "kfc": 0,
        "forHome": 0,
        "carWash": 0,
        "tinting": 0,
        "otherExpenses": 0,
        "handedOver": 0,
        "comment": ""
      }
    },
    "closed": false
  }
];

export const TEMPLATE_POINT_SEEDS: Point[] = TEMPLATE_POINTS.map((point) => ({
  id: point.id,
  name: point.name,
  sheetName: point.sheetName,
  excelTitle: point.excelTitle,
  active: true
}));

export function getTemplatePoint(pointId: string) {
  return TEMPLATE_POINTS.find((point) => point.id === pointId);
}
