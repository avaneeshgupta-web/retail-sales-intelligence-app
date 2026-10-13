import { StoreMasterRecord, WeeklySalesRecord } from '../types/retail';

export const DEMO_STORES: StoreMasterRecord[] = [
  {
    storeId: 'STR-101',
    storeName: 'Manhattan Flagship',
    region: 'North',
    city: 'New York',
    storeFormat: 'Flagship',
    storeManager: 'Elena Rostova',
    baselineTarget: 145000,
  },
  {
    storeId: 'STR-102',
    storeName: 'Brooklyn Downtown',
    region: 'North',
    city: 'New York',
    storeFormat: 'Supermarket',
    storeManager: 'Marcus Vance',
    baselineTarget: 95000,
  },
  {
    storeId: 'STR-103',
    storeName: 'Chicago Loop Central',
    region: 'Central',
    city: 'Chicago',
    storeFormat: 'Hypermarket',
    storeManager: 'David K.',
    baselineTarget: 120000,
  },
  {
    storeId: 'STR-104',
    storeName: 'Denver Galleria',
    region: 'Central',
    city: 'Denver',
    storeFormat: 'Mall Store',
    storeManager: 'Chloe Bennett',
    baselineTarget: 82000,
  },
  {
    storeId: 'STR-105',
    storeName: 'Beverly Hills Premier',
    region: 'West',
    city: 'Los Angeles',
    storeFormat: 'Flagship',
    storeManager: 'Julian Hayes',
    baselineTarget: 155000,
  },
  {
    storeId: 'STR-106',
    storeName: 'Seattle Tech Core',
    region: 'West',
    city: 'Seattle',
    storeFormat: 'Express',
    storeManager: 'Aria Chen',
    baselineTarget: 78000,
  },
  {
    storeId: 'STR-107',
    storeName: 'Houston Galleria Mega',
    region: 'South',
    city: 'Houston',
    storeFormat: 'Hypermarket',
    storeManager: 'Carlos Rivera',
    baselineTarget: 130000,
  },
  {
    storeId: 'STR-108',
    storeName: 'Miami Biscayne Bay',
    region: 'South',
    city: 'Miami',
    storeFormat: 'Mall Store',
    storeManager: 'Sophia Martinez',
    baselineTarget: 89000,
  },
  {
    storeId: 'STR-109',
    storeName: 'Atlanta Midtown Hub',
    region: 'South',
    city: 'Atlanta',
    storeFormat: 'Supermarket',
    storeManager: 'Travis Washington',
    baselineTarget: 91000,
  },
  {
    storeId: 'STR-110',
    storeName: 'Boston Back Bay',
    region: 'North',
    city: 'Boston',
    storeFormat: 'Express',
    storeManager: 'Claire Dupont',
    baselineTarget: 74000,
  },
  {
    storeId: 'STR-111',
    storeName: 'Philadelphia Square',
    region: 'East',
    city: 'Philadelphia',
    storeFormat: 'Supermarket',
    storeManager: 'Nathan Scott',
    baselineTarget: 88000,
  },
  {
    storeId: 'STR-112',
    storeName: 'San Francisco Wharf',
    region: 'West',
    city: 'San Francisco',
    storeFormat: 'Flagship',
    storeManager: 'Kavita Patel',
    baselineTarget: 138000,
  },
];

export const DEMO_WEEKS = [
  '2026-08-03',
  '2026-08-10',
  '2026-08-17',
  '2026-08-24',
  '2026-08-31',
  '2026-09-07',
  '2026-09-14',
  '2026-09-21',
];

export const DEMO_CATEGORIES = [
  'Apparel & Fashion',
  'Consumer Electronics',
  'Groceries & Fresh',
  'Home & Living',
  'Beauty & Wellness',
  'Sports & Outdoors',
];

