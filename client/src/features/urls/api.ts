import { z } from 'zod'

/* —————————————————— link schema —————————————————— */
export const LinkSchema = z.object({
  href: z.string().url(),
  http_status: z.number().nullable(),
  is_internal: z.boolean(),
})

/* ————————— list schema (dashboard) ————————— */
export const UrlListSchema = z.object({
  id: z.number(),
  original_url: z.string().url(),
  title: z.string().nullable(),
  crawl_status: z.enum(['queued', 'running', 'done', 'error']),
  internal_links: z.number(),
  external_links: z.number(),
  broken_links: z.number(),
  html_version: z.string().nullable(),
  created_at: z.string(),
}).strip()                    // ignore any extras safely

/* ———————— detail schema (adds headings + links) ———————— */
export const UrlDetailSchema = UrlListSchema.extend({
  h1: z.number(),
  h2: z.number(),
  h3: z.number(),
  has_login: z.boolean(),
  links: LinkSchema.array()
           .nullable()        // accept null
           .transform((v) => v ?? []),   // coerce null→[]
})

export type UrlRow    = z.infer<typeof UrlListSchema>
export type UrlDetail = z.infer<typeof UrlDetailSchema>

/* ————————— runtime base URL helper ————————— */
function apiBase() {
  return (
    process.env.API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    'http://api:8080'
  )
}

/* ————————— list fetch (dashboard) ————————— */
export async function fetchUrls(page = 1, size = 20, q = '') {
  const r = await fetch(
    `${apiBase()}/api/v1/urls?page=${page}&size=${size}&q=${encodeURIComponent(q)}`,
    { cache: 'no-store' },
  )
  const json = await r.json()
  return {
    data: UrlListSchema.array().parse(json.data),
    total: json.total,
  }
}

/* ————————— detail fetch ————————— */
export async function fetchUrlDetail(id: number) {
  const r = await fetch(`${apiBase()}/api/v1/urls/${id}`, { cache: 'no-store' })
  if (!r.ok) throw new Error('not found')
  const json = await r.json()
  return UrlDetailSchema.parse(json)
}
export { apiBase } 