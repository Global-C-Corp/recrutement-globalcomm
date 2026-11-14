// Best-effort in-memory limiter (per server instance). Good enough to blunt basic abuse;
// add an edge/WAF rule or Upstash if abuse appears.
const hits = new Map<string, number[]>()

export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
  return recent.length > max
}