// Generate structured weekly sales dataset
export function generateDemoSalesData(): WeeklySalesRecord[] {
  const records: WeeklySalesRecord[] = [];

  // Deterministic seed formula for repeatable, realistic retail numbers
  let seed = 42;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Base characteristics per category
  const categoryProfiles: Record<
    string,
    {
      avgGrossMultiplier: number;
      discountRange: [number, number];
      returnRange: [number, number];
      atvRange: [number, number];
      stockoutProbability: number;
    }
  > = {
    'Apparel & Fashion': {
      avgGrossMultiplier: 0.22,
      discountRange: [0.12, 0.22], // 12-22% discounts
      returnRange: [0.09, 0.14], // 9-14% returns (High return rate category >8%)
      atvRange: [65, 95],
      stockoutProbability: 0.35,
    },
    'Consumer Electronics': {
      avgGrossMultiplier: 0.26,
      discountRange: [0.05, 0.12], // 5-12% discounts
      returnRange: [0.075, 0.11], // 7.5-11% returns (Tech items, exceeds 8%)
      atvRange: [180, 320],
      stockoutProbability: 0.45,
    },
    'Groceries & Fresh': {
      avgGrossMultiplier: 0.24,
      discountRange: [0.04, 0.08], // low discounts
      returnRange: [0.015, 0.035], // very low returns
      atvRange: [42, 68],
      stockoutProbability: 0.65, // high stockouts (fresh perishable supply chain)
    },
    'Home & Living': {
      avgGrossMultiplier: 0.12,
      discountRange: [0.08, 0.15],
      returnRange: [0.04, 0.065],
      atvRange: [85, 140],
      stockoutProbability: 0.25,
    },
    'Beauty & Wellness': {
      avgGrossMultiplier: 0.09,
      discountRange: [0.06, 0.14],
      returnRange: [0.02, 0.045],
      atvRange: [45, 75],
      stockoutProbability: 0.2,
    },
    'Sports & Outdoors': {
      avgGrossMultiplier: 0.07,
      discountRange: [0.07, 0.16],
      returnRange: [0.05, 0.085],
      atvRange: [90, 160],
      stockoutProbability: 0.3,
    },
  };

  // Performance modifiers per store to create high performers and underperformers
  const storeModifiers: Record<string, number> = {
    'STR-101': 1.12, // Manhattan (Overachiever)
    'STR-102': 1.04, // Brooklyn
    'STR-103': 0.94, // Chicago (Underperformer < 100%)
    'STR-104': 0.88, // Denver (Underperformer < 100%)
    'STR-105': 1.18, // Beverly Hills (Top Performer)
    'STR-106': 1.06, // Seattle
    'STR-107': 0.91, // Houston Mega (Underperformer < 100%)
    'STR-108': 0.89, // Miami (Underperformer < 100%)
    'STR-109': 0.93, // Atlanta (Underperformer < 100%)
    'STR-110': 1.05, // Boston
    'STR-111': 0.97, // Philadelphia
    'STR-112': 1.14, // SF Wharf (Overachiever)
  };

  DEMO_WEEKS.forEach((week, weekIdx) => {
    // Week seasonality: weekIdx 3 & 7 have promotional spikes
    const weekSpike = weekIdx === 3 ? 1.15 : weekIdx === 7 ? 1.2 : 1.0;

    DEMO_STORES.forEach((store) => {
      const storeMod = storeModifiers[store.storeId] || 1.0;
      const baseWeeklyStoreTarget = store.baselineTarget || 100000;

      DEMO_CATEGORIES.forEach((category) => {
        const profile = categoryProfiles[category];
        const categoryTarget = Math.round(
          baseWeeklyStoreTarget * profile.avgGrossMultiplier * weekSpike
        );

        // Actual gross sales with realistic variance around target
        const variance = (random() - 0.45) * 0.16; // -7% to +9%
        const grossSales = Math.round(
          categoryTarget * storeMod * (1 + variance)
        );

        // Discount calculations
        const discountRate =
          profile.discountRange[0] +
          random() * (profile.discountRange[1] - profile.discountRange[0]);
        const discountAmount = Math.round(grossSales * discountRate);

        // Preliminary net before returns
        const preReturn = grossSales - discountAmount;

        // Return calculations
        const returnRate =
          profile.returnRange[0] +
          random() * (profile.returnRange[1] - profile.returnRange[0]);
        const returnAmount = Math.round(preReturn * returnRate);

        // Net Sales = Gross - Discount - Return
        const netSales = grossSales - discountAmount - returnAmount;

        // Transactions derived from target ATV
        const targetAtv =
          profile.atvRange[0] +
          random() * (profile.atvRange[1] - profile.atvRange[0]);
        const transactions = Math.max(
          15,
          Math.round(netSales / Math.max(10, targetAtv))
        );

        // Stockouts: Poisson-like distribution based on category profile
        let stockoutIncidents = 0;
        if (random() < profile.stockoutProbability) {
          stockoutIncidents = Math.floor(random() * 4) + 1;
          // Store 103, 107 have supply chain bottlenecks
          if (store.storeId === 'STR-107' || store.storeId === 'STR-103') {
            stockoutIncidents += Math.floor(random() * 3) + 1;
          }
        }

        records.push({
          weekStartDate: week,
          storeId: store.storeId,
          category,
          grossSales,
          discountAmount,
          returnAmount,
          transactions,
          salesTarget: categoryTarget,
          stockoutIncidents,
        });
      });
    });
  });

  return records;
}
