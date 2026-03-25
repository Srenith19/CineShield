import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const titles = {
  '/': 'Dashboard',
  '/films': 'Film Registry',
  '/fingerprinting': 'Content Fingerprinting',
  '/piracy': 'Piracy Detection',
  '/distribution': 'Distribution Management',
  '/analytics': 'Revenue Analytics',
  '/blockchain': 'Blockchain Ledger',
}

export default function Header() {
  const location = useLocation()
  const title = titles[location.pathname] || 'CineShield'

  return (
    <header className="h-16 bg-cinema-900 border-b border-cinema-700 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search films, reports..."
            className="pl-9 pr-4 py-2 bg-cinema-800 border border-cinema-700 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-gold-400/50 w-64"
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
