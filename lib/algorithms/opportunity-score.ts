export const CTR_BY_POSITION: Record<number, number> = {
  1: 0.30, 2: 0.15, 3: 0.10, 4: 0.07, 5: 0.05,
  6: 0.04, 7: 0.03, 8: 0.025, 9: 0.02, 10: 0.018,
  11: 0.015, 12: 0.013, 13: 0.011, 14: 0.010, 15: 0.009,
  16: 0.008, 17: 0.007, 18: 0.006, 19: 0.006, 20: 0.005,
}

// Keep this formula in sync with migration 011's SQL definition:
//   SUM(impressions) * (21 - AVG(position)) / 16
export function calculateOpportunityScore(impressions: number, position: number): number {
  const positionFactor = (21 - position) / 16
  return impressions * positionFactor
}

export function estimateTrafficGain(
  impressions: number,
  currentPosition: number,
  targetPosition: number = 3
): number {
  const currentCtr = CTR_BY_POSITION[Math.round(currentPosition)] || 0.01
  const targetCtr = CTR_BY_POSITION[targetPosition] || 0.10
  return Math.round(impressions * (targetCtr - currentCtr))
}
