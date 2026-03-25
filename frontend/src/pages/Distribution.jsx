import { useState, useEffect } from 'react'
import { Plus, X, Truck, Link2 } from 'lucide-react'
import api from '../utils/api'
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters'

export default function Distribution() {
  const [distributions, setDistributions] = useState([])
  const [films, setFilms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    film_id: '', channel: 'Streaming', region: 'North America',
    distributor: '', revenue: 0, audience_count: 0, start_date: '', end_date: ''
  })

  useEffect(() => {
    api.get('/distribution').then(r => setDistributions(r.data))
    api.get('/films').then(r => setFilms(r.data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await api.post('/distribution', { ...form, film_id: parseInt(form.film_id), revenue: parseFloat(form.revenue), audience_count: parseInt(form.audience_count) })
    setDistributions([res.data.distribution, ...distributions])
    setShowForm(false)
    setForm({ film_id: '', channel: 'Streaming', region: 'North America', distributor: '', revenue: 0, audience_count: 0, start_date: '', end_date: '' })
  }

  const channels = ['Theatrical', 'Streaming', 'DVD/Blu-ray', 'Broadcast', 'Digital Download']
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Track distribution events with blockchain-verified ledger entries</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-cinema-950 rounded-lg text-sm font-semibold hover:bg-gold-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Distribution
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">New Distribution Event</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Film</label>
                <select value={form.film_id} onChange={e => setForm({...form, film_id: e.target.value})} required
                  className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none">
                  <option value="">Select film...</option>
                  {films.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Channel</label>
                  <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none">
                    {channels.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Region</label>
                  <select value={form.region} onChange={e => setForm({...form, region: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none">
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400">Distributor</label>
                <input value={form.distributor} onChange={e => setForm({...form, distributor: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Revenue ($)</label>
                  <input type="number" value={form.revenue} onChange={e => setForm({...form, revenue: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Audience Count</label>
                  <input type="number" value={form.audience_count} onChange={e => setForm({...form, audience_count: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <p className="text-xs text-cyan-400">This event will be automatically recorded on the blockchain</p>
              </div>
              <button type="submit" className="w-full py-2 bg-gold-400 text-cinema-950 rounded-lg text-sm font-semibold hover:bg-gold-500">Add Distribution</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-cinema-700">
                <th className="text-left py-2 px-3">Film</th>
                <th className="text-left py-2 px-3">Channel</th>
                <th className="text-left py-2 px-3">Region</th>
                <th className="text-left py-2 px-3">Distributor</th>
                <th className="text-left py-2 px-3">Watermark</th>
                <th className="text-right py-2 px-3">Revenue</th>
                <th className="text-right py-2 px-3">Audience</th>
                <th className="text-left py-2 px-3">Block</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map(d => (
                <tr key={d.id} className="border-b border-cinema-800 hover:bg-cinema-800/50">
                  <td className="py-2 px-3 text-white">{d.film_title}</td>
                  <td className="py-2 px-3"><span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">{d.channel}</span></td>
                  <td className="py-2 px-3 text-gray-400">{d.region}</td>
                  <td className="py-2 px-3 text-gray-400">{d.distributor}</td>
                  <td className="py-2 px-3"><span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">{d.watermark_code || '-'}</span></td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-mono">{formatCurrency(d.revenue)}</td>
                  <td className="py-2 px-3 text-right text-gray-300">{formatNumber(d.audience_count)}</td>
                  <td className="py-2 px-3">{d.block_hash ? <span className="text-xs font-mono text-cyan-400">{d.block_hash.substring(0, 8)}...</span> : <span className="text-xs text-gray-600">-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
