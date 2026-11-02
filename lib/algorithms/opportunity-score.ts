export const CTR_BY_POSITION: Record<number, number> = {
  1: 0.30, 2: 0.15, 3: 0.10, 4: 0.07, 5: 0.05,
  6: 0.04, 7: 0.03, 8: 0.025, 9: 0.02, 10: 0.018,
  11: 0.015, 12: 0.013, 13: 0.011, 14: 0.010, 15: 0.009,
  16: 0.008, 17: 0.007, 18: 0.006, 19: 0.006, 20: 0.005,
}

// Keep this formula in sync with the striking-distance view (migration 018):
//   SUM(impressions) * (21 - weighted avg position) / 16
export function calculateOpportunityScore(impressions: number, position: number): number {
  const positionFactor = (21 - position) / 16
  return impressions * positionFactor
}

const ctrAt = (position: number) =>
  CTR_BY_POSITION[Math.min(20, Math.max(1, Math.round(position)))] ?? 0.005

/**
 * Extra clicks per ~28 days (the impressions window) if the keyword moved from
 * currentPosition to targetPosition. Never negative.
 */
export function estimateTrafficGain(
  impressions: number,
  currentPosition: number,
  targetPosition: number = 3
): number {
  return Math.max(0, Math.round(impressions * (ctrAt(targetPosition) - ctrAt(currentPosition))))
}
