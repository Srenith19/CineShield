import { useState, useEffect, useCallback } from 'react'
import { Upload, Hash, CheckCircle } from 'lucide-react'
import api from '../utils/api'

export default function Fingerprinting() {
  const [films, setFilms] = useState([])
  const [selectedFilm, setSelectedFilm] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filmFingerprints, setFilmFingerprints] = useState([])

  useEffect(() => {
    api.get('/films').then(r => setFilms(r.data))
  }, [])

  const handleUpload = async (file) => {
    if (!selectedFilm) return alert('Please select a film first')
    setLoading(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('film_id', selectedFilm)
    try {
      const res = await api.post('/fingerprints/generate', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      const fps = await api.get(`/fingerprints/${selectedFilm}`)
      setFilmFingerprints(fps.data)
    } catch (err) {
      alert('Error generating fingerprint')
    }
    setLoading(false)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0])
  }, [selectedFilm])

  const hashColors = { phash: 'text-cyan-400', dhash: 'text-purple-400', ahash: 'text-emerald-400', whash: 'text-orange-400' }
  const hashLabels = { phash: 'Perceptual Hash (DCT)', dhash: 'Difference Hash (Gradient)', ahash: 'Average Hash (Mean)', whash: 'Wavelet Hash (DWT)' }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">Generate AI-powered perceptual fingerprints from film content for piracy detection</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Panel */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Generate Fingerprint</h3>
          <div className="mb-4">
            <label className="text-xs text-gray-400">Select Film</label>
            <select value={selectedFilm} onChange={e => setSelectedFilm(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none focus:border-gold-400/50">
              <option value="">Choose a film...</option>
              {films.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-gold-400 bg-gold-400/5' : 'border-cinema-600 hover:border-cinema-500'
            }`}
            onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = e => handleUpload(e.target.files[0]); inp.click() }}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">Generating fingerprints...</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-300">Drop an image frame or click to upload</p>
                <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, BMP</p>
              </>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Fingerprint Results</h3>
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Fingerprints generated for: {result.filename}</span>
              </div>
              {Object.entries(result.hashes).map(([type, value]) => (
                <div key={type} className="p-3 bg-cinema-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className={`w-4 h-4 ${hashColors[type]}`} />
                    <span className="text-xs text-gray-400">{hashLabels[type]}</span>
                  </div>
                  <p className={`font-mono text-sm ${hashColors[type]}`}>{value}</p>
                  {/* Visual hash grid */}
                  <div className="flex gap-0.5 mt-2 flex-wrap">
                    {value.split('').map((char, i) => {
                      const val = parseInt(char, 16)
                      const brightness = Math.round((val / 15) * 255)
                      return <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgb(${brightness}, ${brightness}, ${brightness})` }} />
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Hash className="w-12 h-12 mb-3" />
              <p className="text-sm">Upload an image to generate fingerprints</p>
            </div>
          )}
        </div>
      </div>

      {/* Stored Fingerprints */}
      {filmFingerprints.length > 0 && (
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Stored Fingerprints for Film</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-cinema-700">
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Hash Value</th>
                  <th className="text-left py-2 px-3">Frame</th>
                  <th className="text-left py-2 px-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {filmFingerprints.map(fp => (
                  <tr key={fp.id} className="border-b border-cinema-800">
                    <td className={`py-2 px-3 font-mono ${hashColors[fp.hash_type] || 'text-white'}`}>{fp.hash_type}</td>
                    <td className="py-2 px-3 font-mono text-gray-300 text-xs">{fp.hash_value}</td>
                    <td className="py-2 px-3 text-gray-400">#{fp.frame_index}</td>
                    <td className="py-2 px-3 text-gray-400">{fp.source_filename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
