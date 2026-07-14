// Number display helpers.
//
// The store always holds RAW numeric strings (no separators) so Number()
// parsing in scoring.js keeps working. Separators exist for display only.

// Strip everything that isn't part of a number — crucially, the thousands
// separators. Every value that goes back into the store passes through this.
export function sanitizeNumber(v) {
  return String(v ?? '').replace(/[^0-9.eE+-]/g, '')
}

// Group the integer part in threes: 1234567.89 -> "1,234,567.89".
// Scientific notation (1e9) is left alone; grouping it would be meaningless.
// A trailing "." is preserved so typing "1234." doesn't fight the user.
export function formatNumber(v) {
  const raw = sanitizeNumber(v)
  if (raw === '') return ''
  if (/[eE]/.test(raw)) return raw

  const neg = raw.startsWith('-')
  const body = neg ? raw.slice(1) : raw
  const dot = body.indexOf('.')
  const intPart = dot === -1 ? body : body.slice(0, dot)
  const decPart = dot === -1 ? '' : body.slice(dot)
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return (neg ? '-' : '') + grouped + decPart
}
