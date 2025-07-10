'use client'

import { Pie, PieChart, Cell, Tooltip } from 'recharts'

export function LinkTypeChart({ internal, external }: { internal: number; external: number }) {
  const data = [
    { name: 'Internal', value: internal },
    { name: 'External', value: external },
  ]
  const COLORS = ['#16a34a', '#0ea5e9']  // Tailwind green-600 / sky-500

  return (
    <PieChart width={220} height={220}>
      <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
        {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
      </Pie>
      <Tooltip />
    </PieChart>
  )
}
