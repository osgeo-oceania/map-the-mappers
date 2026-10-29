const COUNTRY_FLAGS: Record<string, string> = {
  Australia: '🇦🇺',
  'Cook Islands': '🇨🇰',
  Fiji: '🇫🇯',
  'French Polynesia': '🇵🇫',
  Indonesia: '🇮🇩',
  'New Zealand': '🇳🇿',
  'Papua New Guinea': '🇵🇬',
  Philippines: '🇵🇭',
  Samoa: '🇼🇸',
  'Solomon Islands': '🇸🇧',
  'Timor-Leste': '🇹🇱',
  Tonga: '🇹🇴',
  Vanuatu: '🇻🇺',
}

/** Return an empty string for an unknown country. */
export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] || ''
}

export function formatCountryWithFlag(country: string): string {
  const flag = getCountryFlag(country)
  return flag ? `${country} ${flag}` : country
}
