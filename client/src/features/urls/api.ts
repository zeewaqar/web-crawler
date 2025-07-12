// src/features/urls/api.ts
import { z } from 'zod'

/* —————————————————— link schema —————————————————— */
export const LinkSchema = z.object({
  href:       z.string().url(),
  http_status: z.number().nullable(),
  is_internal: z.boolean(),
})

/* ————————— list schema (dashboard) ————————— */
export const UrlListSchema = z.object({
  id:             z.number(),
  original_url:   z.string().url(),
  title:          z.string().nullable(),
  crawl_status:   z.enum(['queued','running','done','error']),
  internal_links: z.number(),
  external_links: z.number(),
  broken_links:   z.number(),
  html_version:   z.string().nullable(),
  created_at:     z.string(),
}).strip()

/* ———————— detail schema (adds headings + links) ———————— */
export const UrlDetailSchema = UrlListSchema.extend({
  h1:        z.number(),
  h2:        z.number(),
  h3:        z.number(),
  has_login: z.boolean(),
  links:     LinkSchema.array().nullable().transform((v) => v ?? []),
})

export type UrlRow    = z.infer<typeof UrlListSchema>
export type UrlDetail = z.infer<typeof UrlDetailSchema>

/* ————————— runtime base URL helper ————————— */
export function apiBase() {
  return (
    process.env.API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    'http://api:8080'
  )
}

/** Always attaches your JWT from localStorage */
async function authFetch(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem('jwt')
  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  return fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  })
}

/* ————————— list fetch (dashboard) ————————— */
export async function fetchUrls(
  page = 1,
  size = 20,
  q = ''
): Promise<{ data: UrlRow[]; total: number }> {
  const res = await authFetch(
    `/api/v1/urls?page=${page}&size=${size}&q=${encodeURIComponent(q)}`
  )
  if (!res.ok) throw new Error('Failed to load URLs')
  const json = await res.json()
  return {
    data:  UrlListSchema.array().parse(json.data),
    total: json.total,
  }
}

/* ————————— detail fetch ————————— */
export async function fetchUrlDetail(id: number): Promise<UrlDetail> {
  const res = await authFetch(`/api/v1/urls/${id}`)
  if (!res.ok) throw new Error('URL not found')
  const json = await res.json()
  return UrlDetailSchema.parse(json)
}
