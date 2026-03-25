export function formatCurrency(amount) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount.toFixed(0)}`
}

export function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function getMatchColor(type) {
  switch (type) {
    case 'exact': return 'text-red-400 bg-red-500/20'
    case 'near': return 'text-orange-400 bg-orange-500/20'
    case 'partial': return 'text-yellow-400 bg-yellow-500/20'
    default: return 'text-green-400 bg-green-500/20'
  }
}

export function getStatusColor(status) {
  switch (status) {
    case 'new': return 'text-blue-400 bg-blue-500/20'
    case 'investigating': return 'text-orange-400 bg-orange-500/20'
    case 'confirmed': return 'text-red-400 bg-red-500/20'
    case 'dismissed': return 'text-gray-400 bg-gray-500/20'
    default: return 'text-gray-400 bg-gray-500/20'
  }
}
