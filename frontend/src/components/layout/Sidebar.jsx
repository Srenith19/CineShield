import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Film, Fingerprint, Shield, Truck, BarChart3, Link2 } from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/films', icon: Film, label: 'Films' },
  { path: '/fingerprinting', icon: Fingerprint, label: 'Fingerprinting' },
  { path: '/piracy', icon: Shield, label: 'Piracy Detection' },
  { path: '/distribution', icon: Truck, label: 'Distribution' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/blockchain', icon: Link2, label: 'Blockchain Ledger' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-cinema-900 border-r border-cinema-700 flex flex-col">
      <div className="p-5 border-b border-cinema-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-orange-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-cinema-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">CineShield</h1>
            <p className="text-[11px] text-gray-400 tracking-wider uppercase">Anti-Piracy Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-cinema-800'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-cinema-700">
        <div className="px-3 py-2 bg-cinema-800 rounded-lg">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">System Status</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-emerald-400">All Systems Operational</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
