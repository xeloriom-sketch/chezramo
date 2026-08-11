// Préfixe les chemins statiques avec le basePath GitHub Pages (/chezramo en prod statique, vide en dev/Vercel)
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
export const p = (path: string) => BASE + path
