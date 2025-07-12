// src/features/urls/components/LinkTypeChart.tsx
'use client'

import dynamic from 'next/dynamic'

interface LinkTypeChartProps {
  internal: number
  external: number
}

// Create a separate component for the actual chart
const ChartRenderer = dynamic(
  () => import('@/features/urls/components/ChartRenderer'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-[200px] h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
)

export function LinkTypeChart({ internal, external }: LinkTypeChartProps) {
  return (
    <div className="max-w-sm mx-auto">
      <div className="flex justify-center">
        <ChartRenderer internal={internal} external={external} />
      </div>
    </div>
  )
}