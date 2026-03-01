'use client'

import { useMemo, useState } from 'react'

interface DataPoint {
  date: string
  price: number
  fairValue: number
}

interface GFStyleChartProps {
  data: DataPoint[]
  title: string
  fairValueLabel: string
}

type TimeRange = '1Y' | '3Y' | '5Y' | '10Y' | 'max'

export function GFStyleChart({ data, title, fairValueLabel }: GFStyleChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('5Y')
  const timeRanges: TimeRange[] = ['1Y', '3Y', '5Y', '10Y', 'max']

  // Filter data by time range
  const filteredData = useMemo(() => {
    const now = new Date()
    return data.filter(d => {
      if (!d.price || !d.fairValue || d.price <= 0 || d.fairValue <= 0) return false
      const date = new Date(d.date)
      const yearsAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365)
      
      switch (timeRange) {
        case '1Y': return yearsAgo <= 1
        case '3Y': return yearsAgo <= 3
        case '5Y': return yearsAgo <= 5
        case '10Y': return yearsAgo <= 10
        case 'max': return true
        default: return yearsAgo <= 5
      }
    })
  }, [data, timeRange])

  const chartData = useMemo(() => {
    if (filteredData.length < 2) return null

    const width = 340
    const height = 200
    const padding = { top: 15, right: 50, bottom: 30, left: 10 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Get min/max for fair value (use for bands)
    const fairValues = filteredData.map(d => d.fairValue)
    const prices = filteredData.map(d => d.price)
    
    // Calculate band values
    const maxBand = Math.max(...fairValues) * 1.35
    const minBand = Math.min(...fairValues) * 0.65
    const maxPrice = Math.max(...prices)
    
    const maxVal = Math.max(maxBand, maxPrice * 1.1)
    const minVal = Math.min(minBand, Math.min(...prices) * 0.9)

    const xScale = (i: number) => padding.left + (i / (filteredData.length - 1)) * chartWidth
    const yScale = (v: number) => padding.top + (1 - (v - minVal) / (maxVal - minVal)) * chartHeight

    // Generate paths
    const pricePath = filteredData.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.price)}`
    ).join(' ')

    const fairValuePath = filteredData.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue)}`
    ).join(' ')

    // Band paths for fill areas
    const createBandPath = (multiplierTop: number, multiplierBottom: number) => {
      const topPath = filteredData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue * multiplierTop)}`
      ).join(' ')
      
      const bottomPath = filteredData.slice().reverse().map((d, i) => 
        `L ${xScale(filteredData.length - 1 - i)} ${yScale(d.fairValue * multiplierBottom)}`
      ).join(' ')
      
      return `${topPath} ${bottomPath} Z`
    }

    const bands = {
      significantlyOver: createBandPath(1.35, 1.30),   // Above +30%
      over: createBandPath(1.30, 1.10),                // +10% to +30%
      fair: createBandPath(1.10, 0.90),                // -10% to +10%
      under: createBandPath(0.90, 0.70),               // -10% to -30%
      significantlyUnder: createBandPath(0.70, 0.65),  // Below -30%
    }

    // Band line paths (dashed lines for +30, +10, -10, -30)
    const bandLines = {
      plus30: filteredData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue * 1.30)}`).join(' '),
      plus10: filteredData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue * 1.10)}`).join(' '),
      minus10: filteredData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue * 0.90)}`).join(' '),
      minus30: filteredData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue * 0.70)}`).join(' '),
    }

    // Y-axis labels
    const yLabels = [maxVal, (maxVal + minVal) / 2, minVal].map(v => ({
      y: yScale(v),
      label: v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`
    }))

    // X-axis labels
    const firstYear = filteredData[0].date.slice(0, 4)
    const lastYear = filteredData[filteredData.length - 1].date.slice(0, 4)

    // Latest values
    const latest = filteredData[filteredData.length - 1]
    const margin = ((latest.fairValue - latest.price) / latest.price) * 100

    // Band labels positions (at right edge)
    const lastFV = latest.fairValue
    const bandLabelPositions = {
      plus30: { y: yScale(lastFV * 1.30), label: '+30%' },
      plus10: { y: yScale(lastFV * 1.10), label: '+10%' },
      minus10: { y: yScale(lastFV * 0.90), label: '-10%' },
      minus30: { y: yScale(lastFV * 0.70), label: '-30%' },
    }

    return {
      width,
      height,
      padding,
      pricePath,
      fairValuePath,
      bands,
      bandLines,
      bandLabelPositions,
      yLabels,
      firstYear,
      lastYear,
      latest,
      margin,
      yScale,
      xScale,
      chartWidth,
      filteredData
    }
  }, [filteredData])

  if (!chartData) {
    return (
      <div className="bg-[#1E222D] rounded-xl p-4 text-center text-[#8b9eb3]">
        Insufficient data for chart
      </div>
    )
  }

  const { margin } = chartData

  return (
    <div className="bg-[#1E222D] rounded-xl p-4 border border-[#2a3a4d] shadow-lg">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      
      {/* Time Range Selector */}
      <div className="flex gap-1 mb-4">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeRange === range
                ? 'bg-[#00C853] text-white shadow-md'
                : 'bg-[#0d1421] text-[#8b9eb3] hover:text-white hover:bg-[#243447]'
            }`}
          >
            {range === 'max' ? 'Max' : range}
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <svg 
        viewBox={`0 0 ${chartData.width} ${chartData.height}`}
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        {/* Background */}
        <rect 
          x={chartData.padding.left} 
          y={chartData.padding.top} 
          width={chartData.chartWidth}
          height={chartData.height - chartData.padding.top - chartData.padding.bottom}
          fill="#0d1421"
          rx="6"
        />

        {/* Colored Band Areas - GuruFocus style */}
        <path d={chartData.bands.significantlyOver} fill="rgba(255, 82, 82, 0.3)" />
        <path d={chartData.bands.over} fill="rgba(255, 82, 82, 0.15)" />
        <path d={chartData.bands.fair} fill="rgba(128, 128, 128, 0.1)" />
        <path d={chartData.bands.under} fill="rgba(0, 200, 83, 0.15)" />
        <path d={chartData.bands.significantlyUnder} fill="rgba(0, 200, 83, 0.3)" />

        {/* Band lines (dashed) */}
        <path d={chartData.bandLines.plus30} fill="none" stroke="#FF5252" strokeWidth="1" strokeDasharray="4,2" opacity="0.6" />
        <path d={chartData.bandLines.plus10} fill="none" stroke="#FF5252" strokeWidth="1" strokeDasharray="4,2" opacity="0.4" />
        <path d={chartData.bandLines.minus10} fill="none" stroke="#00C853" strokeWidth="1" strokeDasharray="4,2" opacity="0.4" />
        <path d={chartData.bandLines.minus30} fill="none" stroke="#00C853" strokeWidth="1" strokeDasharray="4,2" opacity="0.6" />

        {/* Fair Value line (black dashed) */}
        <path 
          d={chartData.fairValuePath} 
          fill="none" 
          stroke="#000000" 
          strokeWidth="2" 
          strokeDasharray="6,3"
        />

        {/* Price line (blue solid) */}
        <path 
          d={chartData.pricePath} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2.5"
        />

        {/* Y-axis labels */}
        {chartData.yLabels.map((label, i) => (
          <text 
            key={i}
            x={chartData.width - chartData.padding.right + 5}
            y={label.y + 4}
            fill="#5a6b7d"
            fontSize="9"
            fontFamily="Inter, sans-serif"
          >
            {label.label}
          </text>
        ))}

        {/* Band labels on right side */}
        {Object.entries(chartData.bandLabelPositions).map(([key, pos]) => (
          <text
            key={key}
            x={chartData.width - 8}
            y={pos.y + 3}
            fill={key.includes('plus') ? '#FF5252' : '#00C853'}
            fontSize="8"
            fontFamily="Inter, sans-serif"
            textAnchor="end"
          >
            {pos.label}
          </text>
        ))}

        {/* X-axis labels */}
        <text 
          x={chartData.padding.left}
          y={chartData.height - 8}
          fill="#5a6b7d"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          {chartData.firstYear}
        </text>
        <text 
          x={chartData.width - chartData.padding.right}
          y={chartData.height - 8}
          fill="#5a6b7d"
          fontSize="9"
          fontFamily="Inter, sans-serif"
          textAnchor="end"
        >
          {chartData.lastYear}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-blue-500 rounded"></div>
          <span className="text-[#8b9eb3]">Price (USD)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-black border border-white/30" style={{ borderStyle: 'dashed' }}></div>
          <span className="text-[#8b9eb3]">{fairValueLabel}</span>
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-3 pt-3 border-t border-[#2a3a4d]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#8b9eb3]">Current Status:</span>
          <span className={`text-sm font-semibold ${
            margin > 30 ? 'text-[#00C853]' :
            margin > 10 ? 'text-[#4CAF50]' :
            margin > -10 ? 'text-[#FFC107]' :
            margin > -30 ? 'text-[#FF9800]' :
            'text-[#FF5252]'
          }`}>
            {margin > 30 ? 'Significantly Undervalued' :
             margin > 10 ? 'Modestly Undervalued' :
             margin > -10 ? 'Fairly Valued' :
             margin > -30 ? 'Modestly Overvalued' :
             'Significantly Overvalued'} ({margin > 0 ? '+' : ''}{margin.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  )
}
