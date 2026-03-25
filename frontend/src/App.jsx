import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Films from './pages/Films'
import Fingerprinting from './pages/Fingerprinting'
import PiracyDetection from './pages/PiracyDetection'
import Distribution from './pages/Distribution'
import Analytics from './pages/Analytics'
import BlockchainLedger from './pages/BlockchainLedger'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-cinema-950">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/films" element={<Films />} />
              <Route path="/fingerprinting" element={<Fingerprinting />} />
              <Route path="/piracy" element={<PiracyDetection />} />
              <Route path="/distribution" element={<Distribution />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/blockchain" element={<BlockchainLedger />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
