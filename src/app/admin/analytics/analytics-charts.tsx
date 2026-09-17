"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n)

const COLORS = ["#2563EB", "#DC2626", "#2E7D32", "#D97706"]

export function AnalyticsCharts({ stats }: { stats: any }) {
  const { budget, projects, feedback, attendance } = stats

  const budgetChartData = [
    { name: "Allocated", value: budget.totalAllocated },
    { name: "Spent", value: budget.totalSpent },
    { name: "Remaining", value: budget.totalRemaining },
  ]

  const projectChartData = [
    { name: "Planning", value: projects.planning },
    { name: "Ongoing", value: projects.ongoing },
    { name: "Completed", value: projects.completed },
    { name: "On Hold", value: projects.on_hold },
  ].filter((d) => d.value > 0)

  const feedbackResolutionRate = feedback.total > 0
    ? Math.round((feedback.resolved / feedback.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Budget Allocated", value: formatCurrency(budget.totalAllocated), color: "#2563EB" },
          { label: "Total Budget Spent", value: formatCurrency(budget.totalSpent), color: "#DC2626" },
          { label: "Total Projects", value: Object.values(projects).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number, color: "#2E7D32" },
          { label: "Feedback Resolution Rate", value: `${feedbackResolutionRate}%`, color: "#D97706" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-medium" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
          <h3 className="text-sm font-medium text-[#1E3A5F] mb-4">Budget Overview (PHP)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetChartData} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {budgetChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projects Donut */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
          <h3 className="text-sm font-medium text-[#1E3A5F] mb-4">Projects by Status</h3>
          {projectChartData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No project data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={projectChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                  {projectChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Bar */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
          <h3 className="text-sm font-medium text-[#1E3A5F] mb-4">Official Attendance Rate (%)</h3>
          {attendance.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No attendance data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendance} layout="vertical" barSize={16}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="rate" fill="#2563EB" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Feedback Summary */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
          <h3 className="text-sm font-medium text-[#1E3A5F] mb-4">Feedback Summary</h3>
          <div className="space-y-3 mt-6">
            {[
              { label: "Total Received", value: feedback.total, color: "#2563EB" },
              { label: "Resolved", value: feedback.resolved, color: "#2E7D32" },
              { label: "In Review", value: feedback.inReview, color: "#D97706" },
              { label: "Pending", value: feedback.pending, color: "#DC2626" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: feedback.total > 0 ? `${(item.value / feedback.total) * 100}%` : "0%",
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#172033] w-6 text-right">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}