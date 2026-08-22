import { aggregateChainStats } from "./aggregate"
import { ChainStats } from "./queries"

// The aggregate is the only place in this feature where a number is computed
// rather than displayed, so it is the only place a test can say something a
// reader could not check by eye.
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

describe("aggregateChainStats totalBorrowed", () => {
  it("sums outstanding debt across every chain", () => {
    const stats = aggregateChainStats([
      chain({ totalActiveDebtUSD: 1_000_000 }),
      chain({ totalActiveDebtUSD: 250_000 }),
    ])
    expect(stats.totalBorrowed).toBe(1_250_000)
  })

  it("counts a chain contributing nothing without changing the total", () => {
    const stats = aggregateChainStats([
      chain({ totalActiveDebtUSD: 1_000_000 }),
      chain({ totalActiveDebtUSD: 0 }),
    ])
    expect(stats.totalBorrowed).toBe(1_000_000)
  })

  it("is zero when no chain has debt", () => {
    expect(aggregateChainStats([chain(), chain()]).totalBorrowed).toBe(0)
  })

  it("is zero for no chains at all, rather than undefined", () => {
    expect(aggregateChainStats([]).totalBorrowed).toBe(0)
  })

  // The same sum weights the average APR. If a later edit splits them, this
  // catches the one that stops dividing by the debt it weighted.
  it("is the denominator the weighted APR divides by", () => {
    const stats = aggregateChainStats([
      chain({ totalActiveDebtUSD: 400, aprWeightedSumByDebt: 400 * 5 }),
      chain({ totalActiveDebtUSD: 600, aprWeightedSumByDebt: 600 * 10 }),
    ])
    expect(stats.totalBorrowed).toBe(1000)
    expect(stats.avgAprWeighted).toBe((400 * 5 + 600 * 10) / 1000)
  })
})
