import { useState, useEffect } from 'react'
import { Plus, Film, X } from 'lucide-react'
import api from '../utils/api'

export default function Films() {
  const [films, setFilms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', director: '', release_year: 2024, genre: '', studio: '' })

  useEffect(() => {
    api.get('/films').then(r => setFilms(r.data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await api.post('/films', form)
    setFilms([res.data, ...films])
    setForm({ title: '', director: '', release_year: 2024, genre: '', studio: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Manage your registered films and their protection status</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-cinema-950 rounded-lg text-sm font-semibold hover:bg-gold-500 transition-colors">
          <Plus className="w-4 h-4" /> Register Film
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Register New Film</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {['title', 'director', 'genre', 'studio'].map(field => (
                <div key={field}>
                  <label className="text-xs text-gray-400 capitalize">{field}</label>
                  <input value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} required={field === 'title'}
                    className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none focus:border-gold-400/50" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400">Release Year</label>
                <input type="number" value={form.release_year} onChange={e => setForm({...form, release_year: parseInt(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-white focus:outline-none focus:border-gold-400/50" />
              </div>
              <button type="submit" className="w-full py-2 bg-gold-400 text-cinema-950 rounded-lg text-sm font-semibold hover:bg-gold-500">Register Film</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {films.map(film => (
          <div key={film.id} className="bg-cinema-900 border border-cinema-700 rounded-xl p-5 hover:border-gold-400/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${film.status === 'active' ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-400 bg-gray-500/20'}`}>
                {film.status}
              </span>
            </div>
            <h3 className="text-white font-semibold mt-3">{film.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{film.director} &middot; {film.release_year}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 bg-cinema-800 rounded text-xs text-gray-300">{film.genre}</span>
              <span className="px-2 py-0.5 bg-cinema-800 rounded text-xs text-gray-300">{film.studio}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
