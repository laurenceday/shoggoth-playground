"use client"

import { Box, Skeleton, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

import { fmtUSD } from "@/lib/protocol-stats/format"
import { useProtocolStats } from "@/lib/protocol-stats/useProtocolStats"
import { COLORS } from "@/theme/colors"

/**
 * Protocol totals above the All Markets table.
 *
 * Reads the same hook the site header already calls, so react-query serves
 * this from cache and the page makes no additional request.
 *
 * Total Borrowed is deliberately absent. `totalActiveDebtUSD` is an alias of
 * TVL rather than a second quantity, so rendering both showed one figure twice
 * under two names. See docs/fiat/finding-total-borrowed.md.
 *
 * Captions name the window the figure actually covers. The design asks for
 * "this week" against each metric; the data is thirty-day, so the caption says
 * month. A weekly caption over a monthly number would misstate protocol growth
 * to the people the feature exists to reassure.
 */
type MetricProps = {
  label: string
  value: string | null
  change?: string | null
}

function Metric({ label, value, change }: MetricProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <Typography variant="text4" color={COLORS.santasGrey}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        {value === null ? (
          <Skeleton variant="text" width={96} sx={{ fontSize: "24px" }} />
        ) : (
          <Typography variant="title3">{value}</Typography>
        )}
        {change && (
          <Typography variant="text4" color={COLORS.caribbeanGreen}>
            {change}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export const ProtocolSummaryRow = () => {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useProtocolStats()

  // A pending query shows a skeleton. A failed one shows an em dash, which
  // reads as "not available" rather than as a real zero.
  const figure = (n: number | undefined) => {
    if (isLoading && !stats) return null
    return n === undefined ? "—" : fmtUSD(n)
  }

  const tvlChange =
    stats?.tvlChangePct30d != null && stats.tvlChangePct30d > 0
      ? `+${stats.tvlChangePct30d.toFixed(2)}% ${t(
          "dashboard.markets.summary.thisMonth",
        )}`
      : null

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: "24px", md: "64px" },
        padding: "0 24px 20px",
        flexWrap: "wrap",
      }}
    >
      <Metric
        label={t("dashboard.markets.summary.tvl")}
        value={figure(stats?.tvl)}
        change={tvlChange}
      />
      <Metric
        label={t("dashboard.markets.summary.interestAccrued")}
        value={figure(stats?.totalLenderFees)}
      />
    </Box>
  )
}
