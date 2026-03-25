import { useState, useEffect, useCallback } from 'react'
import { Upload, Shield, AlertTriangle, CheckCircle, XCircle, UserX, Eye } from 'lucide-react'
import api from '../utils/api'
import { getStatusColor, getMatchColor, formatDate } from '../utils/formatters'

export default function PiracyDetection() {
  const [dragActive, setDragActive] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState([])

  useEffect(() => {
    api.get('/piracy/reports').then(r => setReports(r.data))
  }, [])

  const handleScan = async (file) => {
    setLoading(true)
    setScanResult(null)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await api.post('/piracy/scan', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setScanResult(res.data)
      const reps = await api.get('/piracy/reports')
      setReports(reps.data)
    } catch (err) {
      alert('Error scanning content')
    }
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/piracy/reports/${id}`, { status })
    setReports(reports.map(r => r.id === id ? { ...r, status } : r))
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files[0]) handleScan(e.dataTransfer.files[0])
  }, [])

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">Scan suspect content against registered fingerprints to detect piracy</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Panel */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Scan Suspect Content</h3>
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-red-400 bg-red-400/5' : 'border-cinema-600 hover:border-cinema-500'
            }`}
            onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = e => handleScan(e.target.files[0]); inp.click() }}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">Scanning for matches...</p>
              </div>
            ) : (
              <>
                <Shield className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-300">Drop suspect content to scan</p>
                <p className="text-xs text-gray-500 mt-1">AI-powered fingerprint matching</p>
              </>
            )}
          </div>
        </div>

        {/* Scan Results */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Scan Results</h3>
          {scanResult ? (
            <div className="space-y-4">
              {scanResult.total_matches > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">{scanResult.total_matches} match(es) found!</span>
                  </div>
                  {scanResult.matches.map((match, i) => (
                    <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">{match.title}</p>
                          <p className="text-xs text-gray-400 mt-1">Film ID: {match.film_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-400">{(match.avg_score * 100).toFixed(1)}%</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMatchColor(match.match_type)}`}>{match.match_type}</span>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Object.entries(match.scores).map(([type, score]) => (
                          <div key={type} className="flex justify-between text-xs p-2 bg-cinema-800 rounded">
                            <span className="text-gray-400">{type}</span>
                            <span className="text-white font-mono">{(score * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">No matches found - content appears original</span>
                </div>
              )}
              {/* Watermark / Leak Source Identification */}
              {scanResult.watermark && (
                <div className={`p-4 rounded-lg border ${scanResult.watermark.leaker ? 'bg-orange-500/10 border-orange-500/20' : 'bg-cinema-800 border-cinema-700'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-orange-400" />
                    <p className="text-sm font-semibold text-white">Watermark Analysis</p>
                  </div>
                  {scanResult.watermark.extracted ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400">Extracted watermark: <span className="font-mono text-orange-400">{scanResult.watermark.extracted}</span></p>
                      {scanResult.watermark.leaker ? (
                        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                          <UserX className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400 font-semibold">Leak Source Identified: {scanResult.watermark.leaker}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-yellow-400">Watermark found but does not match any known distributor</p>
                      )}
                      {scanResult.watermark.leak_source && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="text-xs p-2 bg-cinema-800 rounded"><span className="text-gray-500">Channel:</span> <span className="text-white">{scanResult.watermark.leak_source.channel}</span></div>
                          <div className="text-xs p-2 bg-cinema-800 rounded"><span className="text-gray-500">Region:</span> <span className="text-white">{scanResult.watermark.leak_source.region}</span></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No watermark detected in this content</p>
                  )}
                </div>
              )}

              <div className="p-3 bg-cinema-800 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Suspect Content Hashes</p>
                {Object.entries(scanResult.suspect_hashes).map(([type, hash]) => (
                  <p key={type} className="text-xs font-mono text-gray-400"><span className="text-gray-500">{type}:</span> {hash}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-600">
              <Shield className="w-12 h-12 mb-3" />
              <p className="text-sm">Upload content to scan for piracy</p>
            </div>
          )}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Piracy Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-cinema-700">
                <th className="text-left py-2 px-3">Film</th>
                <th className="text-left py-2 px-3">File</th>
                <th className="text-left py-2 px-3">Match</th>
                <th className="text-left py-2 px-3">Score</th>
                <th className="text-left py-2 px-3">Leaked By</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Detected</th>
                <th className="text-left py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-cinema-800 hover:bg-cinema-800/50">
                  <td className="py-2 px-3 text-white">{r.film_title || 'Unknown'}</td>
                  <td className="py-2 px-3 text-gray-400 text-xs">{r.suspect_filename}</td>
                  <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs ${getMatchColor(r.match_type)}`}>{r.match_type}</span></td>
                  <td className="py-2 px-3 font-mono text-gold-400">{r.match_score ? (r.match_score * 100).toFixed(0) + '%' : '-'}</td>
                  <td className="py-2 px-3">{r.leaked_by ? <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">{r.leaked_by}</span> : <span className="text-xs text-gray-600">Unknown</span>}</td>
                  <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusColor(r.status)}`}>{r.status}</span></td>
                  <td className="py-2 px-3 text-gray-400 text-xs">{formatDate(r.detected_at)}</td>
                  <td className="py-2 px-3">
                    <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                      className="text-xs bg-cinema-800 border border-cinema-700 rounded px-2 py-1 text-gray-300">
                      <option value="new">New</option>
                      <option value="investigating">Investigating</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
