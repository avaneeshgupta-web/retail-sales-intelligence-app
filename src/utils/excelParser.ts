import * as XLSX from 'xlsx';
import {
  StoreMasterRecord,
  WeeklySalesRecord,
  MergedSalesRecord,
} from '../types/retail';
import { DEMO_STORES, generateDemoSalesData } from '../data/demoData';

// Helper to normalize header keys
function normalizeKey(key: string): string {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, '');
}

// Helper to safely parse numbers
function parseNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

// Convert Excel serial date or string date to YYYY-MM-DD
function parseExcelDate(val: any): string {
  if (!val) return '2026-08-03';
  if (typeof val === 'number') {
    // Excel serial date to JS Date
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + val * 86400000);
    return jsDate.toISOString().split('T')[0];
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString().split('T')[0];
  }
  return str;
}

export async function parseStoreMasterExcel(file: File): Promise<StoreMasterRecord[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Store Master file is empty or cannot be parsed.');
  }

  // Find column mapping by analyzing first row
  const firstRow = rawRows[0];
  const keyMap: Record<string, string> = {};
  for (const rawCol of Object.keys(firstRow)) {
    const norm = normalizeKey(rawCol);
    if (['storeid', 'storecode', 'storenumber', 'id', 'code'].includes(norm)) {
      keyMap.storeId = rawCol;
    } else if (['storename', 'name', 'store', 'locationname'].includes(norm)) {
      keyMap.storeName = rawCol;
    } else if (['region', 'zone', 'territory', 'division'].includes(norm)) {
      keyMap.region = rawCol;
    } else if (['city', 'metro', 'location', 'town'].includes(norm)) {
      keyMap.city = rawCol;
    } else if (['storeformat', 'format', 'type', 'storetype'].includes(norm)) {
      keyMap.storeFormat = rawCol;
    } else if (['storemanager', 'manager', 'lead'].includes(norm)) {
      keyMap.storeManager = rawCol;
    } else if (['baselinetarget', 'salestarget', 'target', 'budget'].includes(norm)) {
      keyMap.baselineTarget = rawCol;
    }
  }

  const stores: StoreMasterRecord[] = rawRows.map((row, index) => {
    const storeId = String(row[keyMap.storeId] || row['Store_ID'] || row['Store ID'] || `STR-${100 + index}`).trim();
    const storeName = String(row[keyMap.storeName] || row['Store_Name'] || row['Store Name'] || `Store ${storeId}`).trim();
    const region = String(row[keyMap.region] || row['Region'] || 'General').trim();
    const city = String(row[keyMap.city] || row['City'] || 'Metro Area').trim();
    const storeFormat = String(row[keyMap.storeFormat] || row['Store_Format'] || row['Format'] || 'Standard').trim();
    const storeManager = row[keyMap.storeManager] ? String(row[keyMap.storeManager]).trim() : undefined;
    const baselineTarget = row[keyMap.baselineTarget] ? parseNumber(row[keyMap.baselineTarget]) : undefined;

    return {
      storeId,
      storeName,
      region,
      city,
      storeFormat,
      storeManager,
      baselineTarget,
    };
  });

  return stores;
}

export async function parseWeeklySalesExcel(file: File): Promise<WeeklySalesRecord[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Weekly Sales file is empty or cannot be parsed.');
  }

  const firstRow = rawRows[0];
  const keyMap: Record<string, string> = {};
  for (const rawCol of Object.keys(firstRow)) {
    const norm = normalizeKey(rawCol);
    if (['weekstartdate', 'weekstart', 'week', 'date', 'transactionweek', 'period'].includes(norm)) {
      keyMap.weekStartDate = rawCol;
    } else if (['storeid', 'storecode', 'store', 'id'].includes(norm)) {
      keyMap.storeId = rawCol;
    } else if (['category', 'productcategory', 'department', 'dept'].includes(norm)) {
      keyMap.category = rawCol;
    } else if (['grosssales', 'gross', 'revenue', 'totalsales'].includes(norm)) {
      keyMap.grossSales = rawCol;
    } else if (['discountamount', 'discount', 'discounts', 'markdown'].includes(norm)) {
      keyMap.discountAmount = rawCol;
    } else if (['returnamount', 'returns', 'return', 'refunds'].includes(norm)) {
      keyMap.returnAmount = rawCol;
    } else if (['transactions', 'txns', 'orders', 'tickets', 'customercount'].includes(norm)) {
      keyMap.transactions = rawCol;
    } else if (['salestarget', 'target', 'quota', 'budget'].includes(norm)) {
      keyMap.salesTarget = rawCol;
    } else if (['stockoutincidents', 'stockouts', 'stockout', 'oos'].includes(norm)) {
      keyMap.stockoutIncidents = rawCol;
    }
  }

  const sales: WeeklySalesRecord[] = rawRows.map((row) => {
    const weekStartDate = parseExcelDate(row[keyMap.weekStartDate] || row['Week_Start_Date'] || row['Week Start Date']);
    const storeId = String(row[keyMap.storeId] || row['Store_ID'] || row['Store ID'] || '').trim();
    const category = String(row[keyMap.category] || row['Category'] || 'General Merchandise').trim();
    const grossSales = parseNumber(row[keyMap.grossSales] ?? row['Gross_Sales'] ?? row['Gross Sales']);
    const discountAmount = parseNumber(row[keyMap.discountAmount] ?? row['Discount_Amount'] ?? row['Discount Amount']);
    const returnAmount = parseNumber(row[keyMap.returnAmount] ?? row['Return_Amount'] ?? row['Return Amount']);
    const transactions = Math.max(1, Math.round(parseNumber(row[keyMap.transactions] ?? row['Transactions'] ?? 100)));
    const salesTarget = parseNumber(row[keyMap.salesTarget] ?? row['Sales_Target'] ?? row['Sales Target'] ?? grossSales);
    const stockoutIncidents = Math.max(0, Math.round(parseNumber(row[keyMap.stockoutIncidents] ?? row['Stockout_Incidents'] ?? row['Stockouts'] ?? 0)));

    return {
      weekStartDate,
      storeId,
      category,
      grossSales,
      discountAmount,
      returnAmount,
      transactions,
      salesTarget,
      stockoutIncidents,
    };
  });

  return sales;
}

