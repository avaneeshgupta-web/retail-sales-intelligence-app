import {
  MergedSalesRecord,
  KpiMetrics,
  RegionalPerformance,
  CategoryPerformance,
  StorePerformance,
  ExecutiveInsightsData,
} from '../types/retail';
export { downloadExecutiveReport } from './excelParser';

export function calculateKpis(records: MergedSalesRecord[]): KpiMetrics {
  if (records.length === 0) {
    return {
      totalGrossSales: 0,
      totalDiscountAmount: 0,
      totalReturnAmount: 0,
      totalNetSales: 0,
      totalSalesTarget: 0,
      targetAchievementPct: 0,
      totalTransactions: 0,
      atv: 0,
      returnRatePct: 0,
      discountRatePct: 0,
      totalStockoutIncidents: 0,
      storeCount: 0,
      recordsCount: 0,
    };
  }

  let totalGross = 0;
  let totalDiscount = 0;
  let totalReturn = 0;
  let totalTarget = 0;
  let totalTxns = 0;
  let totalStockouts = 0;
  const storeSet = new Set<string>();

  for (const r of records) {
    totalGross += r.grossSales;
    totalDiscount += r.discountAmount;
    totalReturn += r.returnAmount;
    totalTarget += r.salesTarget;
    totalTxns += r.transactions;
    totalStockouts += r.stockoutIncidents;
    storeSet.add(r.storeId);
  }

  // Net Sales = Total (Gross Sales - Discount Amount - Returns Amount)
  const totalNet = totalGross - totalDiscount - totalReturn;

  // Target Achievement % = (Total Net Sales / Total Sales Target) * 100
  const targetAchievementPct = totalTarget > 0 ? (totalNet / totalTarget) * 100 : 0;

  // Average Transaction Value (ATV) = Total Net Sales / Total Transactions
  const atv = totalTxns > 0 ? totalNet / totalTxns : 0;

  // Return Rate % = (Total Return Amount / Total Net Sales) * 100
  const returnRatePct = totalNet > 0 ? (totalReturn / totalNet) * 100 : 0;

  // Discount Rate % = (Total Discount Amount / Total Gross Sales) * 100
  const discountRatePct = totalGross > 0 ? (totalDiscount / totalGross) * 100 : 0;

  return {
    totalGrossSales: totalGross,
    totalDiscountAmount: totalDiscount,
    totalReturnAmount: totalReturn,
    totalNetSales: totalNet,
    totalSalesTarget: totalTarget,
    targetAchievementPct,
    totalTransactions: totalTxns,
    atv,
    returnRatePct,
    discountRatePct,
    totalStockoutIncidents: totalStockouts,
    storeCount: storeSet.size,
    recordsCount: records.length,
  };
}

// 1. Weekly Sales Trend: Continuous line chart Net Sales vs Target over time
export interface WeeklyTrendData {
  labels: string[];
  netSales: number[];
  targets: number[];
  achievementPct: number[];
}

export function computeWeeklyTrend(records: MergedSalesRecord[]): WeeklyTrendData {
  const weekMap = new Map<string, { net: number; target: number }>();

  for (const r of records) {
    const current = weekMap.get(r.weekStartDate) || { net: 0, target: 0 };
    current.net += r.netSales;
    current.target += r.salesTarget;
    weekMap.set(r.weekStartDate, current);
  }

  const sortedWeeks = Array.from(weekMap.keys()).sort();
  const labels: string[] = [];
  const netSales: number[] = [];
  const targets: number[] = [];
  const achievementPct: number[] = [];

  for (const w of sortedWeeks) {
    const val = weekMap.get(w)!;
    // Format label to readable week: e.g. "Aug 03" or "W-08/03"
    const [y, m, d] = w.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const label = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : w;

    labels.push(label);
    netSales.push(Math.round(val.net));
    targets.push(Math.round(val.target));
    achievementPct.push(val.target > 0 ? Math.round((val.net / val.target) * 1000) / 10 : 0);
  }

  return { labels, netSales, targets, achievementPct };
}

