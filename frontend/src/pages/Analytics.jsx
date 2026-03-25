import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import api from '../utils/api'
import { formatCurrency, formatNumber } from '../utils/formatters'

const COLORS = ['#f5c518', '#ff6b35', '#06b6d4', '#8b5cf6', '#10b981', '#f43f5e']

export default function Analytics() {
  const [revenue, setRevenue] = useState(null)
  const [audience, setAudience] = useState([])
  const [piracyTrends, setPiracyTrends] = useState([])

  useEffect(() => {
    api.get('/analytics/revenue').then(r => setRevenue(r.data))
    api.get('/analytics/audience').then(r => setAudience(r.data))
    api.get('/analytics/piracy-trends').then(r => setPiracyTrends(r.data))
  }, [])

  if (!revenue) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">Comprehensive analytics on revenue, audience reach, and distribution efficiency</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Distribution Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenue.by_channel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252554" />
              <XAxis dataKey="channel" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip contentStyle={{ backgroundColor: '#111128', border: '1px solid #32326e', borderRadius: 8 }} labelStyle={{ color: '#f5c518' }} formatter={v => formatCurrency(v)} />
              <Bar dataKey="total_revenue" fill="#f5c518" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audience by Region */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Audience Reach by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={audience} dataKey="total_audience" nameKey="region" cx="50%" cy="50%" outerRadius={100} label={({ region, percent }) => `${region}: ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#555' }}>
                {audience.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111128', border: '1px solid #32326e', borderRadius: 8 }} formatter={v => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Region */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenue.by_region} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#252554" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <YAxis type="category" dataKey="region" tick={{ fill: '#9ca3af', fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#111128', border: '1px solid #32326e', borderRadius: 8 }} formatter={v => formatCurrency(v)} />
              <Bar dataKey="total_revenue" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Film Revenue Comparison */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Film</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenue.by_film}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252554" />
              <XAxis dataKey="title" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip contentStyle={{ backgroundColor: '#111128', border: '1px solid #32326e', borderRadius: 8 }} formatter={v => formatCurrency(v)} />
              <Bar dataKey="total_revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Piracy Trends */}
      {piracyTrends.length > 0 && (
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Piracy Detection Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={piracyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252554" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111128', border: '1px solid #32326e', borderRadius: 8 }} />
              <Area type="monotone" dataKey="exact_matches" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} name="Exact" />
              <Area type="monotone" dataKey="near_matches" stackId="1" stroke="#ff6b35" fill="#ff6b35" fillOpacity={0.3} name="Near" />
              <Area type="monotone" dataKey="partial_matches" stackId="1" stroke="#f5c518" fill="#f5c518" fillOpacity={0.3} name="Partial" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
