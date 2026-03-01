'use client'

import { useMemo, useState } from 'react'

interface DataPoint {
  date: string
  price?: number
  gfValue?: number
  grahamNumber?: number
  peterLynch?: number
  dcf?: number
}

interface MultiValuationChartProps {
  data: DataPoint[]
  currentPrice: number
  title: string
}

type TimeRange = '1Y' | '3Y' | '5Y' | '10Y' | 'max'

const COLORS = {
  price: '#3b82f6', // Blue
  gfValue: '#ffffff', // White dashed
  graham: '#a855f7', // Purple
  peterLynch: '#f97316', // Orange
  dcf: '#22c55e', // Green
}

export function MultiValuationChart({ data, currentPrice, title }: MultiValuationChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('5Y')
  const [showGraham, setShowGraham] = useState(true)
  const [showLynch, setShowLynch] = useState(true)
  const [showDCF, setShowDCF] = useState(true)
  const [showGFValue, setShowGFValue] = useState(true)

  const timeRanges: TimeRange[] = ['1Y', '3Y', '5Y', '10Y', 'max']

  // Filter data by time range
  const filteredData = useMemo(() => {
    const now = new Date()
    return data.filter(d => {
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
    const validData = filteredData.filter(d => d.price && d.price > 0)
    if (validData.length < 2) return null

    // For growth stocks, use LOG SCALE to show relative movements
    const useLogScale = true

    // Get all values for scaling
    const allValues: number[] = []
    validData.forEach(d => {
      if (d.price) allValues.push(d.price)
      if (d.gfValue && showGFValue) allValues.push(d.gfValue)
      if (d.grahamNumber && showGraham) allValues.push(d.grahamNumber)
      if (d.peterLynch && showLynch) allValues.push(d.peterLynch)
      if (d.dcf && showDCF) allValues.push(d.dcf)
    })

    if (allValues.length === 0) return null

    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    
    // Add padding
    const logMin = useLogScale ? Math.log10(Math.max(minVal, 0.01)) : minVal
    const logMax = useLogScale ? Math.log10(maxVal) : maxVal
    const range = logMax - logMin
    const paddedMin = useLogScale ? Math.pow(10, logMin - range * 0.1) : minVal * 0.8
    const paddedMax = useLogScale ? Math.pow(10, logMax + range * 0.1) : maxVal * 1.2

    const width = 340
    const height = 220
    const padding = { top: 20, right: 55, bottom: 35, left: 10 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Scale functions
    const xScale = (i: number) => padding.left + (i / (validData.length - 1)) * chartWidth
    
    const yScale = (v: number) => {
      if (useLogScale) {
        const logV = Math.log10(Math.max(v, 0.01))
        const logPaddedMin = Math.log10(paddedMin)
        const logPaddedMax = Math.log10(paddedMax)
        return padding.top + (1 - (logV - logPaddedMin) / (logPaddedMax - logPaddedMin)) * chartHeight
      }
      return padding.top + (1 - (v - paddedMin) / (paddedMax - paddedMin)) * chartHeight
    }

    // Generate paths for each series
    const generatePath = (getValue: (d: DataPoint) => number | undefined) => {
      const points = validData
        .map((d, i) => {
          const v = getValue(d)
          if (!v || v <= 0) return null
          return { x: xScale(i), y: yScale(v) }
        })
        .filter(p => p !== null)
      
      if (points.length < 2) return null
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p!.x} ${p!.y}`).join(' ')
    }

    const paths = {
      price: generatePath(d => d.price),
      gfValue: showGFValue ? generatePath(d => d.gfValue) : null,
      graham: showGraham ? generatePath(d => d.grahamNumber) : null,
      peterLynch: showLynch ? generatePath(d => d.peterLynch) : null,
      dcf: showDCF ? generatePath(d => d.dcf) : null,
    }

    // Y-axis labels (log scale friendly)
    const yValues = useLogScale 
      ? [paddedMax, Math.sqrt(paddedMax * paddedMin), paddedMin]
      : [paddedMax, (paddedMax + paddedMin) / 2, paddedMin]
    
    const yLabels = yValues.map(v => ({
      value: v,
      y: yScale(v),
      label: v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v.toFixed(0)}`
    }))

    // X-axis labels
    const firstYear = validData[0].date.slice(0, 4)
    const lastYear = validData[validData.length - 1].date.slice(0, 4)
    const xLabels = [
      { x: xScale(0), label: firstYear },
      { x: xScale(validData.length - 1), label: lastYear }
    ]

    // Latest values for legend
    const latest = validData[validData.length - 1]

    return {
      validData,
      width,
      height,
      padding,
      paths,
      yLabels,
      xLabels,
      latest,
      yScale,
      xScale
    }
  }, [filteredData, showGraham, showLynch, showDCF, showGFValue])

  if (!chartData) {
    return (
      <div className="bg-[#1a2332] rounded-xl p-4 text-center text-[#8b9eb3]">
        Insufficient data for chart
      </div>
    )
  }

  const latest = chartData.latest

  return (
    <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      
      {/* Time Range Selector */}
      <div className="flex gap-1 mb-4">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              timeRange === range
                ? 'bg-[#2ecc71] text-white'
                : 'bg-[#0d1421] text-[#8b9eb3] hover:text-white'
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
      >
        {/* Background */}
        <rect 
          x={chartData.padding.left} 
          y={chartData.padding.top} 
          width={chartData.width - chartData.padding.left - chartData.padding.right}
          height={chartData.height - chartData.padding.top - chartData.padding.bottom}
          fill="#0d1421"
          rx="4"
        />
        
        {/* Grid lines */}
        {chartData.yLabels.map((label, i) => (
          <line 
            key={i}
            x1={chartData.padding.left}
            x2={chartData.width - chartData.padding.right}
            y1={label.y}
            y2={label.y}
            stroke="#2a3a4d"
            strokeWidth="0.5"
          />
        ))}

        {/* DCF line (green) */}
        {chartData.paths.dcf && (
          <path 
            d={chartData.paths.dcf} 
            fill="none" 
            stroke={COLORS.dcf} 
            strokeWidth="1.5"
            opacity="0.8"
          />
        )}

        {/* Graham line (purple) */}
        {chartData.paths.graham && (
          <path 
            d={chartData.paths.graham} 
            fill="none" 
            stroke={COLORS.graham} 
            strokeWidth="1.5"
            opacity="0.8"
          />
        )}

        {/* Peter Lynch line (orange) */}
        {chartData.paths.peterLynch && (
          <path 
            d={chartData.paths.peterLynch} 
            fill="none" 
            stroke={COLORS.peterLynch} 
            strokeWidth="1.5"
            opacity="0.8"
          />
        )}

        {/* GF Value line (white dashed) */}
        {chartData.paths.gfValue && (
          <path 
            d={chartData.paths.gfValue} 
            fill="none" 
            stroke={COLORS.gfValue} 
            strokeWidth="2" 
            strokeDasharray="6,3"
          />
        )}

        {/* Price line (blue) - on top */}
        {chartData.paths.price && (
          <path 
            d={chartData.paths.price} 
            fill="none" 
            stroke={COLORS.price} 
            strokeWidth="2"
          />
        )}

        {/* Y-axis labels */}
        {chartData.yLabels.map((label, i) => (
          <text 
            key={i}
            x={chartData.width - chartData.padding.right + 5}
            y={label.y + 4}
            fill="#5a6b7d"
            fontSize="9"
          >
            {label.label}
          </text>
        ))}

        {/* X-axis labels */}
        {chartData.xLabels.map((label, i) => (
          <text 
            key={i}
            x={label.x}
            y={chartData.height - 5}
            fill="#5a6b7d"
            fontSize="9"
            textAnchor={i === 0 ? 'start' : 'end'}
          >
            {label.label}
          </text>
        ))}
      </svg>

      {/* Legend with toggles */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <button 
          onClick={() => {}}
          className="flex items-center gap-2 px-2 py-1 rounded bg-[#0d1421]"
        >
          <div className="w-4 h-0.5" style={{ backgroundColor: COLORS.price }}></div>
          <span className="text-[#8b9eb3]">Price</span>
          <span className="text-white ml-auto">${currentPrice.toFixed(0)}</span>
        </button>
        
        <button 
          onClick={() => setShowGFValue(!showGFValue)}
          className={`flex items-center gap-2 px-2 py-1 rounded ${showGFValue ? 'bg-[#0d1421]' : 'bg-[#0d1421]/50 opacity-50'}`}
        >
          <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: COLORS.gfValue }}></div>
          <span className="text-[#8b9eb3]">GF Value</span>
          <span className="text-white ml-auto">${latest.gfValue?.toFixed(0) || '-'}</span>
        </button>
        
        <button 
          onClick={() => setShowGraham(!showGraham)}
          className={`flex items-center gap-2 px-2 py-1 rounded ${showGraham ? 'bg-[#0d1421]' : 'bg-[#0d1421]/50 opacity-50'}`}
        >
          <div className="w-4 h-0.5" style={{ backgroundColor: COLORS.graham }}></div>
          <span className="text-[#8b9eb3]">Graham</span>
          <span className="text-white ml-auto">${latest.grahamNumber?.toFixed(0) || '-'}</span>
        </button>
        
        <button 
          onClick={() => setShowLynch(!showLynch)}
          className={`flex items-center gap-2 px-2 py-1 rounded ${showLynch ? 'bg-[#0d1421]' : 'bg-[#0d1421]/50 opacity-50'}`}
        >
          <div className="w-4 h-0.5" style={{ backgroundColor: COLORS.peterLynch }}></div>
          <span className="text-[#8b9eb3]">Lynch</span>
          <span className="text-white ml-auto">${latest.peterLynch?.toFixed(0) || '-'}</span>
        </button>
        
        <button 
          onClick={() => setShowDCF(!showDCF)}
          className={`flex items-center gap-2 px-2 py-1 rounded col-span-2 ${showDCF ? 'bg-[#0d1421]' : 'bg-[#0d1421]/50 opacity-50'}`}
        >
          <div className="w-4 h-0.5" style={{ backgroundColor: COLORS.dcf }}></div>
          <span className="text-[#8b9eb3]">DCF</span>
          <span className="text-white ml-auto">${latest.dcf?.toFixed(0) || '-'}</span>
        </button>
      </div>

      <p className="text-[10px] text-[#5a6b7d] mt-2 text-center">
        Click legend items to show/hide. Log scale for better visualization.
      </p>
    </div>
  )
}
