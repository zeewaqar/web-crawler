import { z } from 'zod'
const API = process.env.NEXT_PUBLIC_API_BASE ?? ''
export const UrlSchema = z.object({
    id: z.number(),
    original_url: z.string().url(),
    title: z.string().nullable(),
    crawl_status: z.enum(['queued', 'running', 'done', 'error']),
    internal_links: z.number(),
    external_links: z.number(),
    broken_links: z.number(),
    html_version: z.string().nullable(),
    created_at: z.string(),
})
export type UrlRow = z.infer<typeof UrlSchema>

export async function fetchUrls(page = 1, size = 20, q = '') {
    const r = await fetch(
        `${API}/api/v1/urls?page=${page}&size=${size}&q=${encodeURIComponent(q)}`,
        { cache: 'no-store' },
    )
    const json = await r.json()
    return {
        data: UrlSchema.array().parse(json.data),
        total: json.total,
    }
}
