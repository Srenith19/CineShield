import { useState, useEffect } from 'react'
import { Link2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import api from '../utils/api'
import { formatDate } from '../utils/formatters'

export default function BlockchainLedger() {
  const [chain, setChain] = useState([])
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    api.get('/blockchain/chain').then(r => setChain(r.data))
  }, [])

  const handleValidate = async () => {
    setValidating(true)
    const res = await api.get('/blockchain/validate')
    setValidation(res.data)
    setValidating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Tamper-evident blockchain ledger recording all distribution events</p>
        <button onClick={handleValidate} disabled={validating}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50">
          {validating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Validate Chain
        </button>
      </div>

      {validation && (
        <div className={`p-4 rounded-xl border ${validation.valid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className="flex items-center gap-2">
            {validation.valid ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            <span className={`text-sm font-medium ${validation.valid ? 'text-emerald-400' : 'text-red-400'}`}>{validation.message}</span>
          </div>
        </div>
      )}

      {/* Chain Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{chain.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total Blocks</p>
        </div>
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gold-400">SHA-256</p>
          <p className="text-xs text-gray-400 mt-1">Hash Algorithm</p>
        </div>
        <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">00</p>
          <p className="text-xs text-gray-400 mt-1">Proof-of-Work Prefix</p>
        </div>
      </div>

      {/* Block Chain Visual */}
      <div className="space-y-3">
        {chain.map((block, i) => (
          <div key={block.block_index}>
            <div className="bg-cinema-900 border border-cinema-700 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Block #{block.block_index}</p>
                    <p className="text-xs text-gray-500">{block.timestamp}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-xs font-mono">Nonce: {block.nonce}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-cinema-800 rounded-lg">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Block Hash</p>
                  <p className="text-xs font-mono text-cyan-400 break-all">{block.hash}</p>
                </div>
                <div className="p-3 bg-cinema-800 rounded-lg">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Previous Hash</p>
                  <p className="text-xs font-mono text-gray-400 break-all">{block.previous_hash}</p>
                </div>
              </div>

              {typeof block.data === 'object' && (
                <div className="mt-3 p-3 bg-cinema-800 rounded-lg">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Block Data</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(block.data).map(([key, val]) => (
                      <span key={key} className="px-2 py-0.5 bg-cinema-700 rounded text-xs text-gray-300">
                        <span className="text-gray-500">{key}:</span> {String(val)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {i < chain.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowRight className="w-5 h-5 text-cinema-600 rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