export function mergeSalesWithStores(
  sales: WeeklySalesRecord[],
  stores: StoreMasterRecord[]
): MergedSalesRecord[] {
  const storeMap = new Map<string, StoreMasterRecord>();
  stores.forEach((s) => {
    storeMap.set(s.storeId.toLowerCase(), s);
  });

  return sales.map((sale, idx) => {
    const store = storeMap.get(sale.storeId.toLowerCase());
    const storeName = store ? store.storeName : `Store ${sale.storeId}`;
    const region = store ? store.region : 'Other';
    const city = store ? store.city : 'Unassigned';
    const storeFormat = store ? store.storeFormat : 'Standard';
    const storeManager = store?.storeManager;

    // Requirement:
    // Net Sales = Total (Gross Sales - Discount Amount - Returns Amount)
    const netSales = sale.grossSales - sale.discountAmount - sale.returnAmount;

    // Target Achievement % = (Total Net Sales / Total Sales Target) * 100
    const targetAchievementPct = sale.salesTarget > 0 ? (netSales / sale.salesTarget) * 100 : 0;

    // Return Rate % = (Total Return Amount / Total Net Sales) * 100
    const returnRatePct = netSales > 0 ? (sale.returnAmount / netSales) * 100 : 0;

    // Discount Rate % = (Total Discount Amount / Total Gross Sales) * 100
    const discountRatePct = sale.grossSales > 0 ? (sale.discountAmount / sale.grossSales) * 100 : 0;

    // ATV = Total Net Sales / Total Transactions
    const atv = sale.transactions > 0 ? netSales / sale.transactions : 0;

    return {
      id: `${sale.weekStartDate}_${sale.storeId}_${sale.category}_${idx}`,
      weekStartDate: sale.weekStartDate,
      storeId: sale.storeId,
      storeName,
      region,
      city,
      storeFormat,
      storeManager,
      category: sale.category,
      grossSales: sale.grossSales,
      discountAmount: sale.discountAmount,
      returnAmount: sale.returnAmount,
      netSales,
      transactions: sale.transactions,
      salesTarget: sale.salesTarget,
      targetAchievementPct,
      returnRatePct,
      discountRatePct,
      atv,
      stockoutIncidents: sale.stockoutIncidents,
    };
  });
}

// Download sample Excel files dynamically created by SheetJS
export function downloadSampleExcel(type: 'sales' | 'stores') {
  if (type === 'stores') {
    const ws = XLSX.utils.json_to_sheet(DEMO_STORES);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Store_Master');
    XLSX.writeFile(wb, 'store_master.xlsx');
  } else {
    const salesData = generateDemoSalesData();
    const ws = XLSX.utils.json_to_sheet(salesData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Retail_Weekly_Sales');
    XLSX.writeFile(wb, 'retail_weekly_sales.xlsx');
  }
}

// Export dataset to CSV
export function exportToCsv(data: MergedSalesRecord[], filename = 'retail_intelligence_filtered_sales.csv') {
  if (!data || data.length === 0) return;

  const exportRows = data.map((r) => ({
    'Week Start Date': r.weekStartDate,
    'Store ID': r.storeId,
    'Store Name': r.storeName,
    'Region': r.region,
    'City': r.city,
    'Store Format': r.storeFormat,
    'Category': r.category,
    'Gross Sales ($)': Math.round(r.grossSales),
    'Discount Amount ($)': Math.round(r.discountAmount),
    'Return Amount ($)': Math.round(r.returnAmount),
    'Net Sales ($)': Math.round(r.netSales),
    'Sales Target ($)': Math.round(r.salesTarget),
    'Target Achievement (%)': r.targetAchievementPct.toFixed(1),
    'Transactions': r.transactions,
    'ATV ($)': r.atv.toFixed(2),
    'Return Rate (%)': r.returnRatePct.toFixed(1),
    'Discount Rate (%)': r.discountRatePct.toFixed(1),
    'Stockout Incidents': r.stockoutIncidents,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Executive Insights Text Report
export function downloadExecutiveReport(reportText: string, filename = 'executive_business_insights_report.txt') {
  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
