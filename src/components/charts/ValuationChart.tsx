'use client'

import { useMemo } from 'react'

interface DataPoint {
  date: string
  price?: number
  fairValue?: number
}

interface ValuationChartProps {
  data: DataPoint[]
  title: string
  fairValueLabel: string
  priceLabel?: string
  showBands?: boolean
}

export function ValuationChart({ 
  data, 
  title, 
  fairValueLabel,
  priceLabel = 'Price (USD)',
  showBands = true 
}: ValuationChartProps) {
  
  // Calculate chart dimensions and scaling
  const chartData = useMemo(() => {
    const validData = data.filter(d => d.price && d.price > 0 && d.fairValue && d.fairValue > 0)
    if (validData.length < 2) return null
    
    // Get min/max for scaling
    const allValues = validData.flatMap(d => [d.price!, d.fairValue!])
    const minVal = Math.min(...allValues) * 0.7
    const maxVal = Math.max(...allValues) * 1.4
    
    const width = 320
    const height = 200
    const padding = { top: 20, right: 50, bottom: 30, left: 10 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    
    // Scale functions
    const xScale = (i: number) => padding.left + (i / (validData.length - 1)) * chartWidth
    const yScale = (v: number) => padding.top + (1 - (v - minVal) / (maxVal - minVal)) * chartHeight
    
    // Generate paths
    const pricePath = validData.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.price!)}`
    ).join(' ')
    
    const fairValuePath = validData.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue!)}`
    ).join(' ')
    
    // Band paths (±30%, ±10% from fair value)
    const bands = showBands ? {
      plus30: validData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue! * 1.3)}`
      ).join(' '),
      plus10: validData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue! * 1.1)}`
      ).join(' '),
      minus10: validData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue! * 0.9)}`
      ).join(' '),
      minus30: validData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue! * 0.7)}`
      ).join(' '),
    } : null
    
    // Area paths for colored bands
    const bandAreas = showBands && validData.length > 0 ? {
      overvalued: `${validData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue! * 1.3)}`
      ).join(' ')} ${validData.slice().reverse().map((d, i) => 
        `L ${xScale(validData.length - 1 - i)} ${yScale(d.fairValue! * 1.1)}`
      ).join(' ')} Z`,
      
      slightlyOver: `${validData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue! * 1.1)}`
      ).join(' ')} ${validData.slice().reverse().map((d, i) => 
        `L ${xScale(validData.length - 1 - i)} ${yScale(d.fairValue!)}`
      ).join(' ')} Z`,
      
      slightlyUnder: `${validData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue!)}`
      ).join(' ')} ${validData.slice().reverse().map((d, i) => 
        `L ${xScale(validData.length - 1 - i)} ${yScale(d.fairValue! * 0.9)}`
      ).join(' ')} Z`,
      
      undervalued: `${validData.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.fairValue! * 0.9)}`
      ).join(' ')} ${validData.slice().reverse().map((d, i) => 
        `L ${xScale(validData.length - 1 - i)} ${yScale(d.fairValue! * 0.7)}`
      ).join(' ')} Z`,
    } : null
    
    // Y-axis labels
    const yLabels = [maxVal, (maxVal + minVal) / 2, minVal].map(v => ({
      value: v,
      y: yScale(v),
      label: v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v.toFixed(0)}`
    }))
    
    // X-axis labels (first and last year)
    const xLabels = [
      { x: xScale(0), label: validData[0].date.slice(0, 4) },
      { x: xScale(validData.length - 1), label: validData[validData.length - 1].date.slice(0, 4) }
    ]
    
    // Latest values
    const latest = validData[validData.length - 1]
    const latestPrice = latest.price!
    const latestFairValue = latest.fairValue!
    const margin = ((latestFairValue - latestPrice) / latestPrice) * 100
    
    return {
      validData,
      width,
      height,
      padding,
      pricePath,
      fairValuePath,
      bands,
      bandAreas,
      yLabels,
      xLabels,
      latestPrice,
      latestFairValue,
      margin,
      yScale,
      xScale
    }
  }, [data, showBands])
  
  if (!chartData) {
    return (
      <div className="bg-[#1a2332] rounded-xl p-4 text-center text-[#8b9eb3]">
        Insufficient historical data for chart
      </div>
    )
  }

  return (
    <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d]">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      
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
        
        {/* Colored bands */}
        {chartData.bandAreas && (
          <>
            <path d={chartData.bandAreas.overvalued} fill="rgba(239, 68, 68, 0.2)" />
            <path d={chartData.bandAreas.slightlyOver} fill="rgba(239, 68, 68, 0.1)" />
            <path d={chartData.bandAreas.slightlyUnder} fill="rgba(34, 197, 94, 0.1)" />
            <path d={chartData.bandAreas.undervalued} fill="rgba(34, 197, 94, 0.2)" />
          </>
        )}
        
        {/* Band lines */}
        {chartData.bands && (
          <>
            <path d={chartData.bands.plus30} fill="none" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
            <path d={chartData.bands.plus10} fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
            <path d={chartData.bands.minus10} fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
            <path d={chartData.bands.minus30} fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
          </>
        )}
        
        {/* Fair Value line (dashed black) */}
        <path 
          d={chartData.fairValuePath} 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2" 
          strokeDasharray="6,3"
        />
        
        {/* Price line (blue) */}
        <path 
          d={chartData.pricePath} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2"
        />
        
        {/* Y-axis labels */}
        {chartData.yLabels.map((label, i) => (
          <text 
            key={i}
            x={chartData.width - chartData.padding.right + 5}
            y={label.y + 4}
            fill="#5a6b7d"
            fontSize="10"
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
            fontSize="10"
            textAnchor={i === 0 ? 'start' : 'end'}
          >
            {label.label}
          </text>
        ))}
        
        {/* Band labels */}
        {showBands && (
          <>
            <text x={chartData.width - 45} y={chartData.yScale(chartData.latestFairValue * 1.3)} fill="#ef4444" fontSize="8">+30%</text>
            <text x={chartData.width - 45} y={chartData.yScale(chartData.latestFairValue * 1.1)} fill="#f59e0b" fontSize="8">+10%</text>
            <text x={chartData.width - 45} y={chartData.yScale(chartData.latestFairValue * 0.9)} fill="#22c55e" fontSize="8">-10%</text>
            <text x={chartData.width - 45} y={chartData.yScale(chartData.latestFairValue * 0.7)} fill="#22c55e" fontSize="8">-30%</text>
          </>
        )}
      </svg>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-[#8b9eb3]">{priceLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-white border-dashed"></div>
          <span className="text-[#8b9eb3]">{fairValueLabel}</span>
        </div>
      </div>
      
      {/* Current status */}
      <div className="mt-3 pt-3 border-t border-[#2a3a4d]/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8b9eb3]">Current Status:</span>
          <span className={`font-medium ${
            chartData.margin > 10 ? 'text-[#2ecc71]' :
            chartData.margin > -10 ? 'text-yellow-500' :
            'text-[#e74c3c]'
          }`}>
            {chartData.margin > 10 ? 'Undervalued' :
             chartData.margin > -10 ? 'Fairly Valued' :
             'Overvalued'} ({chartData.margin > 0 ? '+' : ''}{chartData.margin.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  )
}
