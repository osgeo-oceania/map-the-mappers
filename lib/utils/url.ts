/** Prefix scheme-less external links with https://; preserve http(s), mailto and tel. */
export function externalHref(url: string | undefined | null): string {
  const s = (url || '').trim()
  if (!s) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(s)) return s
  return `https://${s}`
}
