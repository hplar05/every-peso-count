'use client'

import React, { useMemo } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

export const BudgetCharts = React.memo(function BudgetCharts({ projects }: { projects: any[] }) {
  // Format data for Recharts
  const chartData = useMemo(() => projects.map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    Allocated: Number(p.budget_allocated) || 0,
    Spent: Number(p.budget_utilized) || 0,
    Remaining: (Number(p.budget_allocated) || 0) - (Number(p.budget_utilized) || 0)
  })), [projects])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`
    return `₱${value}`
  }

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm mb-8">
      <h3 className="text-lg font-medium text-[#1E3A5F] mb-6">Budget Distribution per Project</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
            <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
            <Tooltip 
              formatter={(value) => typeof value === 'number' ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value) : value}
              contentStyle={{ borderRadius: '2px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="Allocated" fill="#1E3A5F" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Spent" fill="#2563EB" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
})
