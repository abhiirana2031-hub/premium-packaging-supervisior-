import { ComponentWeights, ToleranceLimits, WeightStatus } from '@/types';

export interface CalculationResult {
  unitDifference: number;
  totalIdealWeight: number;
  totalActualWeight: number;
  totalWeightDifference: number;
  percentageDeviation: number;
  weightStatus: WeightStatus;
  statusLabel: string;
  statusColor: 'emerald' | 'amber' | 'rose' | 'slate';
  hasComponentBreakdown: boolean;
  componentVariances: {
    component: string;
    ideal: number | null;
    actual: number | null;
    difference: number | null;
    pctDiff: number | null;
  }[];
  dominantVarianceComponent?: string;
}

/**
 * Calculates all production weights, differences, percentage deviations,
 * and tolerance status. Never silently treats incomplete measurements as zero.
 */
export function calculateProductionWeights(
  approvedIdealWeight: number,
  actualUnitWeight: number,
  productionQuantity: number,
  tolerance: ToleranceLimits = { percentage: 2.5 },
  idealComponents?: ComponentWeights,
  actualComponents?: ComponentWeights
): CalculationResult {
  const qty = Math.max(0, Number(productionQuantity) || 0);
  const ideal = Number(approvedIdealWeight) || 0;
  const actual = Number(actualUnitWeight) || 0;

  // Incomplete measurement checks
  if (ideal <= 0 || actual <= 0 || qty <= 0) {
    return {
      unitDifference: 0,
      totalIdealWeight: 0,
      totalActualWeight: 0,
      totalWeightDifference: 0,
      percentageDeviation: 0,
      weightStatus: 'incomplete',
      statusLabel: 'Incomplete Measurement',
      statusColor: 'slate',
      hasComponentBreakdown: false,
      componentVariances: [],
    };
  }

  // Difference per unit = Actual unit weight - Ideal unit weight
  const unitDifference = actual - ideal;

  // Total ideal weight = Ideal unit weight * Production quantity
  const totalIdealWeight = ideal * qty;

  // Total actual weight = Actual unit weight * Production quantity
  const totalActualWeight = actual * qty;

  // Total weight difference = Total actual weight - Total ideal weight
  const totalWeightDifference = totalActualWeight - totalIdealWeight;

  // Percentage deviation = ((Actual unit weight - Ideal unit weight) / Ideal unit weight) * 100
  const percentageDeviation = ideal > 0 ? (unitDifference / ideal) * 100 : 0;

  // Tolerance evaluation
  let weightStatus: WeightStatus = 'within_tolerance';
  let statusLabel = 'Within Approved Tolerance';
  let statusColor: 'emerald' | 'amber' | 'rose' | 'slate' = 'emerald';

  const absDev = Math.abs(percentageDeviation);
  const tolPct = tolerance.percentage || 2.5;

  if (tolerance.minWeight !== null && tolerance.minWeight !== undefined &&
      tolerance.maxWeight !== null && tolerance.maxWeight !== undefined) {
    if (actual < tolerance.minWeight || actual > tolerance.maxWeight) {
      weightStatus = 'outside_tolerance';
      statusLabel = 'Outside Tolerance Limits';
      statusColor = 'rose';
    } else if (actual < tolerance.minWeight + 0.1 || actual > tolerance.maxWeight - 0.1) {
      weightStatus = 'warning';
      statusLabel = 'Approaching Tolerance Limit';
      statusColor = 'amber';
    } else {
      weightStatus = 'within_tolerance';
      statusLabel = 'Within Approved Tolerance';
      statusColor = 'emerald';
    }
  } else {
    if (absDev <= tolPct) {
      weightStatus = 'within_tolerance';
      statusLabel = `Within Tolerance (±${tolPct}%)`;
      statusColor = 'emerald';
    } else if (absDev <= tolPct * 1.5) {
      weightStatus = 'warning';
      statusLabel = `Warning: High Deviation (±${tolPct}%)`;
      statusColor = 'amber';
    } else {
      weightStatus = 'outside_tolerance';
      statusLabel = `Outside Tolerance (>±${tolPct}%)`;
      statusColor = 'rose';
    }
  }

  // Component level breakdown
  const componentVariances: CalculationResult['componentVariances'] = [];
  let dominantVarianceComponent: string | undefined;
  let maxComponentDiff = -1;

  if (idealComponents && actualComponents) {
    const list: [string, number | null | undefined, number | null | undefined][] = [
      ['Jar Body', idealComponents.jarWeight, actualComponents.jarWeight],
      ['Cap / Closure', idealComponents.capWeight, actualComponents.capWeight],
      ['Plastic Handle', idealComponents.plasticHandleWeight, actualComponents.plasticHandleWeight],
      ['Steel Handle', idealComponents.steelHandleWeight, actualComponents.steelHandleWeight],
      [idealComponents.otherComponentName || 'Other Component', idealComponents.otherComponentWeight, actualComponents.otherComponentWeight],
    ];

    for (const [name, idVal, actVal] of list) {
      if (idVal !== null && idVal !== undefined && idVal > 0 &&
          actVal !== null && actVal !== undefined && actVal > 0) {
        const diff = actVal - idVal;
        const pct = (diff / idVal) * 100;
        componentVariances.push({
          component: name,
          ideal: idVal,
          actual: actVal,
          difference: Number(diff.toFixed(2)),
          pctDiff: Number(pct.toFixed(2)),
        });

        if (Math.abs(diff) > maxComponentDiff) {
          maxComponentDiff = Math.abs(diff);
          dominantVarianceComponent = name;
        }
      }
    }
  }

  return {
    unitDifference: Number(unitDifference.toFixed(3)),
    totalIdealWeight: Math.round(totalIdealWeight),
    totalActualWeight: Math.round(totalActualWeight),
    totalWeightDifference: Math.round(totalWeightDifference),
    percentageDeviation: Number(percentageDeviation.toFixed(2)),
    weightStatus,
    statusLabel,
    statusColor,
    hasComponentBreakdown: componentVariances.length > 0,
    componentVariances,
    dominantVarianceComponent,
  };
}

/**
 * Formats a weight in grams with sensible decimal precision,
 * and shows kg conversion if >= 1000g.
 */
export function formatWeight(
  grams: number | null | undefined,
  includeKg = true,
  decimals = 1
): string {
  if (grams === null || grams === undefined || isNaN(grams)) {
    return '—';
  }
  const formattedG = grams.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

  if (includeKg && Math.abs(grams) >= 1000) {
    const kg = grams / 1000;
    const formattedKg = kg.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
    return `${formattedG} g (${formattedKg} kg)`;
  }

  return `${formattedG} g`;
}

export function formatGramsOnly(grams: number | null | undefined, decimals = 1): string {
  if (grams === null || grams === undefined || isNaN(grams)) return '—';
  return `${grams.toLocaleString('en-IN', { maximumFractionDigits: decimals })} g`;
}

export function formatKgOnly(grams: number | null | undefined, decimals = 2): string {
  if (grams === null || grams === undefined || isNaN(grams)) return '—';
  const kg = grams / 1000;
  return `${kg.toLocaleString('en-IN', { maximumFractionDigits: decimals })} kg`;
}

export function formatVariance(grams: number, includeSign = true): string {
  if (grams === 0) return '0.0 g (Exact)';
  const sign = grams > 0 ? '+' : '';
  const prefix = includeSign ? sign : '';
  return `${prefix}${grams.toFixed(2)} g`;
}
