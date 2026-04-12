// Inline SVG data URIs — no image files required

const logo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><text x="0" y="30" font-family="Georgia,serif" font-size="28" font-weight="bold" letter-spacing="4" fill="#000">FOREVER</text></svg>`
)}`

const add_icon = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`
)}`

const order_icon = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="0.5" fill="#555"/><circle cx="3.5" cy="12" r="0.5" fill="#555"/><circle cx="3.5" cy="18" r="0.5" fill="#555"/></svg>`
)}`

const upload_area = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="6" fill="#f9fafb" stroke="#d1d5db" stroke-width="1.5" stroke-dasharray="5,3"/><polyline points="40,22 40,50" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/><polyline points="30,32 40,22 50,32" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="25" y1="58" x2="55" y2="58" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/><text x="40" y="72" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#9ca3af">Upload</text></svg>`
)}`

const parcel_icon = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
)}`

export const assets = {
  logo,
  add_icon,
  order_icon,
  upload_area,
  parcel_icon
}
