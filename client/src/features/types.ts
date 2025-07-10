/* client/src/features/urls/types.ts */

export interface LinkRow {
  href: string
  http_status: number | null
  is_internal: boolean
}

export interface UrlRow {
  id: number
  original_url: string
  title: string | null
  crawl_status: 'queued' | 'running' | 'done' | 'error'
  internal_links: number
  external_links: number
  broken_links: number
  html_version: string | null
  h1: number
  h2: number
  h3: number
  has_login: boolean
  created_at: string
  updated_at: string
  links?: LinkRow[]
}