// 2. Regional Revenue Splitting: Bar chart displaying Net Sales and Target Achievement % across regions
export function computeRegionalSplits(records: MergedSalesRecord[]): RegionalPerformance[] {
  const regionMap = new Map<
    string,
    {
      net: number;
      target: number;
      gross: number;
      returns: number;
      txns: number;
      stores: Set<string>;
    }
  >();

  for (const r of records) {
    const current = regionMap.get(r.region) || {
      net: 0,
      target: 0,
      gross: 0,
      returns: 0,
      txns: 0,
      stores: new Set(),
    };
    current.net += r.netSales;
    current.target += r.salesTarget;
    current.gross += r.grossSales;
    current.returns += r.returnAmount;
    current.txns += r.transactions;
    current.stores.add(r.storeId);
    regionMap.set(r.region, current);
  }

  const results: RegionalPerformance[] = [];
  regionMap.forEach((val, region) => {
    results.push({
      region,
      netSales: Math.round(val.net),
      salesTarget: Math.round(val.target),
      achievementPct: val.target > 0 ? Math.round((val.net / val.target) * 1000) / 10 : 0,
      grossSales: Math.round(val.gross),
      returnAmount: Math.round(val.returns),
      transactions: val.txns,
      storeCount: val.stores.size,
    });
  });

  return results.sort((a, b) => b.netSales - a.netSales);
}

// 3. Category Performance: Grouped bar chart comparing Gross Sales, Net Sales, and Return Rate by Category
export function computeCategoryPerformance(records: MergedSalesRecord[]): CategoryPerformance[] {
  const catMap = new Map<
    string,
    {
      gross: number;
      net: number;
      returns: number;
      discounts: number;
      stockouts: number;
      txns: number;
    }
  >();

  for (const r of records) {
    const current = catMap.get(r.category) || {
      gross: 0,
      net: 0,
      returns: 0,
      discounts: 0,
      stockouts: 0,
      txns: 0,
    };
    current.gross += r.grossSales;
    current.net += r.netSales;
    current.returns += r.returnAmount;
    current.discounts += r.discountAmount;
    current.stockouts += r.stockoutIncidents;
    current.txns += r.transactions;
    catMap.set(r.category, current);
  }

  const results: CategoryPerformance[] = [];
  catMap.forEach((val, category) => {
    const returnRatePct = val.net > 0 ? Math.round((val.returns / val.net) * 1000) / 10 : 0;
    results.push({
      category,
      grossSales: Math.round(val.gross),
      netSales: Math.round(val.net),
      returnAmount: Math.round(val.returns),
      discountAmount: Math.round(val.discounts),
      returnRatePct,
      stockoutIncidents: val.stockouts,
      transactions: val.txns,
    });
  });

  return results.sort((a, b) => b.netSales - a.netSales);
}

// 4. Store Leaderboard: Horizontal bar chart comparing Top 5 Performing Stores vs Bottom 5 Stores against Sales Targets
export interface StoreLeaderboardData {
  top5: StorePerformance[];
  bottom5: StorePerformance[];
  allStores: StorePerformance[];
}

export function computeStoreLeaderboard(records: MergedSalesRecord[]): StoreLeaderboardData {
  const storeMap = new Map<
    string,
    {
      storeName: string;
      region: string;
      city: string;
      format: string;
      net: number;
      target: number;
      stockouts: number;
    }
  >();

  for (const r of records) {
    const current = storeMap.get(r.storeId) || {
      storeName: r.storeName,
      region: r.region,
      city: r.city,
      format: r.storeFormat,
      net: 0,
      target: 0,
      stockouts: 0,
    };
    current.net += r.netSales;
    current.target += r.salesTarget;
    current.stockouts += r.stockoutIncidents;
    storeMap.set(r.storeId, current);
  }

  const storeList: StorePerformance[] = [];
  storeMap.forEach((val, storeId) => {
    const net = Math.round(val.net);
    const target = Math.round(val.target);
    const achievementPct = target > 0 ? Math.round((net / target) * 1000) / 10 : 0;
    storeList.push({
      storeId,
      storeName: val.storeName,
      region: val.region,
      city: val.city,
      storeFormat: val.format,
      netSales: net,
      salesTarget: target,
      achievementPct,
      variance: net - target,
      stockouts: val.stockouts,
    });
  });

  // Sort by achievement % descending
  const sortedByAchievement = [...storeList].sort((a, b) => b.achievementPct - a.achievementPct);

  const top5 = sortedByAchievement.slice(0, 5);
  // Bottom 5 (ordered ascending or reverse)
  const bottom5 = sortedByAchievement.length > 5 ? sortedByAchievement.slice(-5).reverse() : [];

  return {
    top5,
    bottom5,
    allStores: sortedByAchievement,
  };
}

