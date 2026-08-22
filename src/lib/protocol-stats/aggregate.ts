import { ChainStats } from "./queries"

export type ProtocolStats = {
  tvl: number
  /** Dollar total of outstanding active debt across every chain. */
  totalBorrowed: number
  tvlChangePct30d: number | null
  avgAprWeighted: number
  totalLenderFees: number
  lenderFeesChange30dAbs: number | null
  activeMarkets: number
  newMarkets7d: number
}

export function aggregateChainStats(chains: ChainStats[]): ProtocolStats {
  let tvl = 0
  let totalLenderFees = 0
  let activeMarkets = 0
  let newMarkets7d = 0
  let aprWeightedSum = 0
  // Outstanding debt is both a figure in its own right and the weight the
  // average APR divides by. It is summed once and named for what it is.
  let totalBorrowed = 0
  let tvlNowScope = 0
  let tvlMonthAgoScope = 0
  let feesNowScope = 0
  let feesMonthAgoScope = 0
  let anyTvlMonth = false
  let anyFeesMonth = false

  chains.forEach((c) => {
    tvl += c.tvlNow
    totalLenderFees += c.totalLenderFeesNow
    activeMarkets += c.activeMarkets
    newMarkets7d += c.newMarketsLast7d
    aprWeightedSum += c.aprWeightedSumByDebt
    totalBorrowed += c.totalActiveDebtUSD

    tvlNowScope += c.tvlNow
    if (c.tvlMonthAgo !== null) {
      anyTvlMonth = true
      tvlMonthAgoScope += c.tvlMonthAgo
    } else {
      tvlMonthAgoScope += c.tvlNow
    }

    feesNowScope += c.totalLenderFeesNow
    if (c.totalLenderFeesMonthAgo !== null) {
      anyFeesMonth = true
      feesMonthAgoScope += c.totalLenderFeesMonthAgo
    } else {
      feesMonthAgoScope += c.totalLenderFeesNow
    }
  })

  return {
    tvl,
    tvlChangePct30d:
      anyTvlMonth && tvlMonthAgoScope > 0
        ? (tvlNowScope / tvlMonthAgoScope - 1) * 100
        : null,
    totalBorrowed,
    avgAprWeighted: totalBorrowed > 0 ? aprWeightedSum / totalBorrowed : 0,
    totalLenderFees,
    lenderFeesChange30dAbs: anyFeesMonth
      ? feesNowScope - feesMonthAgoScope
      : null,
    activeMarkets,
    newMarkets7d,
  }
}
