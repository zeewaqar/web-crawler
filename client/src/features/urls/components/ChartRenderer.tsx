// src/features/urls/components/PieChartComponent.tsx
'use client'

import { Pie, PieChart, Cell, Tooltip } from 'recharts'

interface PieChartComponentProps {
  internal: number
  external: number
}

export default function PieChartComponent({ internal, external }: PieChartComponentProps) {
  const data = [
    { name: 'Internal', value: internal },
    { name: 'External', value: external },
  ]
  const COLORS = ['#16a34a', '#0ea5e9']  // Tailwind green-600 / sky-500

  return (
    <PieChart width={200} height={200}>
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={80}
        innerRadius={40}
        paddingAngle={4}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i]} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value: number) => `${value}`}
        wrapperStyle={{ outline: 'none' }}
      />
    </PieChart>
  )
}