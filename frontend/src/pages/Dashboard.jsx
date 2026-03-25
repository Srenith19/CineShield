import { useState, useEffect } from 'react'
import { Film, Shield, DollarSign, Truck, AlertTriangle, CheckCircle, Link2 } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../utils/api'
import { formatCurrency, formatNumber, getStatusColor, getMatchColor, formatDate } from '../utils/formatters'

const COLORS = ['#f5c518', '#ff6b35', '#06b6d4', '#8b5cf6', '#10b981', '#f43f5e']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [reports, setReports] = useState([])
  const [threats, setThreats] = useState(null)

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setStats(r.data))
    api.get('/analytics/revenue').then(r => setRevenueData(r.data))
    api.get('/piracy/reports').then(r => setReports(r.data))
    api.get('/analytics/threats').then(r => setThreats(r.data))
  }, [])

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div></div>

  const statCards = [
    { label: 'Registered Films', value: stats.total_films, icon: Film, color: 'from-blue-500 to-blue-700' },
    { label: 'Active Threats', value: stats.active_threats, icon: AlertTriangle, color: 'from-red-500 to-red-700' },
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue), icon: DollarSign, color: 'from-emerald-500 to-emerald-700' },
    { label: 'Distributions', value: stats.total_distributions, icon: Truck, color: 'from-purple-500 to-purple-700' },
    { label: 'Blockchain Blocks', value: stats.blockchain_blocks, icon: Link2, color: 'from-cyan-500 to-cyan-700' },
    { label: 'Confirmed Piracy', value: stats.confirmed_piracy, icon: Shield, color: 'from-orange-500 to-orange-700' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-cinema-900 border border-cinema-700 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Channel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData?.by_channel || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252554" />
              <XAxis dataKey="channel" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip contentStyle={{ backgroundColor: '#111128', border: '1px solid #32326e', borderRadius: 8 }} labelStyle={{ color: '#f5c518' }} formatter={v => formatCurrency(v)} />
              <Bar dataKey="total_revenue" fill="#f5c518" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Region */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Audience by Region</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={revenueData?.by_region || []} dataKey="total_audience" nameKey="region" cx="50%" cy="50%" outerRadius={90} label={({ region, percent }) => `${region}: ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#555' }}>
                {(revenueData?.by_region || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111128', border: '1px solid #32326e', borderRadius: 8 }} formatter={v => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Summary & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat by Status */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Threat Summary</h3>
          <div className="space-y-3">
            {threats?.by_status?.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(status)}`}>{status}</span>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-cinema-700 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">By Match Type</p>
            {threats?.by_type?.map(({ match_type, count }) => (
              <div key={match_type} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getMatchColor(match_type)}`}>{match_type}</span>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Piracy Alerts */}
        <div className="lg:col-span-2 bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Piracy Alerts</h3>
          <div className="space-y-3">
            {reports.slice(0, 5).map(report => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-cinema-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${report.status === 'confirmed' ? 'bg-red-500' : report.status === 'investigating' ? 'bg-orange-500 animate-pulse' : report.status === 'new' ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <div>
                    <p className="text-sm text-white">{report.film_title || 'Unknown Film'}</p>
                    <p className="text-xs text-gray-500">{report.suspect_filename}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-gold-400">{(report.match_score * 100).toFixed(0)}% match</p>
                  <p className="text-xs text-gray-500">{formatDate(report.detected_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
