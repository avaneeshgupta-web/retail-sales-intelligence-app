export interface StoreMasterRecord {
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  storeFormat: string;
  storeManager?: string;
  baselineTarget?: number;
}

export interface WeeklySalesRecord {
  weekStartDate: string; // ISO date string YYYY-MM-DD
  storeId: string;
  category: string;
  grossSales: number;
  discountAmount: number;
  returnAmount: number;
  transactions: number;
  salesTarget: number;
  stockoutIncidents: number;
}

export interface MergedSalesRecord {
  id: string;
  weekStartDate: string;
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  storeFormat: string;
  storeManager?: string;
  category: string;
  grossSales: number;
  discountAmount: number;
  returnAmount: number;
  netSales: number; // Gross - Discount - Return
  transactions: number;
  salesTarget: number;
  targetAchievementPct: number; // (Net Sales / Target) * 100
  returnRatePct: number; // (Return Amount / Net Sales) * 100
  discountRatePct: number; // (Discount / Gross) * 100
  atv: number; // Net Sales / Transactions
  stockoutIncidents: number;
}

export interface FilterState {
  weekStartDates: string[];
  regions: string[];
  storeNames: string[];
  cities: string[];
  storeFormats: string[];
  categories: string[];
}

export interface KpiMetrics {
  totalGrossSales: number;
  totalDiscountAmount: number;
  totalReturnAmount: number;
  totalNetSales: number;
  totalSalesTarget: number;
  targetAchievementPct: number;
  totalTransactions: number;
  atv: number;
  returnRatePct: number;
  discountRatePct: number;
  totalStockoutIncidents: number;
  storeCount: number;
  recordsCount: number;
}

export interface RegionalPerformance {
  region: string;
  netSales: number;
  salesTarget: number;
  achievementPct: number;
  grossSales: number;
  returnAmount: number;
  transactions: number;
  storeCount: number;
}

export interface CategoryPerformance {
  category: string;
  grossSales: number;
  netSales: number;
  returnAmount: number;
  discountAmount: number;
  returnRatePct: number;
  stockoutIncidents: number;
  transactions: number;
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  storeFormat: string;
  netSales: number;
  salesTarget: number;
  achievementPct: number;
  variance: number;
  stockouts: number;
}

export interface ExecutiveInsightsData {
  bestRegion: { name: string; netSales: number; achievementPct: number };
  worstRegion: { name: string; netSales: number; achievementPct: number };
  allRegionsRanked: RegionalPerformance[];
  failingStores: StorePerformance[];
  passingStoresCount: number;
  totalStoresCount: number;
  highReturnCategories: CategoryPerformance[];
  criticalStockouts: {
    totalIncidents: number;
    topCategory: string;
    topCategoryIncidents: number;
    categoryBreakdown: { category: string; incidents: number; percentage: number }[];
    estimatedLostSales: number;
  };
  overallVerdict: {
    status: 'Exceeding' | 'On Track' | 'Underperforming' | 'Critical Risk';
    badgeColor: string;
    summaryParagraph: string;
    keyRecommendations: string[];
  };
}
