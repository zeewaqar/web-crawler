import { fetchUrlDetail } from '@/features/urls/api'
import { BrokenLinkList } from '@/features/urls/components/BrokenLinkList'
import { LinkTypeChart } from '@/features/urls/components/LinkTypeChart'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function Page(props: any) {
  // Safe runtime narrowing ---------------------------------------------------
  const id = Number(props?.params?.id)
  if (!id) return <p className="p-6">Invalid URL id</p>

  const data = await fetchUrlDetail(id)

  // --------------------------------------------------------------------------
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold break-all">{data.original_url}</h1>

      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-medium mb-2">Link breakdown</h2>
          <LinkTypeChart
            internal={data.internal_links}
            external={data.external_links}
          />
        </div>

        <div>
          <h2 className="font-medium mb-2">Broken links</h2>
          <BrokenLinkList
            links={data.links.filter(
              (l) => l.http_status && l.http_status >= 400,
            )}
          />
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Meta</h2>
        <ul className="text-sm list-disc ml-5">
          <li>HTML version: {data.html_version ?? 'unknown'}</li>
          <li>Headings: h1={data.h1}  h2={data.h2}  h3={data.h3}</li>
          <li>Login form: {data.has_login ? 'yes' : 'no'}</li>
        </ul>
      </section>
    </main>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */
