import { aggregateChainStats } from "./aggregate"
import { ChainStats } from "./queries"

// What these hold is the APR weighting, which is the only place the aggregate
// computes rather than copies. An earlier version of this file asserted a
// `totalBorrowed` field; that field was withdrawn once `totalActiveDebtUSD`
// turned out to be an alias of TVL rather than a second quantity. See
// docs/fiat/finding-total-borrowed.md.
const chain = (over: Partial<ChainStats> = {}): ChainStats => ({
  tvlNow: 0,
  tvlMonthAgo: null,
  totalLenderFeesNow: 0,
  totalLenderFeesMonthAgo: null,
  activeMarkets: 0,
  newMarketsLast7d: 0,
  aprWeightedSumByDebt: 0,
  totalActiveDebtUSD: 0,
  ...over,
})

describe("aggregateChainStats", () => {
  it("weights the average APR by each chain's share", () => {
    const stats = aggregateChainStats([
      chain({ totalActiveDebtUSD: 400, aprWeightedSumByDebt: 400 * 5 }),
      chain({ totalActiveDebtUSD: 600, aprWeightedSumByDebt: 600 * 10 }),
    ])
    expect(stats.avgAprWeighted).toBe((400 * 5 + 600 * 10) / 1000)
  })

  it("returns zero APR rather than dividing by zero when nothing is weighted", () => {
    expect(aggregateChainStats([chain(), chain()]).avgAprWeighted).toBe(0)
    expect(aggregateChainStats([]).avgAprWeighted).toBe(0)
  })

  it("sums TVL across chains", () => {
    const stats = aggregateChainStats([
      chain({ tvlNow: 1_000_000 }),
      chain({ tvlNow: 250_000 }),
    ])
    expect(stats.tvl).toBe(1_250_000)
  })

  it("reports no 30-day change when no chain has a month-ago figure", () => {
    expect(aggregateChainStats([chain({ tvlNow: 10 })]).tvlChangePct30d).toBeNull()
  })
})