// 5. Stockout Risk: Doughnut chart showing stockout incidents across product categories
export interface StockoutRiskData {
  categories: string[];
  counts: number[];
  percentages: number[];
  totalIncidents: number;
}

export function computeStockoutRisk(records: MergedSalesRecord[]): StockoutRiskData {
  const catStockouts = new Map<string, number>();
  let total = 0;

  for (const r of records) {
    const current = catStockouts.get(r.category) || 0;
    catStockouts.set(r.category, current + r.stockoutIncidents);
    total += r.stockoutIncidents;
  }

  const sorted = Array.from(catStockouts.entries()).sort((a, b) => b[1] - a[1]);
  const categories = sorted.map((s) => s[0]);
  const counts = sorted.map((s) => s[1]);
  const percentages = counts.map((c) => (total > 0 ? Math.round((c / total) * 1000) / 10 : 0));

  return {
    categories,
    counts,
    percentages,
    totalIncidents: total,
  };
}

// 5. EXECUTIVE BUSINESS INSIGHTS SUMMARY GENERATOR
export function generateExecutiveInsights(
  records: MergedSalesRecord[],
  kpis: KpiMetrics
): ExecutiveInsightsData {
  const regions = computeRegionalSplits(records);
  const categories = computeCategoryPerformance(records);
  const stores = computeStoreLeaderboard(records);
  const stockoutRisk = computeStockoutRisk(records);

  const bestRegion = regions.length > 0 ? regions[0] : { region: 'N/A', netSales: 0, achievementPct: 0 };
  const worstRegion =
    regions.length > 1
      ? [...regions].sort((a, b) => a.achievementPct - b.achievementPct)[0]
      : bestRegion;

  // Stores failing target achievement (< 100%)
  const failingStores = stores.allStores.filter((s) => s.achievementPct < 100);
  const passingStoresCount = stores.allStores.filter((s) => s.achievementPct >= 100).length;

  // Categories with high return rates (> 8%)
  const highReturnCategories = categories.filter((c) => c.returnRatePct > 8.0);

  // Critical stockout analysis
  const topStockoutCategory = stockoutRisk.categories[0] || 'None';
  const topCategoryIncidents = stockoutRisk.counts[0] || 0;
  // Estimated lost sales: rough proxy based on average ticket value * 3 per incident
  const estimatedLostSales = Math.round(stockoutRisk.totalIncidents * kpis.atv * 4.5);

  const categoryBreakdown = stockoutRisk.categories.map((cat, idx) => ({
    category: cat,
    incidents: stockoutRisk.counts[idx],
    percentage: stockoutRisk.percentages[idx],
  }));

  // Overall Verdict
  let status: 'Exceeding' | 'On Track' | 'Underperforming' | 'Critical Risk' = 'On Track';
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (kpis.targetAchievementPct >= 105) {
    status = 'Exceeding';
    badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (kpis.targetAchievementPct >= 98) {
    status = 'On Track';
    badgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  } else if (kpis.targetAchievementPct >= 90) {
    status = 'Underperforming';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  } else {
    status = 'Critical Risk';
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  }

  const formatCurr = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const summaryParagraph = `Overall retail network generated ${formatCurr(
    kpis.totalNetSales
  )} in Net Sales against an assigned quota of ${formatCurr(kpis.totalSalesTarget)} (${kpis.targetAchievementPct.toFixed(
    1
  )}% achievement). Out of ${stores.allStores.length} monitored retail locations, ${failingStores.length} stores are lagging behind their quota (${passingStoresCount} meeting or beating targets). ${bestRegion.region} leads the enterprise at ${bestRegion.achievementPct.toFixed(
    1
  )}% achievement, whereas ${worstRegion.region} requires targeted intervention at ${worstRegion.achievementPct.toFixed(
    1
  )}%. High return rates (>8%) in ${highReturnCategories.map((c) => c.category).join(', ') || 'none'} are eroding margins by ${formatCurr(
    highReturnCategories.reduce((acc, c) => acc + c.returnAmount, 0)
  )}.`;

  const keyRecommendations: string[] = [];

  if (failingStores.length > 0) {
    const topFailingNames = failingStores.slice(0, 3).map((s) => `${s.storeName} (${s.achievementPct}%)`).join(', ');
    keyRecommendations.push(
      `Dispatch regional field merchandising support to bottom-performing locations: ${topFailingNames}.`
    );
  }

  if (highReturnCategories.length > 0) {
    keyRecommendations.push(
      `Initiate return quality audits for ${highReturnCategories.map((c) => `${c.category} (${c.returnRatePct}%)`).join(' and ')}, reviewing sizing charts, packaging damage, and vendor return allowances.`
    );
  }

  if (stockoutRisk.totalIncidents > 0) {
    keyRecommendations.push(
      `Re-calibrate reorder safety stock triggers in ${topStockoutCategory} (${topCategoryIncidents} incidents, ${stockoutRisk.percentages[0]}% of total) to recover an estimated ${formatCurr(
        estimatedLostSales
      )} in lost revenue.`
    );
  }

  if (kpis.discountRatePct > 12) {
    keyRecommendations.push(
      `Discount rate is running elevated at ${kpis.discountRatePct.toFixed(
        1
      )}% of gross sales; tighten promotional markdowns in over-performing categories.`
    );
  }

  return {
    bestRegion: {
      name: bestRegion.region,
      netSales: bestRegion.netSales,
      achievementPct: bestRegion.achievementPct,
    },
    worstRegion: {
      name: worstRegion.region,
      netSales: worstRegion.netSales,
      achievementPct: worstRegion.achievementPct,
    },
    allRegionsRanked: regions,
    failingStores,
    passingStoresCount,
    totalStoresCount: stores.allStores.length,
    highReturnCategories,
    criticalStockouts: {
      totalIncidents: stockoutRisk.totalIncidents,
      topCategory: topStockoutCategory,
      topCategoryIncidents,
      categoryBreakdown,
      estimatedLostSales,
    },
    overallVerdict: {
      status,
      badgeColor,
      summaryParagraph,
      keyRecommendations,
    },
  };
}

// Generate the printable text report for download
export function generateTextReport(
  records: MergedSalesRecord[],
  kpis: KpiMetrics,
  insights: ExecutiveInsightsData,
  filterDescription: string
): string {
  const formatCurr = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const now = new Date().toLocaleString();

  const lines: string[] = [];
  lines.push('================================================================================');
  lines.push('                   RETAIL SALES INTELLIGENCE EXECUTIVE REPORT                   ');
  lines.push('================================================================================');
  lines.push(`Generated: ${now}`);
  lines.push(`Applied Filters: ${filterDescription}`);
  lines.push(`Dataset Scope: ${kpis.recordsCount} line items across ${kpis.storeCount} active store locations`);
  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('1. EXECUTIVE KPI SCORECARD SUMMARY');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`• Total Net Sales:              ${formatCurr(kpis.totalNetSales)}`);
  lines.push(`• Total Sales Target:           ${formatCurr(kpis.totalSalesTarget)}`);
  lines.push(`• Target Achievement Rate:      ${kpis.targetAchievementPct.toFixed(2)}%`);
  lines.push(`• Average Transaction Value:    $${kpis.atv.toFixed(2)}`);
  lines.push(`• Return Rate:                  ${kpis.returnRatePct.toFixed(2)}% (Returns: ${formatCurr(kpis.totalReturnAmount)})`);
  lines.push(`• Discount Rate:                ${kpis.discountRatePct.toFixed(2)}% (Discounts: ${formatCurr(kpis.totalDiscountAmount)})`);
  lines.push(`• Total Stockout Incidents:     ${kpis.totalStockoutIncidents} incidents`);
  lines.push(`• Gross Sales:                  ${formatCurr(kpis.totalGrossSales)}`);
  lines.push(`• Total Transactions:           ${kpis.totalTransactions.toLocaleString()} tickets`);
  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('2. EXECUTIVE ASSESSMENT & STRATEGIC OVERVIEW');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Performance Status: [${insights.overallVerdict.status.toUpperCase()}]`);
  lines.push(insights.overallVerdict.summaryParagraph);
  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('3. REGIONAL PERFORMANCE RANKING');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Best Performing Region:  ${insights.bestRegion.name} (${insights.bestRegion.achievementPct.toFixed(1)}% Attainment, ${formatCurr(insights.bestRegion.netSales)})`);
  lines.push(`Lagging Region:          ${insights.worstRegion.name} (${insights.worstRegion.achievementPct.toFixed(1)}% Attainment, ${formatCurr(insights.worstRegion.netSales)})`);
  lines.push('');
  insights.allRegionsRanked.forEach((r, i) => {
    lines.push(`  ${i + 1}. ${r.region.padEnd(14)} | Net: ${formatCurr(r.netSales).padEnd(13)} | Target: ${formatCurr(r.salesTarget).padEnd(13)} | Achievement: ${r.achievementPct.toFixed(1)}% | Stores: ${r.storeCount}`);
  });
  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('4. STORES FAILING SALES TARGET (< 100%)');
  lines.push('--------------------------------------------------------------------------------');
  if (insights.failingStores.length === 0) {
    lines.push('All monitored stores met or exceeded their respective sales quotas (100%+ attainment).');
  } else {
    lines.push(`Total Failing Locations: ${insights.failingStores.length} out of ${insights.totalStoresCount} stores (${((insights.failingStores.length / insights.totalStoresCount) * 100).toFixed(1)}%)`);
    lines.push('');
    insights.failingStores.forEach((s) => {
      lines.push(`  • [${s.storeId}] ${s.storeName.padEnd(26)} | Region: ${s.region.padEnd(8)} | Format: ${s.storeFormat.padEnd(12)} | Achievement: ${s.achievementPct.toFixed(1)}% | Deficit: -${formatCurr(Math.abs(s.variance))}`);
    });
  }
  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('5. CATEGORIES WITH ELEVATED RETURN RATES (> 8%)');
  lines.push('--------------------------------------------------------------------------------');
  if (insights.highReturnCategories.length === 0) {
    lines.push('No product categories exceeded the acceptable 8% return threshold.');
  } else {
    insights.highReturnCategories.forEach((c) => {
      lines.push(`  • ${c.category.padEnd(24)} | Return Rate: ${c.returnRatePct.toFixed(1)}% | Returned Value: ${formatCurr(c.returnAmount)} | Net Sales: ${formatCurr(c.netSales)}`);
    });
  }
  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('6. CRITICAL STOCKOUT RISKS & INVENTORY INTEGRITY');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Total Stockout Events:        ${insights.criticalStockouts.totalIncidents}`);
  lines.push(`Primary Bottleneck Category:  ${insights.criticalStockouts.topCategory} (${insights.criticalStockouts.topCategoryIncidents} incidents)`);
  lines.push(`Estimated Lost Revenue:       ~${formatCurr(insights.criticalStockouts.estimatedLostSales)}`);
  lines.push('');
  lines.push('Category Distribution:');
  insights.criticalStockouts.categoryBreakdown.forEach((b) => {
    lines.push(`  - ${b.category.padEnd(24)}: ${String(b.incidents).padStart(3)} incidents (${b.percentage.toFixed(1)}%)`);
  });
  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('7. RECOMMENDED ACTION ITEMS');
  lines.push('--------------------------------------------------------------------------------');
  insights.overallVerdict.keyRecommendations.forEach((rec, idx) => {
    lines.push(`${idx + 1}. ${rec}`);
  });
  lines.push('');
  lines.push('================================================================================');
  lines.push('                            END OF EXECUTIVE REPORT                             ');
  lines.push('================================================================================');

  return lines.join('\n');
}
